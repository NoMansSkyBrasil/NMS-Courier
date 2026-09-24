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
    '9E347D0464A7CB3E1ADB32BC33B6C6788C2C9231A81FCF93DA0738CCDC053CD1' -or
    (Get-FileHash -Algorithm SHA256 -LiteralPath $rewardTable).Hash -ne
    '0745A424670C848EE17E7DF5621236BD11B355DD8BD8F0640F3A20ABBC1F45A3') {
    throw 'The pinned scoped bridge or freighter reward patch is not installed.'
}
$logPath = Join-Path $env:LOCALAPPDATA "NMSCourier\diagnostics\native-hook-$GamePid.log"
if (-not (Test-Path -LiteralPath $logPath)) { throw 'Native hook log is missing.' }
$state = @{}
foreach ($line in Get-Content -LiteralPath $logPath) {
    $parts = $line -split '=', 2
    if ($parts.Count -eq 2) { $state[$parts[0]] = $parts[1] }
}
if ($state.pid -ne "$GamePid" -or $state.status -ne 'observing' -or
    $state.hook_status -ne '0' -or [int]$state.callback_count -le 0 -or
    $state.inventory_ready -ne '1' -or
    $state.currency_quicksilver_state -ne '0') {
    throw 'The exact-build one-shot scoped reward bridge is not ready.'
}
$eventName = $state.currency_quicksilver_event
if ($eventName -notmatch "^Local\\NMSCourierCurrencyTest-$GamePid-[0-9a-f]{32}-Quicksilver$") {
    throw 'The test event name is invalid.'
}
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class CourierScopedFreighterEvent {
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern IntPtr OpenEventW(uint access, bool inherit, string name);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool SetEvent(IntPtr handle);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool CloseHandle(IntPtr handle);
}
'@
$handle = [CourierScopedFreighterEvent]::OpenEventW(2, $false, $eventName)
if ($handle -eq [IntPtr]::Zero) { throw 'OpenEventW failed.' }
try {
    if (-not [CourierScopedFreighterEvent]::SetEvent($handle)) {
        throw 'SetEvent failed.'
    }
} finally {
    [void][CourierScopedFreighterEvent]::CloseHandle($handle)
}
Write-Output "scoped_freighter_reward_signaled pid=$GamePid outcome=unknown_until_game_ui_checked"
