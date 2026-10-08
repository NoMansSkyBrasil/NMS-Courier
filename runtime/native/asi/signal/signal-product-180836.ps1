# Product requests for the build 180836 research profile: teach product recipes to the loaded save
# slot through the game's own learn routine. Only IDs of the classes named below in
# runtime/research/product-delivery-classification.md are sent; the profile checks each one again
# against the running game's own definition. The game's routine also marks a learned product as seen
# on the account.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # One or several product IDs, for example -Id ALLOY1 or -Id ALLOY1,COMPOUND2.
    [ValidatePattern('^[A-Z0-9_]{1,15}$')]
    [string[]]$Id,
    # Every product of one deliverable class: the catalogue's items, technology or build parts, or the
    # products the catalogue hides but a research tree of the game offers, or the hidden products that
    # unlock a customisation option.
    [ValidateSet('catalogue_item', 'catalogue_technology', 'catalogue_construction', 'research_tree', 'customisation')]
    [string]$AllOfClass,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if ([bool]$Id -eq [bool]$AllOfClass) { throw 'Give either -Id or -AllOfClass' }

# Rows of the generated Markdown data table: ID, Class, Type, Craftable, WikiCategory, Ingredients.
$tablePath = Join-Path $PSScriptRoot '..\..\..\research\product-delivery-classification.md'
$deliverable = @('catalogue_item', 'catalogue_technology', 'catalogue_construction', 'research_tree', 'customisation')
$classes = [ordered]@{}
foreach ($line in Get-Content -LiteralPath $tablePath) {
    if ($line -match '^\| ([A-Z0-9_]{1,15}) \| (\w+) \|') { $classes[$Matches[1]] = $Matches[2] }
}
if ($classes.Count -lt 1) { throw 'Product classification table is missing or empty' }

if ($AllOfClass) {
    $requested = @($classes.Keys | Where-Object { $classes[$_] -eq $AllOfClass })
} else {
    $requested = @($Id | Select-Object -Unique)
    foreach ($entry in $requested) {
        if (!$classes.Contains($entry)) { throw "Unknown product ID: $entry" }
        if ($classes[$entry] -notin $deliverable) { throw "Product $entry is not delivered ($($classes[$entry]))" }
    }
}
if ($requested.Count -lt 1 -or $requested.Count -gt 2048) { throw 'A request carries 1 to 2048 products' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-product-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
Write-ProfileRequest $session 'product' @($requested | ForEach-Object { "id=$_" })
Send-ProfileEvent $session 'product'
Write-Output "$($requested.Count) products requested."

for ($attempt = 0; $attempt -lt 15 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
$lines = Get-Content -LiteralPath $resultPath
$lines | Select-Object -First 3
$lines | Select-Object -Skip 3 | Group-Object { ($_ -split '=', 2)[1] } | ForEach-Object { "$($_.Name): $($_.Count)" }
$lines | Select-Object -Skip 3 | Where-Object { $_ -notmatch '=(learned|not_added)$' } | Select-Object -First 30
