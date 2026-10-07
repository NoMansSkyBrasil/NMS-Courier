param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    [Parameter(Mandatory = $true)]
    [ValidateSet('C', 'B', 'A', 'S')]
    [string]$Class,
    # Create the next offer's main and technology grids at the largest table bounds (120 and 60).
    [switch]$MaxSlots,
    # Like MaxSlots, with the technology height bound raised to twelve rows for that one layout call.
    [switch]$ExtendedTechnology,
    # Mark every valid technology slot of the next offer as a special slot.
    [switch]$Supercharge,
    # Shipped scene path replacing the reward's model, for example
    # MODELS/COMMON/SPACECRAFT/INDUSTRIAL/PIRATEFREIGHTER.SCENE.MBIN.
    [ValidatePattern('^MODELS/[A-Z0-9_/.]{12,100}\.SCENE\.MBIN$')]
    [string]$Scene,
    [ValidatePattern('^0x[0-9A-Fa-f]{1,16}$')]
    [string]$ModelSeed,
    [ValidatePattern('^0x[0-9A-Fa-f]{1,16}$')]
    [string]$HomeSeed,
    # Also request one dispatch of the shipped freighter reward.
    [switch]$DispatchTestReward,
    # Request one dispatch of the shipped reward that starts corvette build mode (observation only).
    [switch]$DispatchCorvetteBuild,
    # Request one dispatch of a shipped in-place upgrade reward (the profile accepts only its own list).
    [ValidateSet('R_WEAP_UPGRADE', 'R_SHIPUPGRADE', 'R_ROGUE_CLASS', 'R_SHIPSLOT_CASH', 'R_SHIPSLOT_PROD',
        'R_WEAPSLOT_CASH', 'R_WEAPSLOT_PROD', 'RS_INV_SLOT', 'R_INVBOX', 'R_ROGUE_INV', 'R_FREIGHTSLOT')]
    [string]$DispatchListedReward,
    [switch]$PreflightOnly
)

$ErrorActionPreference = 'Stop'
$processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$GameProcessId"
if (!$processInfo -or !$processInfo.ExecutablePath -or
    [IO.Path]::GetFileName($processInfo.ExecutablePath) -ne 'NMS.exe') {
    throw 'The selected process is not an accessible NMS executable'
}
$expectedExe = '13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499'
if ((Get-FileHash -LiteralPath $processInfo.ExecutablePath -Algorithm SHA256).Hash -ne $expectedExe) {
    throw 'Unsupported executable fingerprint'
}
$dllPath = Join-Path (Split-Path $processInfo.ExecutablePath -Parent) 'xinput9_1_0.dll'
if ((Get-FileHash -LiteralPath $dllPath -Algorithm SHA256).Hash -ne $ExpectedDllSha256) {
    throw 'Installed bridge DLL does not match the intended tested build'
}
$logPath = Join-Path $env:LOCALAPPDATA "NMSCourier\diagnostics\native-freighter-class-180836-$GameProcessId.log"
if ((Get-Item -LiteralPath $logPath).LastWriteTimeUtc -lt $processInfo.CreationDate.ToUniversalTime()) {
    throw 'Profile log predates the selected process; PID reuse is not a valid session'
}
$fields = @{}
foreach ($line in Get-Content -LiteralPath $logPath) {
    $pair = $line -split '=', 2
    if ($pair.Count -eq 2) { $fields[$pair[0]] = $pair[1] }
}
if ($fields.status -notin @('awaiting_request', 'armed') -or
    $fields.pid -ne [string]$GameProcessId -or $fields.hook_status -ne '0' -or
    $fields.mode -ne 'request_scoped_class_research') {
    throw 'Profile is not accepting requests'
}
# A new dispatch is allowed only when none is in flight: unused (0) or returned (3).
if (($DispatchTestReward -or $DispatchCorvetteBuild -or $DispatchListedReward) -and $fields.dispatch_state -notin @('0', '3')) {
    throw 'A previous dispatch did not return in this process; its outcome is uncertain'
}
$basePattern = '^Local\\NMSCourier-FreighterClass180836-' + $GameProcessId + '-[a-f0-9]{32}$'
if (!$fields.event_base -or $fields.event_base -cnotmatch $basePattern) {
    throw 'Invalid process-specific event base'
}
if ($PreflightOnly) {
    Write-Output "Preflight passed; nothing was signaled. dispatch_state=$($fields.dispatch_state) applied_count=$($fields.applied_count)"
    return
}

function Send-ProfileEvent([string]$Tag) {
    $handle = [Threading.EventWaitHandle]::OpenExisting("$($fields.event_base)-$Tag")
    try {
        $current = Get-CimInstance Win32_Process -Filter "ProcessId=$GameProcessId"
        if (!$current -or $current.CreationDate -ne $processInfo.CreationDate) {
            throw 'Selected process changed before signaling'
        }
        if (!$handle.Set()) { throw "Signal $Tag was not accepted" }
    } finally {
        $handle.Dispose()
    }
}

Send-ProfileEvent $Class.ToLowerInvariant()
if ($MaxSlots) { Send-ProfileEvent 'slots' }
if ($ExtendedTechnology) { Send-ProfileEvent 'techrows' }
if ($Supercharge) { Send-ProfileEvent 'super' }
if ($Scene -or $ModelSeed -or $HomeSeed) {
    $lines = @()
    if ($Scene) { $lines += "scene=$Scene" }
    if ($ModelSeed) { $lines += 'model_seed=0x' + $ModelSeed.Substring(2).ToUpperInvariant() }
    if ($HomeSeed) { $lines += 'home_seed=0x' + $HomeSeed.Substring(2).ToUpperInvariant() }
    $requestPath = Join-Path $env:LOCALAPPDATA "NMSCourier\diagnostics\native-freighter-request-180836-$GameProcessId.txt"
    [IO.File]::WriteAllLines($requestPath, $lines, [Text.Encoding]::ASCII)
    Send-ProfileEvent 'model'
}
if ($DispatchListedReward) {
    $rewardPath = Join-Path $env:LOCALAPPDATA "NMSCourier\diagnostics
ative-reward-request-180836-$GameProcessId.txt"
    [IO.File]::WriteAllLines($rewardPath, @($DispatchListedReward), [Text.Encoding]::ASCII)
    Start-Sleep -Milliseconds 2500
    Send-ProfileEvent 'reward'
    Write-Output "One dispatch of $DispatchListedReward requested."
} elseif ($DispatchCorvetteBuild) {
    Start-Sleep -Milliseconds 2500
    Send-ProfileEvent 'corvette'
    Write-Output 'One dispatch of the corvette build reward requested.'
} elseif ($DispatchTestReward) {
    # Let the worker enable its hooks and store the class before the dispatch request.
    Start-Sleep -Milliseconds 2500
    Send-ProfileEvent 'dispatch'
    Write-Output "Class $Class armed for the next freighter offer setup; one test reward dispatch requested."
} else {
    Write-Output "Class $Class armed for the next freighter offer setup; no reward was dispatched."
}
