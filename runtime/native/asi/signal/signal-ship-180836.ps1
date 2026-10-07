# Owned starship requests for the build 180836 research profile: silent full grids and special
# technology slots on the primary ship or on a ship slot, and the shipped ship rewards.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    # Ship slot number starting at 0. Omit to target the primary ship, which the profile resolves.
    [ValidateRange(0, 11)]
    [int]$Index = -1,
    # Make every position of the main and technology grids valid (10 x 12 each).
    [switch]$Slots,
    # Mark every valid technology slot as a special slot.
    [switch]$Supercharge,
    # Request one dispatch of a shipped ship reward instead (class step or slot reward).
    [ValidateSet('R_SHIPUPGRADE', 'R_SHIPSLOT_CASH', 'R_SHIPSLOT_PROD')]
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
} elseif ($Index -ge 0) {
    Send-ProfileOwnedChange $session 'ship' $Index $Slots $Supercharge
} else {
    Send-ProfileOwnedChange $session 'primary-ship' 0 $Slots $Supercharge
}
