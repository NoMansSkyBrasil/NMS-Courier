param(
    [Parameter(Mandatory = $true)]
    [int]$GamePid,
    [Parameter(Mandatory = $true)]
    [int]$ExpectedOwnedCargoCapacity,
    [switch]$PreflightOnly
)

$ErrorActionPreference = 'Stop'
if ($ExpectedOwnedCargoCapacity -notin @(35, 120)) {
    throw 'Expected owned cargo capacity must be an observed value: 35 or 120.'
}
$game = Get-CimInstance Win32_Process -Filter "ProcessId = $GamePid"
if (-not $game -or $game.Name -ne 'NMS.exe') {
    throw 'The selected NMS process is not running.'
}
$gameDirectory = Split-Path -Parent (Split-Path -Parent $game.ExecutablePath)
$proxy = Join-Path (Split-Path -Parent $game.ExecutablePath) 'xinput9_1_0.dll'
$rewardTable = Join-Path $gameDirectory 'GAMEDATA\MODS\NMSCourierCurrencyRewardProbe\METADATA\REALITY\TABLES\REWARDTABLE.EXML'
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $game.ExecutablePath).Hash -ne
    'B7913F268DFC62386B6B68F524BFC8ADE4A44A9F4FBAD39085B7BF51BE3680CB' -or
    (Get-FileHash -Algorithm SHA256 -LiteralPath $proxy).Hash -ne
    'F20D9B41344FC7460471979F56598108ED8F750327A202B879A0716D651A441D' -or
    (Get-FileHash -Algorithm SHA256 -LiteralPath $rewardTable).Hash -ne
    '62840D2810E5CA2B30DCCDE5F75B9AB5D5CE07ADE92EA1E2BB30BA555A9E9732') {
    throw 'The executable, bridge, or explicit reward does not match the pinned test.'
}
$logPath = Join-Path $env:LOCALAPPDATA "NMSCourier\diagnostics\native-hook-$GamePid.log"
if (-not (Test-Path -LiteralPath $logPath)) { throw 'Native hook log is missing.' }
function Read-HookState {
    $state = @{}
    foreach ($line in Get-Content -LiteralPath $logPath) {
        $parts = $line -split '=', 2
        if ($parts.Count -eq 2) { $state[$parts[0]] = $parts[1] }
    }
    return $state
}
$state = Read-HookState
if ($state.pid -ne "$GamePid" -or $state.status -ne 'observing' -or
    $state.hook_status -ne '0' -or $state.inventory_ready -ne '1' -or
    $state.currency_quicksilver_state -ne '0') {
    throw 'The one-shot reward bridge is not ready in this process.'
}

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class CourierFreighterClassWindow {
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern IntPtr OpenProcess(int access, bool inherit, int pid);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool CloseHandle(IntPtr process);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool ReadProcessMemory(IntPtr process, IntPtr address,
        [Out] byte[] buffer, int size, out IntPtr bytesRead);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool WriteProcessMemory(IntPtr process, IntPtr address,
        byte[] buffer, int size, out IntPtr bytesWritten);
}
'@
$access = 0x0400 -bor 0x0010 -bor 0x0020 -bor 0x0008
$handle = [CourierFreighterClassWindow]::OpenProcess($access, $false, $GamePid)
if ($handle -eq [IntPtr]::Zero) { throw 'OpenProcess failed for the verified game process.' }
function Read-Bytes([long]$address, [int]$count) {
    $data = [byte[]]::new($count)
    $read = [IntPtr]::Zero
    if (-not [CourierFreighterClassWindow]::ReadProcessMemory(
        $handle, [IntPtr]::new($address), $data, $count, [ref]$read) -or
        $read.ToInt64() -ne $count) {
        throw "ReadProcessMemory failed at 0x$($address.ToString('x'))"
    }
    return $data
}
function Write-Bytes([long]$address, [byte[]]$data) {
    $written = [IntPtr]::Zero
    if (-not [CourierFreighterClassWindow]::WriteProcessMemory(
        $handle, [IntPtr]::new($address), $data, $data.Length, [ref]$written) -or
        $written.ToInt64() -ne $data.Length) {
        throw "WriteProcessMemory failed at 0x$($address.ToString('x'))"
    }
    $actual = Read-Bytes $address $data.Length
    for ($index = 0; $index -lt $data.Length; $index++) {
        if ($actual[$index] -ne $data[$index]) {
            throw 'Memory readback did not match the requested bytes.'
        }
    }
}

