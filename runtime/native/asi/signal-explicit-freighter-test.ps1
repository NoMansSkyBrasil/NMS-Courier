param(
    [Parameter(Mandatory = $true)]
    [int]$GamePid
)

$ErrorActionPreference = 'Stop'
$game = Get-CimInstance Win32_Process -Filter "ProcessId = $GamePid"
if (-not $game -or $game.Name -ne 'NMS.exe') {
    throw 'The selected NMS process is not running.'
}
$gameDirectory = Split-Path -Parent (Split-Path -Parent $game.ExecutablePath)
$rewardTable = Join-Path $gameDirectory 'GAMEDATA\MODS\NMSCourierCurrencyRewardProbe\METADATA\REALITY\TABLES\REWARDTABLE.EXML'
if (-not (Test-Path -LiteralPath $rewardTable) -or
    (Get-FileHash -Algorithm SHA256 -LiteralPath $rewardTable).Hash -ne
    '62840D2810E5CA2B30DCCDE5F75B9AB5D5CE07ADE92EA1E2BB30BA555A9E9732') {
    throw 'The exact explicit-inventory reward patch is not installed.'
}

# The third event in the proven bridge is mapped to a freighter reward for this test.
& (Join-Path $PSScriptRoot 'signal-currency-test.ps1') `
    -GamePid $GamePid -Currency Quicksilver -ObservedBalance 0 | Out-Null
if (-not $?) { throw 'The one-shot bridge event was not signaled.' }
Write-Output "explicit_freighter_reward_signaled pid=$GamePid outcome=unknown_until_game_ui_checked"
