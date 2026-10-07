# Fish request for the build 180836 research profile: record one catch in the loaded slot's fishing
# record for every fish of the running game's fish table that has none, through the game's own catch
# routine. Fish bound to a mission are skipped. The catch size is drawn at random. Each recorded
# catch also counts in the game's fishing statistics and may complete milestones.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # Required to send the request: fill the record for every fish.
    [switch]$All,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if (!$All) { throw 'Give -All to fill the fishing record' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-fish-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
Send-ProfileEvent $session 'fish'
Write-Output 'Fishing record requested.'

for ($attempt = 0; $attempt -lt 10 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
Get-Content -LiteralPath $resultPath
