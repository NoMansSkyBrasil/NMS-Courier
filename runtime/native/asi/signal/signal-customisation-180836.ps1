# Customisation requests for the build 180836 research profile: record in the loaded save slot the
# specials that unlock character customisation options, banners, jetpack trails, textures and titles.
# Uses the profile's `redeem` event, which calls the game's own slot-side routine for one ID and does
# not touch the account lists. Only IDs classed `customisation` in
# runtime/research/product-delivery-classification.md are sent.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # One or several IDs, for example -Id BANNER_NMSA.
    [ValidatePattern('^[A-Z0-9_]{1,15}$')]
    [string[]]$Id,
    # Every ID of the customisation class.
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

# Rows of the generated Markdown data table: ID, Class, Type, Craftable, WikiCategory, Ingredients.
$tablePath = Join-Path $PSScriptRoot '..\..\..\research\product-delivery-classification.md'
$known = @()
foreach ($line in Get-Content -LiteralPath $tablePath) {
    if ($line -match '^\| ([A-Z0-9_]{1,15}) \| customisation \|') { $known += $Matches[1] }
}
if ($known.Count -lt 1) { throw 'Product classification table is missing or has no customisation class' }

if ($All) {
    $requested = $known
} else {
    $requested = @($Id | Select-Object -Unique)
    foreach ($entry in $requested) {
        if ($entry -notin $known) { throw "Not a customisation ID: $entry" }
    }
}
if ($requested.Count -lt 1 -or $requested.Count -gt 512) { throw 'A request carries 1 to 512 IDs' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-redeem-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
Write-ProfileRequest $session 'redeem' @($requested | ForEach-Object { "id=$_" })
Send-ProfileEvent $session 'redeem'
Write-Output "$($requested.Count) customisation IDs requested."

for ($attempt = 0; $attempt -lt 10 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
$lines = Get-Content -LiteralPath $resultPath
$lines | Select-Object -First 3
$lines | Select-Object -Skip 3 | Group-Object { ($_ -split '=', 2)[1] } | ForEach-Object { "$($_.Name): $($_.Count)" }
$lines | Select-Object -Skip 3 | Where-Object { $_ -notmatch '=(changed|no_change)$' }
