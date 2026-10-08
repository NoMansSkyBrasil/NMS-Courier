# Item requests for the build 180836 research profile: put substances and products into the exosuit
# cargo of the loaded save slot through the game's own store routines. The profile looks every ID up
# in the running game, takes the stack limit from the game and stops when the cargo has no room.
# The change is in the loaded slot only and reaches the save when the game saves.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # One or several items as ID=amount, for example -Item FUEL1=500 or -Item FUEL1=500,CASING=10.
    [ValidatePattern('^[A-Z0-9_]{1,15}=[1-9][0-9]{0,5}$')]
    [string[]]$Item,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
$requested = @($Item | Select-Object -Unique)
if ($requested.Count -lt 1 -or $requested.Count -gt 32) { throw 'A request carries 1 to 32 items' }
$ids = @($requested | ForEach-Object { ($_ -split '=', 2)[0] })
if (@($ids | Select-Object -Unique).Count -ne $ids.Count) { throw 'An item may be named once per request' }

$resultPath = Join-Path $script:ProfileDiagnostics "native-item-result-180836-$GameProcessId.txt"
if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
Write-ProfileRequest $session 'item' $requested
Send-ProfileEvent $session 'item'
Write-Output "$($requested.Count) items requested."

# The game thread applies the request on its next update; the profile then writes one line per ID:
# <ID>:<added>/<requested>=<added|partial|no_room|unknown_id|bad_limit|not_ready>.
for ($attempt = 0; $attempt -lt 10 -and !(Test-Path -LiteralPath $resultPath); $attempt++) { Start-Sleep -Seconds 1 }
if (!(Test-Path -LiteralPath $resultPath)) {
    Write-Output 'No result yet. Do not send the request again; read the result file later.'
    return
}
Get-Content -LiteralPath $resultPath
