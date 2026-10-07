# Corvette requests for the build 180836 research profile: class, grids and special slots of the next
# corvette setup, and one dispatch of the shipped reward that starts corvette build mode. The part
# layout and the validation switch still come from the static research mod.
param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    [ValidateSet('C', 'B', 'A', 'S')]
    [string]$Class = 'S',
    [switch]$MaxSlots,
    [switch]$ExtendedTechnology,
    [switch]$Supercharge,
    # Request one dispatch of the build-mode reward after arming the options.
    [switch]$DispatchBuild,
    [switch]$PreflightOnly
)

. (Join-Path $PSScriptRoot 'profile-180836.ps1')
$session = Open-ProfileSession $GameProcessId $ExpectedDllSha256 -Dispatch:$DispatchBuild
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($session.Fields.dispatch_state)"
    return
}
Send-ProfileOfferOptions $session $Class $MaxSlots $ExtendedTechnology $Supercharge
if ($DispatchBuild) {
    Send-ProfileEvent $session 'corvette'
    Write-Output "Class $Class armed; one dispatch of the corvette build reward requested."
} else {
    Write-Output "Class $Class armed for the next corvette setup; no reward was dispatched."
}
