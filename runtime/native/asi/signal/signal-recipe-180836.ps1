# Recipe requests for the build 180836 research profile: teach refiner and cooking recipes to the
# loaded save slot through the game's own merge routine. The profile takes the recipes from the
# running game's recipe table; an ID that the table does not contain is reported, never sent.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # One or several recipe IDs, for example -Id REFINERECIPE_10 or -Id RECIPE_1,RECIPE_2.
    [ValidatePattern('^[A-Z0-9_]{1,31}$')]
    [string[]]$Id,
    # Every recipe of the running game's recipe table.
    [switch]$All,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if ([bool]$Id -eq [bool]$All) { throw 'Give either -Id or -All' }
$requested = @($Id | Select-Object -Unique)
if (!$All -and ($requested.Count -lt 1 -or $requested.Count -gt 4096)) { throw 'A request carries 1 to 4096 recipes' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-recipe-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
$lines = if ($All) { @('all=1') } else { @($requested | ForEach-Object { "id=$_" }) }
Write-ProfileRequest $session 'recipe' $lines
Send-ProfileEvent $session 'recipes'
Write-Output $(if ($All) { 'All recipes requested.' } else { "$($requested.Count) recipes requested." })

# The game thread applies the request on its next update; the profile then writes the counters.
for ($attempt = 0; $attempt -lt 10 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
Get-Content -LiteralPath $resultPath
