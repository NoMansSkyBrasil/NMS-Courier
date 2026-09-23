param(
    [Parameter(Mandatory = $true)]
    [int]$GamePid,
    [Parameter(Mandatory = $true)]
    [ValidateSet('Units', 'Nanites', 'Quicksilver')]
    [string]$Currency,
    [Parameter(Mandatory = $true)]
    [ValidateRange(0, 3294967294)]
    [long]$ObservedBalance
)

$ErrorActionPreference = 'Stop'
$gameProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $GamePid"
if (-not $gameProcess -or $gameProcess.Name -ne 'NMS.exe') {
    throw 'The selected NMS process is not running.'
}
$gameExecutable = $gameProcess.ExecutablePath
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $gameExecutable).Hash -ne
    'B7913F268DFC62386B6B68F524BFC8ADE4A44A9F4FBAD39085B7BF51BE3680CB') {
    throw 'The game executable is not the exact test build.'
}
$proxy = Join-Path (Split-Path -Parent $gameExecutable) 'xinput9_1_0.dll'
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $proxy).Hash -ne
    'F20D9B41344FC7460471979F56598108ED8F750327A202B879A0716D651A441D') {
    throw 'The installed native DLL is not the pinned currency test build.'
}

$logPath = Join-Path $env:LOCALAPPDATA "NMSCourier\diagnostics\native-hook-$GamePid.log"
if (-not (Test-Path -LiteralPath $logPath)) {
    throw 'No native callback log exists for this process.'
}
$state = @{}
foreach ($line in Get-Content -LiteralPath $logPath) {
    $parts = $line -split '=', 2
    if ($parts.Count -eq 2) { $state[$parts[0]] = $parts[1] }
}
$key = $Currency.ToLowerInvariant()
if ($state.pid -ne "$GamePid" -or $state.status -ne 'observing' -or
    $state.hook_status -ne '0' -or [int]$state.callback_count -le 0 -or
    $state.inventory_ready -ne '1' -or $state["currency_${key}_state"] -ne '0') {
    throw 'The native callback, inventory, or one-shot currency state is not ready.'
}
if (($Currency -eq 'Nanites' -and $state.currency_units_state -ne '2') -or
    ($Currency -eq 'Quicksilver' -and
        ($state.currency_units_state -ne '2' -or $state.currency_nanites_state -ne '2'))) {
    throw 'Earlier currency calls have not been dispatched and independently checked.'
}
$eventName = $state["currency_${key}_event"]
if ($eventName -notmatch "^Local\\NMSCourierCurrencyTest-$GamePid-[0-9a-f]{32}-$Currency$") {
    throw 'The test event name is invalid.'
}

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class CourierCurrencyTestEvent {
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern IntPtr OpenEventW(uint desiredAccess, bool inheritHandle, string name);
    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetEvent(IntPtr handle);
    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool CloseHandle(IntPtr handle);
}
'@
$handle = [CourierCurrencyTestEvent]::OpenEventW(2, $false, $eventName)
if ($handle -eq [IntPtr]::Zero) {
    throw "OpenEventW failed: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
}
try {
    if (-not [CourierCurrencyTestEvent]::SetEvent($handle)) {
        throw "SetEvent failed: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
    }
} finally {
    [void][CourierCurrencyTestEvent]::CloseHandle($handle)
}
Write-Output "trigger_sent pid=$GamePid currency=$Currency observed_balance=$ObservedBalance outcome=unknown_until_game_ui_checked"
