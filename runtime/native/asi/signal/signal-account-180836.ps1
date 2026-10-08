# Account requests for the build 180836 research profile: unlock titles, specials and season
# (expedition) rewards on the ACCOUNT through the game's own single-entry routines, and Twitch and
# platform rewards by a direct insert into the account's set with the game's container routine (the
# game has no single-entry routine for those two). This changes data shared by every save slot and
# synchronised outside the machine: back up the save folder and the user settings file first. Only IDs
# listed as deliverable in runtime/research/account-unlocks.md are sent.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # Single IDs per kind, for example -Title T_TRA1 or -Season EXPD_POSTER23A.
    [ValidatePattern('^[A-Z0-9_]{1,15}$')]
    [string[]]$Title,
    [ValidatePattern('^[A-Z0-9_]{1,15}$')]
    [string[]]$Special,
    [ValidatePattern('^[A-Z0-9_]{1,15}$')]
    [string[]]$Season,
    [ValidatePattern('^[A-Z0-9_]{1,15}$')]
    [string[]]$Twitch,
    [ValidatePattern('^[A-Z0-9_]{1,15}$')]
    [string[]]$Platform,
    # Every deliverable ID of the named kinds.
    [ValidateSet('title', 'special', 'season', 'twitch', 'platform')]
    [string[]]$AllOfKind,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}

# Rows of the generated Markdown data table: Kind, ID, Detail, Deliverable.
$tablePath = Join-Path $PSScriptRoot '..\..\..\research\account-unlocks.md'
$known = [ordered]@{}
foreach ($line in Get-Content -LiteralPath $tablePath) {
    if ($line -match '^\| (title|special|season|twitch|platform) \| ([A-Z0-9_]{1,15}) \| [^|]* \| (yes|no) \|') {
        $known["$($Matches[1])=$($Matches[2])"] = $Matches[3]
    }
}
if ($known.Count -lt 1) { throw 'Account unlock table is missing or empty' }

$requested = @()
foreach ($pair in @(@('title', $Title), @('special', $Special), @('season', $Season), @('twitch', $Twitch), @('platform', $Platform))) {
    foreach ($entry in @($pair[1] | Where-Object { $_ } | Select-Object -Unique)) {
        $key = "$($pair[0])=$entry"
        if (!$known.Contains($key)) { throw "Unknown $($pair[0]) ID: $entry" }
        if ($known[$key] -ne 'yes') { throw "$entry is never unlocked" }
        $requested += $key
    }
}
foreach ($kind in @($AllOfKind | Select-Object -Unique)) {
    $requested += @($known.Keys | Where-Object { $_.StartsWith("$kind=") -and $known[$_] -eq 'yes' })
}
$requested = @($requested | Select-Object -Unique)
if ($requested.Count -lt 1 -or $requested.Count -gt 2048) { throw 'A request carries 1 to 2048 IDs' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-account-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
Write-ProfileRequest $session 'account' $requested
Send-ProfileEvent $session 'account'
Write-Output "$($requested.Count) account unlocks requested."

for ($attempt = 0; $attempt -lt 15 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
$lines = Get-Content -LiteralPath $resultPath
$summary = @($lines | Where-Object { $_ -notmatch ':' })
$perId = @($lines | Where-Object { $_ -match ':' })
$summary
$perId | Group-Object { ($_ -split ':', 2)[0] + ' ' + ($_ -split '=', 2)[1] } | ForEach-Object { "$($_.Name): $($_.Count)" }
$perId | Where-Object { $_ -notmatch '=(unlocked|no_change|inserted|present)$' } | Select-Object -First 30
