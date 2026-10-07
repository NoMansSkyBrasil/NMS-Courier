# Technology requests for the build 180836 research profile: teach one, several or every
# deliverable technology through the game's own learn routine. Entries classed as blocked in
# runtime/research/technology-delivery-classification.md are refused here, and again by the profile
# from the running game's own definitions.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # One or several technology IDs, for example -Id UT_JET or -Id UT_JET,STRONGLASER.
    [ValidatePattern('^[A-Z0-9_]{1,15}$')]
    [string[]]$Id,
    # Every entry classed as deliverable.
    [switch]$All,
    # Let the game show its own new-technology alert for each entry instead of teaching silently.
    [switch]$ShowAlert,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if ([bool]$Id -eq [bool]$All) { throw 'Give either -Id or -All' }

# Class of every known entry, from the generated Markdown data table (cells: ID, Category, Class, ...).
$classPath = Join-Path $PSScriptRoot '..\..\..\research\technology-delivery-classification.md'
$classes = [ordered]@{}
foreach ($line in Get-Content -LiteralPath $classPath) {
    if ($line -match '^\| ([A-Z0-9_]{1,15}) \| \w+ \| (\w+) \|') { $classes[$Matches[1]] = $Matches[2] }
}
if ($classes.Count -lt 1) { throw 'Technology classification table is missing or empty' }

if ($All) {
    $requested = @($classes.Keys | Where-Object { $classes[$_] -eq 'deliverable' })
} else {
    $requested = @($Id | Select-Object -Unique)
    foreach ($entry in $requested) {
        if (!$classes.Contains($entry)) { throw "Unknown technology ID: $entry" }
        if ($classes[$entry] -ne 'deliverable') { throw "Technology $entry is never delivered ($($classes[$entry]))" }
    }
}
if ($requested.Count -lt 1 -or $requested.Count -gt 256) { throw 'A request carries 1 to 256 technologies' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-technology-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
Write-ProfileRequest $session 'technology' (@("silent=$([int](!$ShowAlert))") + ($requested | ForEach-Object { "id=$_" }))
Send-ProfileEvent $session 'technology'
Write-Output "$($requested.Count) technologies requested."

# The game thread applies the request on its next update; the profile then writes one line per ID.
for ($attempt = 0; $attempt -lt 10 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
$lines = Get-Content -LiteralPath $resultPath
$lines | Select-Object -First 3
$lines | Select-Object -Skip 3 | Group-Object { ($_ -split '=', 2)[1] } |
    ForEach-Object { "$($_.Name): $($_.Count)" }
$lines | Select-Object -Skip 3 | Where-Object { $_ -notmatch '=(learned|not_added)$' }
