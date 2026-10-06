param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256,
    [Parameter(Mandatory = $true)]
    [ValidateSet('C', 'B', 'A', 'S')]
    [string]$Class,
    # Also request the one-shot dispatch of the shipped freighter reward.
    [switch]$DispatchTestReward,
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
# An earlier dispatch whose outcome is consumed or uncertain is never repeated.
if ($DispatchTestReward -and $fields.dispatch_state -ne '0') {
    throw 'The one-shot test dispatch was already requested in this process'
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
if ($DispatchTestReward) {
    # Let the worker enable its hooks and store the class before the dispatch request.
    Start-Sleep -Milliseconds 1500
    Send-ProfileEvent 'dispatch'
    Write-Output "Class $Class armed for the next freighter offer setup; one test reward dispatch requested."
} else {
    Write-Output "Class $Class armed for the next freighter offer setup; no reward was dispatched."
}
