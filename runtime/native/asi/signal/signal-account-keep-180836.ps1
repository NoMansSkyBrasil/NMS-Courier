# Keep list of the build 180836 research profile: the Twitch and platform rewards the profile puts
# back into the ACCOUNT's sets in every game session. The game replaces the Twitch set with what the
# publisher's service reports at login, so a direct insert lasts one session; with a keep list the
# profile repeats the insert by itself while its hooks are enabled. This is a direct write through
# native helpers, repeated; see docs/ACCOUNT_UNLOCK_NOTES.md.
#
# The list is one file shared by every game process. Writing it needs no running game; give
# -GameProcessId and -ExpectedDllSha256 as well to make a running game load it at once.
param(
    # Kinds to keep, every deliverable ID of each.
    [ValidateSet('twitch', 'platform')]
    [string[]]$AllOfKind,
    # Empty the list: the profile stops re-inserting from the next load of the list.
    [switch]$Clear,
    [int]$GameProcessId,
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256
)

if ([bool]$AllOfKind -eq [bool]$Clear) { throw 'Give either -AllOfKind or -Clear' }
$diagnostics = Join-Path $env:LOCALAPPDATA 'NMSCourier\diagnostics'
$keepPath = Join-Path $diagnostics 'native-account-keep-180836.txt'

$lines = @()
if ($AllOfKind) {
    # Rows of the generated Markdown data table: Kind, ID, Detail, Deliverable.
    $tablePath = Join-Path $PSScriptRoot '..\..\..\research\account-unlocks.md'
    foreach ($line in Get-Content -LiteralPath $tablePath) {
        if ($line -match '^\| (twitch|platform) \| ([A-Z0-9_]{1,15}) \| [^|]* \| yes \|' -and $Matches[1] -in $AllOfKind) {
            $lines += "$($Matches[1])=$($Matches[2])"
        }
    }
    $lines = @($lines | Select-Object -Unique)
    if ($lines.Count -lt 1 -or $lines.Count -gt 1024) { throw 'A keep list carries 1 to 1024 IDs' }
}
if (!(Test-Path -LiteralPath $diagnostics)) { New-Item -ItemType Directory -Path $diagnostics | Out-Null }
[IO.File]::WriteAllLines($keepPath, [string[]]$lines, [Text.Encoding]::ASCII)
Write-Output "Keep list written: $($lines.Count) IDs."

if ($GameProcessId) {
    if (!$ExpectedDllSha256) { throw 'Give -ExpectedDllSha256 with -GameProcessId' }
    . (Join-Path $PSScriptRoot 'profile-180836.ps1')
    $session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
    Send-ProfileEvent $session 'keep'
    Write-Output 'Running game told to load the keep list.'
    $statusPath = Join-Path $script:ProfileDiagnostics "native-account-keep-status-180836-$GameProcessId.txt"
    for ($attempt = 0; $attempt -lt 12 -and !(Test-Path -LiteralPath $statusPath); $attempt++) { Start-Sleep -Seconds 1 }
    if (Test-Path -LiteralPath $statusPath) { Get-Content -LiteralPath $statusPath }
}