$changed = $false
$signaled = $false
$observed = 'none'
try {
    $base = [Diagnostics.Process]::GetProcessById($GamePid).MainModule.BaseAddress.ToInt64()
    $applicationData = [BitConverter]::ToInt64((Read-Bytes ($base + 0x06E7AAE8) 8), 0)
    if ($applicationData -eq 0) { throw 'Application data is not ready.' }
    $playerState = $applicationData + 0x0E70 + 0xAAD0
    $owned = Read-Bytes ($playerState + 0x0910 + 7 * 0x248) 0x104
    $ownedTech = Read-Bytes ($playerState + 0x0910 + 8 * 0x248) 0x104
    if ([BitConverter]::ToInt16($owned, 0x84) -ne $ExpectedOwnedCargoCapacity -or
        [BitConverter]::ToInt32($owned, 0x100) -ne 0 -or
        [BitConverter]::ToInt16($ownedTech, 0x84) -ne 13) {
        throw 'The loaded save does not match the user-confirmed owned freighter state.'
    }
    $offerStore = $applicationData + 0x864930
    $offerBefore = Read-Bytes $offerStore 0x104
    if ([BitConverter]::ToInt16($offerBefore, 0x80) -ne 1 -or
        [BitConverter]::ToInt16($offerBefore, 0x82) -ne 1 -or
        [BitConverter]::ToInt16($offerBefore, 0x84) -ne 1) {
        throw 'The frontend offer store is not in its observed empty state.'
    }
    $table = [BitConverter]::ToInt64((Read-Bytes ($applicationData + 0x60 + 0x1B8) 8), 0)
    if ($table -eq 0) { throw 'Inventory table is not ready.' }
    $probabilityAddress = $table + 0x1A54
    [byte[]]$original = Read-Bytes $probabilityAddress 0x40
    $baseline = @(@(60, 30, 10, 0), @(49, 35, 15, 1),
                  @(30, 40, 28, 2), @(5, 5, 5, 5))
    for ($group = 0; $group -lt 4; $group++) {
        for ($tier = 0; $tier -lt 4; $tier++) {
            if ([BitConverter]::ToSingle($original, $group * 16 + $tier * 4) -ne
                $baseline[$group][$tier]) {
                throw 'Class probability baseline does not match the verified table.'
            }
        }
    }
    if ($PreflightOnly) {
        Write-Output "freighter_class_window_preflight=ready pid=$GamePid owned_cargo_capacity=$ExpectedOwnedCargoCapacity mutation=false"
        return
    }
    [byte[]]$onlyS = $original.Clone()
    for ($group = 0; $group -lt 4; $group++) {
        for ($tier = 0; $tier -lt 4; $tier++) {
            $chance = if ($tier -eq 3) { [float]100 } else { [float]0 }
            [Array]::Copy([BitConverter]::GetBytes($chance), 0,
                $onlyS, $group * 16 + $tier * 4, 4)
        }
    }
    $changed = $true
    Write-Bytes $probabilityAddress $onlyS
    & (Join-Path $PSScriptRoot 'signal-explicit-freighter-test.ps1') -GamePid $GamePid | Out-Null
    $signaled = $true
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 400
        $offer = Read-Bytes $offerStore 0x104
        if ([BitConverter]::ToInt16($offer, 0x84) -eq 120 -and
            [BitConverter]::ToInt16($offer, 0x80) -eq 10 -and
            [BitConverter]::ToInt16($offer, 0x82) -eq 12) {
            $class = [BitConverter]::ToInt32($offer, 0x100)
            $observed = if ($class -eq 3) { 'S' } elseif ($class -eq 0) { 'C' } else { "class_$class" }
            break
        }
    }
} finally {
    try {
        if ($changed) { Write-Bytes $probabilityAddress $original }
    } finally {
        [void][CourierFreighterClassWindow]::CloseHandle($handle)
    }
}
Write-Output "freighter_class_window_signaled=$signaled offer_class=$observed table_restored=true pid=$GamePid outcome=unknown_until_ui_checked"
