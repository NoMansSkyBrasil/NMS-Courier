param(
    [Parameter(Mandatory = $true)]
    [int]$GamePid,
    [Parameter(Mandatory = $true)]
    [int]$ExpectedOwnedCargoCapacity,
    [ValidateRange(1, 15)]
    [int]$ProbeSeconds = 8,
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
$state = @{}
foreach ($line in Get-Content -LiteralPath $logPath) {
    $parts = $line -split '=', 2
    if ($parts.Count -eq 2) { $state[$parts[0]] = $parts[1] }
}
if ($state.pid -ne "$GamePid" -or
    $state.status -notin @('observing', 'observation_complete') -or
    $state.hook_status -ne '0' -or $state.inventory_ready -ne '1' -or
    $state.currency_quicksilver_state -ne '2') {
    throw 'The verified one-shot offer has not been dispatched in this process.'
}

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class CourierOfferClassProbe {
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
$handle = [CourierOfferClassProbe]::OpenProcess($access, $false, $GamePid)
if ($handle -eq [IntPtr]::Zero) { throw 'OpenProcess failed for the verified game process.' }
function Read-Bytes([long]$address, [int]$count) {
    $data = [byte[]]::new($count)
    $read = [IntPtr]::Zero
    if (-not [CourierOfferClassProbe]::ReadProcessMemory(
        $handle, [IntPtr]::new($address), $data, $count, [ref]$read) -or
        $read.ToInt64() -ne $count) {
        throw "ReadProcessMemory failed at 0x$($address.ToString('x'))"
    }
    return $data
}
function Write-Bytes([long]$address, [byte[]]$data) {
    $written = [IntPtr]::Zero
    if (-not [CourierOfferClassProbe]::WriteProcessMemory(
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
function Assert-CStore([byte[]]$data, [int]$width, [int]$height,
                       [int]$capacity, [string]$label) {
    if ([BitConverter]::ToInt16($data, 0x80) -ne $width -or
        [BitConverter]::ToInt16($data, 0x82) -ne $height -or
        [BitConverter]::ToInt16($data, 0x84) -ne $capacity -or
        [BitConverter]::ToInt32($data, 0x100) -ne 0) {
        throw "$label does not match the verified C-class inventory header."
    }
}

$mainChanged = $false
$techChanged = $false
$offerMainClassAddress = 0L
$offerTechClassAddress = 0L
[byte[]]$originalMainClass = @()
[byte[]]$originalTechClass = @()
try {
    $base = [Diagnostics.Process]::GetProcessById($GamePid).MainModule.BaseAddress.ToInt64()
    $applicationData = [BitConverter]::ToInt64((Read-Bytes ($base + 0x06E7AAE8) 8), 0)
    if ($applicationData -eq 0) { throw 'Application data is not ready.' }
    $playerState = $applicationData + 0x0E70 + 0xAAD0
    $ownedMain = Read-Bytes ($playerState + 0x0910 + 7 * 0x248) 0x104
    $ownedTech = Read-Bytes ($playerState + 0x0910 + 8 * 0x248) 0x104
    if ([BitConverter]::ToInt16($ownedMain, 0x84) -ne $ExpectedOwnedCargoCapacity -or
        [BitConverter]::ToInt32($ownedMain, 0x100) -ne 0 -or
        [BitConverter]::ToInt16($ownedTech, 0x84) -ne 13 -or
        [BitConverter]::ToInt32($ownedTech, 0x100) -ne 0) {
        throw 'The owned freighter does not match the observed starting state.'
    }
    $offerMainAddress = $applicationData + 0x864930
    $offerTechAddress = $offerMainAddress + 2 * 0x248
    $offerMain = Read-Bytes $offerMainAddress 0x104
    $offerTech = Read-Bytes $offerTechAddress 0x104
    Assert-CStore $offerMain 10 12 120 'Offer cargo'
    Assert-CStore $offerTech 10 3 30 'Offer technology'
    if ([BitConverter]::ToInt32($offerTech, 0x8C) -lt 1) {
        throw 'The offer technology store lacks the active-preview element marker.'
    }
    $offerMainClassAddress = $offerMainAddress + 0x100
    $offerTechClassAddress = $offerTechAddress + 0x100
    [byte[]]$originalMainClass = Read-Bytes $offerMainClassAddress 4
    [byte[]]$originalTechClass = Read-Bytes $offerTechClassAddress 4
    if ($PreflightOnly) {
        Write-Output "offer_class_probe_preflight=ready pid=$GamePid mutation=false"
        return
    }
    [byte[]]$sClass = [BitConverter]::GetBytes([int]3)
    $mainChanged = $true
    Write-Bytes $offerMainClassAddress $sClass
    $techChanged = $true
    Write-Bytes $offerTechClassAddress $sClass
    for ($second = 0; $second -lt $ProbeSeconds; $second++) {
        Start-Sleep -Seconds 1
        $currentTech = Read-Bytes $offerTechAddress 0x104
        if ([BitConverter]::ToInt32($currentTech, 0x8C) -lt 1) {
            throw 'The offer preview closed while the temporary class probe was active.'
        }
    }
} finally {
    try {
        if ($techChanged) { Write-Bytes $offerTechClassAddress $originalTechClass }
        if ($mainChanged) { Write-Bytes $offerMainClassAddress $originalMainClass }
    } finally {
        [void][CourierOfferClassProbe]::CloseHandle($handle)
    }
}
Write-Output "offer_class_probe=completed temporary_class=S original_class_restored=C pid=$GamePid offer_outcome=unchanged"
