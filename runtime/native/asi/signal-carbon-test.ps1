param(
    [Parameter(Mandatory = $true)]
    [int]$GamePid
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
    '7A1FC34D82A91C4FCA5028A18D318E776581C518C92B8935E062A5916210F3BC') {
    throw 'The installed native DLL is not the pinned delivery test build.'
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
if ($state.pid -ne "$GamePid" -or $state.status -ne 'observing' -or
    $state.hook_status -ne '0' -or [int]$state.callback_count -le 0 -or
    $state.inventory_ready -ne '1' -or [int]$state.carbon_stacks -le 0 -or
    $state.delivery_state -ne '0') {
    throw 'The native callback, inventory, or one-shot delivery state is not ready.'
}
$eventName = $state.trigger_event
if ($eventName -notmatch '^Local\\NMSCourierCarbonTest-[0-9]+-[0-9a-f]{32}$') {
    throw 'The test event name is invalid.'
}

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class CourierTestEvent {
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
$handle = [CourierTestEvent]::OpenEventW(2, $false, $eventName)
if ($handle -eq [IntPtr]::Zero) {
    throw "OpenEventW failed: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
}
try {
    if (-not [CourierTestEvent]::SetEvent($handle)) {
        throw "SetEvent failed: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
    }
} finally {
    [void][CourierTestEvent]::CloseHandle($handle)
}
Write-Output "trigger_sent pid=$GamePid baseline_carbon=$($state.carbon_quantity)"
