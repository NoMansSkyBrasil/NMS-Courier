# Currency requests for the build 180836 research profile: units, nanites or quicksilver of any amount
# through the game's own reward routine, which adds the money to the loaded save slot, keeps the
# game's maximum and shows the game's notification. The profile uses an entry of the data file in
# runtime/mods/currency_rewards as the carrier; without that file in the game's mod folder the game
# has no such reward and the result says unknown_reward.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    [ValidateSet('units', 'nanites', 'quicksilver')]
    [string]$Currency,
    # 1 to 4294967295, the largest balance the game keeps.
    [ValidateRange(1, 4294967295)]
    [long]$Amount,
    # Let the game show its own notification; without it nothing is shown.
    [switch]$ShowAlert,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if (!$Currency -or !$Amount) { throw 'Give -Currency and -Amount' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-currency-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
Write-ProfileRequest $session 'currency' @("currency=$Currency", "amount=$Amount", "silent=$([int](!$ShowAlert))")
Send-ProfileEvent $session 'currency'
Write-Output "$Amount $Currency requested."

# The game thread applies the request on its next update; the profile then writes the result:
# given, unknown_reward (data file not loaded), bad_layout or not_ready.
for ($attempt = 0; $attempt -lt 10 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
Get-Content -LiteralPath $resultPath
