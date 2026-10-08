# Reward requests for the build 180836 research profile: mark season (expedition), Twitch and
# platform rewards as redeemed in the loaded save slot through the game's own routine. For an ID that
# is a special the routine also unlocks it on the account (observed 2026-10-07), so back up the
# account files as well. Only IDs listed as deliverable in runtime/research/unlockable-rewards.md
# are sent.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # One or several reward IDs, for example -Id EXPD_TITLE23 or -Id TWITCH_406,TWITCH_407.
    [ValidatePattern('^[A-Z0-9_]{1,15}$')]
    [string[]]$Id,
    # Every deliverable reward of one kind.
    [ValidateSet('season', 'twitch', 'platform')]
    [string]$AllOfKind,
    # With -AllOfKind season: only this expedition number.
    [ValidateRange(1, 99)]
    [int]$Expedition = 0,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if ([bool]$Id -eq [bool]$AllOfKind) { throw 'Give either -Id or -AllOfKind' }

# Rows of the generated Markdown data table: ID, Kind, Expedition, Product, Flags, Deliverable.
$tablePath = Join-Path $PSScriptRoot '..\..\..\research\unlockable-rewards.md'
$rewards = [ordered]@{}
foreach ($line in Get-Content -LiteralPath $tablePath) {
    if ($line -match '^\| ([A-Z0-9_]{1,15}) \| (season|twitch|platform) \| ([0-9 ]*) \| [^|]* \| [^|]* \| (yes|no) \|') {
        $rewards[$Matches[1]] = @{ Kind = $Matches[2]; Expedition = $Matches[3].Trim(); Deliverable = $Matches[4] }
    }
}
if ($rewards.Count -lt 1) { throw 'Unlockable rewards table is missing or empty' }

if ($AllOfKind) {
    $requested = @($rewards.Keys | Where-Object {
        $rewards[$_].Kind -eq $AllOfKind -and $rewards[$_].Deliverable -eq 'yes' -and
        (!$Expedition -or ($rewards[$_].Expedition -split ' ') -contains [string]$Expedition) })
} else {
    $requested = @($Id | Select-Object -Unique)
    foreach ($entry in $requested) {
        if (!$rewards.Contains($entry)) { throw "Unknown reward ID: $entry" }
        if ($rewards[$entry].Deliverable -ne 'yes') { throw "Reward $entry is never delivered" }
    }
}
if ($requested.Count -lt 1 -or $requested.Count -gt 512) { throw 'A request carries 1 to 512 rewards' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-redeem-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
Write-ProfileRequest $session 'redeem' @($requested | ForEach-Object { "id=$_" })
Send-ProfileEvent $session 'redeem'
Write-Output "$($requested.Count) rewards requested."

for ($attempt = 0; $attempt -lt 10 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
$lines = Get-Content -LiteralPath $resultPath
$lines | Select-Object -First 3
$lines | Select-Object -Skip 3 | Group-Object { ($_ -split '=', 2)[1] } | ForEach-Object { "$($_.Name): $($_.Count)" }
$lines | Select-Object -Skip 3 | Where-Object { $_ -notmatch '=(changed|no_change)$' }
