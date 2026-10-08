# Currency requests for the build 180836 research profile: one dispatch of a currency reward through
# the game's own reward routine, which adds the money to the loaded save slot and shows the game's
# notification. The rewards come from the data file in runtime/mods/currency_rewards, which must be
# in the game's mod folder; without it the game finds no such reward and nothing happens.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    [ValidateSet('units', 'nanites', 'quicksilver')]
    [string]$Currency,
    # Units: 1M, 10M, 100M, 1B. Nanites and quicksilver: 1K, 10K, 100K, 1M.
    [ValidateSet('1K', '10K', '100K', '1M', '10M', '100M', '1B')]
    [string]$Amount,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256 -Dispatch
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
$amounts = @{
    units = @('1M', '10M', '100M', '1B'); nanites = @('1K', '10K', '100K', '1M')
    quicksilver = @('1K', '10K', '100K', '1M')
}
$names = @{ units = 'UNITS'; nanites = 'NANITE'; quicksilver = 'QS' }
if (!$Currency -or !$Amount) { throw 'Give -Currency and -Amount' }
if ($Amount -notin $amounts[$Currency]) { throw "Amount $Amount is not offered for $Currency" }
Send-ProfileListedReward $session "CR_$($names[$Currency])_$Amount"
