param(
    [Parameter(Mandatory = $true)]
    [int]$GamePid
)

$ErrorActionPreference = 'Stop'
$gameProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $GamePid"
if (-not $gameProcess -or $gameProcess.Name -ne 'NMS.exe') {
    throw 'The selected NMS process is not running.'
}
$gameDirectory = Split-Path -Parent (Split-Path -Parent $gameProcess.ExecutablePath)
$rewardTable = Join-Path $gameDirectory 'GAMEDATA\MODS\NMSCourierCurrencyRewardProbe\METADATA\REALITY\TABLES\REWARDTABLE.EXML'
if (-not (Test-Path -LiteralPath $rewardTable) -or
    (Get-FileHash -Algorithm SHA256 -LiteralPath $rewardTable).Hash -ne
    '0745A424670C848EE17E7DF5621236BD11B355DD8BD8F0640F3A20ABBC1F45A3') {
    throw 'The exact freighter-specific reward patch is not installed.'
}

# The known-good bridge has three one-shot event slots. For this isolated test,
# the third slot is temporarily mapped to a freighter reward in the EXML patch.
# The event name refers to the bridge slot, not the payload being delivered.
& (Join-Path $PSScriptRoot 'signal-currency-test.ps1') `
    -GamePid $GamePid -Currency Quicksilver -ObservedBalance 0 | Out-Null
if (-not $?) { throw 'The one-shot bridge event was not signaled.' }
Write-Output "freighter_reward_signal_sent pid=$GamePid outcome=unknown_until_game_ui_checked"
