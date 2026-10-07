# Owned multitool requests for the build 180836 research profile: silent full grid and special
# technology slots on the equipped multitool, and the shipped multitool rewards.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # Make every position of the equipped multitool's grid valid (10 x 12).
    [switch]$Slots,
    # Mark every valid technology slot as a special slot.
    [switch]$Supercharge,
    # Request one dispatch of a shipped multitool reward instead. R_WEAP_UPGRADE raises the equipped
    # multitool by one class step per dispatch.
    [ValidateSet('R_WEAP_UPGRADE', 'R_WEAPSLOT_CASH', 'R_WEAPSLOT_PROD')]
    [string]$DispatchReward,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256 -Dispatch:([bool]$DispatchReward)
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if ($DispatchReward) {
    Send-ProfileListedReward $session $DispatchReward
} else {
    # The equipped multitool is changed through its active store; writes to the array record of the
    # equipped multitool are undone by the game.
    Send-ProfileOwnedChange $session 'equipped-weapon' 0 $Slots $Supercharge
}
