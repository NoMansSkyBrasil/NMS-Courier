# Fossil request for the build 180836 research profile: mark fossil products as seen through the
# game's own routine. The game keeps this list on the ACCOUNT, shared by every save slot, and
# synchronises account data with its servers. Only IDs of runtime/research/fossil-products.md are sent.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # One or several fossil product IDs, for example -Id FOS_HEAD_AN.
    [ValidatePattern('^FOS_[A-Z0-9_]{1,11}$')]
    [string[]]$Id,
    # Every fossil product of the table.
    [switch]$All,
    # With -All: only the individual bones, without the craftable display pieces.
    [switch]$BonesOnly,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if ([bool]$Id -eq [bool]$All) { throw 'Give either -Id or -All' }

# Rows of the generated Markdown data table: ID, Type, Craftable.
$tablePath = Join-Path $PSScriptRoot '..\..\..\research\fossil-products.md'
$fossils = [ordered]@{}
foreach ($line in Get-Content -LiteralPath $tablePath) {
    if ($line -match '^\| (FOS_[A-Z0-9_]{1,11}) \| (\w+) \| (yes|no) \|') { $fossils[$Matches[1]] = $Matches[2] }
}
if ($fossils.Count -lt 1) { throw 'Fossil products table is missing or empty' }

if ($All) {
    $requested = @($fossils.Keys | Where-Object { !$BonesOnly -or $fossils[$_] -eq 'ExhibitBone' })
} else {
    $requested = @($Id | Select-Object -Unique)
    foreach ($entry in $requested) { if (!$fossils.Contains($entry)) { throw "Unknown fossil product: $entry" } }
}
if ($requested.Count -lt 1 -or $requested.Count -gt 512) { throw 'A request carries 1 to 512 fossil products' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-fossil-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
Write-ProfileRequest $session 'fossil' @($requested | ForEach-Object { "id=$_" })
Send-ProfileEvent $session 'fossil'
Write-Output "$($requested.Count) fossil products requested (account-level list)."

for ($attempt = 0; $attempt -lt 10 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
$lines = Get-Content -LiteralPath $resultPath
$lines | Select-Object -First 1
$lines | Select-Object -Skip 1 | Group-Object { ($_ -split '=', 2)[1] } | ForEach-Object { "$($_.Name): $($_.Count)" }
$lines | Select-Object -Skip 1 | Where-Object { $_ -notmatch '=(added|not_added)$' }
