param(
    [Parameter(Mandatory = $true)]
    [int]$GamePid
)

$ErrorActionPreference = 'Stop'
$game = Get-CimInstance Win32_Process -Filter "ProcessId = $GamePid"
if (-not $game -or $game.Name -ne 'NMS.exe') {
    throw 'The selected NMS process is not running.'
}
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $game.ExecutablePath).Hash -ne
    'B7913F268DFC62386B6B68F524BFC8ADE4A44A9F4FBAD39085B7BF51BE3680CB') {
    throw 'The game executable is not the verified build.'
}
$gameDirectory = Split-Path -Parent (Split-Path -Parent $game.ExecutablePath)
$proxy = Join-Path (Split-Path -Parent $game.ExecutablePath) 'xinput9_1_0.dll'
$rewardTable = Join-Path $gameDirectory 'GAMEDATA\MODS\NMSCourierCurrencyRewardProbe\METADATA\REALITY\TABLES\REWARDTABLE.EXML'
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $proxy).Hash -ne
    'F20D9B41344FC7460471979F56598108ED8F750327A202B879A0716D651A441D' -or
    (Get-FileHash -Algorithm SHA256 -LiteralPath $rewardTable).Hash -ne
    '0745A424670C848EE17E7DF5621236BD11B355DD8BD8F0640F3A20ABBC1F45A3') {
    throw 'The pinned bridge or freighter reward patch is not installed.'
}
$logPath = Join-Path $env:LOCALAPPDATA "NMSCourier\diagnostics\native-hook-$GamePid.log"
if (-not (Test-Path -LiteralPath $logPath)) { throw 'Native hook log is missing.' }
function Read-HookState {
    $result = @{}
    foreach ($line in Get-Content -LiteralPath $logPath) {
        $parts = $line -split '=', 2
        if ($parts.Count -eq 2) { $result[$parts[0]] = $parts[1] }
    }
    return $result
}
$state = Read-HookState
if ($state.pid -ne "$GamePid" -or $state.status -ne 'observing' -or
    $state.hook_status -ne '0' -or $state.inventory_ready -ne '1' -or
    $state.currency_quicksilver_state -ne '0') {
    throw 'The exact-build one-shot reward bridge is not ready.'
}

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class CourierScopedInventoryTable {
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
$handle = [CourierScopedInventoryTable]::OpenProcess($access, $false, $GamePid)
if ($handle -eq [IntPtr]::Zero) { throw 'OpenProcess failed for the exact-build process.' }
function Read-Bytes([long]$address, [int]$count) {
    $data = [byte[]]::new($count)
    $read = [IntPtr]::Zero
    if (-not [CourierScopedInventoryTable]::ReadProcessMemory(
        $handle, [IntPtr]::new($address), $data, $count, [ref]$read) -or
        $read.ToInt64() -ne $count) {
        throw "ReadProcessMemory failed at 0x$($address.ToString('x'))"
    }
    return $data
}
function Write-Bytes([long]$address, [byte[]]$data) {
    $written = [IntPtr]::Zero
    if (-not [CourierScopedInventoryTable]::WriteProcessMemory(
        $handle, [IntPtr]::new($address), $data, $data.Length, [ref]$written) -or
        $written.ToInt64() -ne $data.Length) {
        throw "WriteProcessMemory failed at 0x$($address.ToString('x'))"
    }
    $actual = Read-Bytes $address $data.Length
    if (-not [System.Linq.Enumerable]::SequenceEqual[byte]($actual, $data)) {
        throw "Memory verification failed at 0x$($address.ToString('x'))"
    }
}

$generationChanged = $false
$probabilitiesChanged = $false
$outcome = 'not_signaled'
try {
    $base = [Diagnostics.Process]::GetProcessById($GamePid).MainModule.BaseAddress.ToInt64()
    $applicationData = [BitConverter]::ToInt64((Read-Bytes ($base + 0x06E7AAE8) 8), 0)
    if ($applicationData -eq 0) { throw 'Application data is not ready.' }
    $playerState = $applicationData + 0x0E70 + 0xAAD0
    $freighterStore = $playerState + 0x0910 + 7 * 0x248
    $freighterTechStore = $playerState + 0x0910 + 8 * 0x248
    $ownedHeader = Read-Bytes $freighterStore 0x104
    $techHeader = Read-Bytes $freighterTechStore 0x104
    if ([BitConverter]::ToInt16($ownedHeader, 0x84) -ne 35 -or
        [BitConverter]::ToInt32($ownedHeader, 0x100) -ne 0 -or
        [BitConverter]::ToInt16($techHeader, 0x84) -ne 13) {
        throw 'The loaded save is not the validated disposable freighter state.'
    }
    $table = [BitConverter]::ToInt64((Read-Bytes ($applicationData + 0x60 + 0x1B8) 8), 0)
    if ($table -eq 0) { throw 'Inventory table is not ready.' }
    $generationAddress = $table + 0x5E0 + 0x1D * 0x54
    $probabilityAddress = $table + 0x1A54
    [byte[]]$originalGeneration = Read-Bytes $generationAddress 0x54
    [byte[]]$originalProbabilities = Read-Bytes $probabilityAddress 0x40
    $generationValues = @(
        [BitConverter]::ToInt32($originalGeneration, 0x4C),
        [BitConverter]::ToInt32($originalGeneration, 0x40),
        [BitConverter]::ToInt32($originalGeneration, 0x50),
        [BitConverter]::ToInt32($originalGeneration, 0x44)
    )
    if (($generationValues -join ',') -ne '35,48,18,30') {
        throw 'Freighter generation baseline does not match the verified game data.'
    }
    $expectedProbabilities = @(
        @(60, 30, 10, 0), @(49, 35, 15, 1),
        @(30, 40, 28, 2), @(5, 5, 5, 5)
    )
    for ($group = 0; $group -lt 4; $group++) {
        for ($tier = 0; $tier -lt 4; $tier++) {
            if ([BitConverter]::ToSingle($originalProbabilities, $group * 16 + $tier * 4) -ne
                $expectedProbabilities[$group][$tier]) {
                throw 'Class probability baseline does not match the verified game data.'
            }
        }
    }
    [byte[]]$testGeneration = $originalGeneration.Clone()
    foreach ($field in @(@(0x40, 120), @(0x44, 60), @(0x4C, 120), @(0x50, 60))) {
        [Array]::Copy([BitConverter]::GetBytes([int]$field[1]), 0,
            $testGeneration, [int]$field[0], 4)
    }
    [byte[]]$testProbabilities = $originalProbabilities.Clone()
    for ($group = 0; $group -lt 4; $group++) {
        for ($tier = 0; $tier -lt 4; $tier++) {
            $chance = if ($tier -eq 3) { [float]100 } else { [float]0 }
            [Array]::Copy([BitConverter]::GetBytes($chance), 0,
                $testProbabilities, $group * 16 + $tier * 4, 4)
        }
    }
    $generationChanged = $true
    Write-Bytes $generationAddress $testGeneration
    $probabilitiesChanged = $true
    Write-Bytes $probabilityAddress $testProbabilities

    # This named event is consumed once by the already verified in-process bridge.
    & (Join-Path $PSScriptRoot 'signal-specific-freighter-test.ps1') -GamePid $GamePid | Out-Null
    $outcome = 'signaled_unknown'
    for ($attempt = 0; $attempt -lt 25; $attempt++) {
        Start-Sleep -Milliseconds 400
        $state = Read-HookState
        if ($state.currency_quicksilver_state -eq '2') {
            # The hook records state 2 before invoking the game function.
            # Wait beyond the next diagnostic interval before restoring data.
            Start-Sleep -Seconds 3
            $outcome = 'dispatched_ui_unverified'
            break
        }
    }
} finally {
    try {
        if ($probabilitiesChanged) { Write-Bytes $probabilityAddress $originalProbabilities }
        if ($generationChanged) { Write-Bytes $generationAddress $originalGeneration }
    } finally {
        [void][CourierScopedInventoryTable]::CloseHandle($handle)
    }
}
Write-Output "scoped_freighter_test=$outcome generation_table_restored=true pid=$GamePid"
