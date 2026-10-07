# Freighter requests for the build 180836 research profile: class, grids, special slots, scene and
# seeds of the next freighter offer, and the shipped freighter rewards.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    [ValidateSet('C', 'B', 'A', 'S')]
    [string]$Class = 'S',
    # Create the offer's main and technology grids at the largest table bounds (120 and 60).
    [switch]$MaxSlots,
    # Like MaxSlots, with the technology height bound raised to twelve rows for that one layout call.
    [switch]$ExtendedTechnology,
    # Mark every valid technology slot of the offer as a special slot.
    [switch]$Supercharge,
    # Shipped scene path replacing the reward's model, for example
    # MODELS/COMMON/SPACECRAFT/INDUSTRIAL/PIRATEFREIGHTER.SCENE.MBIN.
    [ValidatePattern('^MODELS/[A-Z0-9_/.]{12,100}\.SCENE\.MBIN$')]
    [string]$Scene,
    [ValidatePattern('^0x[0-9A-Fa-f]{1,16}$')]
    [string]$ModelSeed,
    [ValidatePattern('^0x[0-9A-Fa-f]{1,16}$')]
    [string]$HomeSeed,
    # Also request one dispatch of the shipped freighter offer reward.
    [switch]$DispatchOffer,
    # Request one dispatch of the shipped freighter slot reward instead of arming an offer.
    [switch]$DispatchSlotReward,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256 -Dispatch:($DispatchOffer -or $DispatchSlotReward)
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
if ($DispatchSlotReward) {
    Send-ProfileListedReward $session 'R_FREIGHTSLOT'
    return
}
if ($Scene -or $ModelSeed -or $HomeSeed) {
    $lines = @()
    if ($Scene) { $lines += "scene=$Scene" }
    if ($ModelSeed) { $lines += 'model_seed=0x' + $ModelSeed.Substring(2).ToUpperInvariant() }
    if ($HomeSeed) { $lines += 'home_seed=0x' + $HomeSeed.Substring(2).ToUpperInvariant() }
    Write-ProfileRequest $session 'freighter' $lines
    Send-ProfileEvent $session 'model'
}
Send-ProfileOfferOptions $session $Class $MaxSlots $ExtendedTechnology $Supercharge
if ($DispatchOffer) {
    Send-ProfileEvent $session 'dispatch'
    Write-Output "Class $Class armed for the next freighter offer setup; one offer reward dispatch requested."
} else {
    Write-Output "Class $Class armed for the next freighter offer setup; no reward was dispatched."
}
