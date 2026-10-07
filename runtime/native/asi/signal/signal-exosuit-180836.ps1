# Exosuit requests for the build 180836 research profile: silent full cargo and technology grids
# and special technology slots, and the shipped inventory slot reward.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # Make every position of the cargo and technology grids valid (10 x 12 each).
    [switch]$Slots,
    # Mark every valid technology slot as a special slot.
    [switch]$Supercharge,
    # Request one dispatch of the shipped slot reward instead; it opens the game's slot window.
    [switch]$DispatchSlotReward,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256 -Dispatch:$DispatchSlotReward
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if ($DispatchSlotReward) {
    Send-ProfileListedReward $session 'RS_INV_SLOT'
} else {
    Send-ProfileOwnedChange $session 'suit' 0 $Slots $Supercharge
}
