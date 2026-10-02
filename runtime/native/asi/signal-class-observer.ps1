param(
    [Parameter(Mandatory = $true)]
    [int]$GameProcessId,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-fA-F0-9]{64}$')]
    [string]$ExpectedDllSha256
)

$ErrorActionPreference = 'Stop'
$processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$GameProcessId"
if (!$processInfo -or !$processInfo.ExecutablePath -or
    [IO.Path]::GetFileName($processInfo.ExecutablePath) -ne 'NMS.exe') {
    throw 'The selected process is not an accessible NMS executable'
}
$expectedExe = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
if ((Get-FileHash -LiteralPath $processInfo.ExecutablePath -Algorithm SHA256).Hash -ne $expectedExe) {
    throw 'Unsupported executable fingerprint'
}
$dllPath = Join-Path (Split-Path $processInfo.ExecutablePath -Parent) 'xinput9_1_0.dll'
if ((Get-FileHash -LiteralPath $dllPath -Algorithm SHA256).Hash -ne $ExpectedDllSha256) {
    throw 'Installed observer DLL does not match the intended tested build'
}
$logPath = Join-Path $env:LOCALAPPDATA "NMSCourier\diagnostics\native-observer-180383-$GameProcessId.log"
$fields = @{}
foreach ($line in Get-Content -LiteralPath $logPath) {
    $pair = $line -split '=', 2
    if ($pair.Count -eq 2) { $fields[$pair[0]] = $pair[1] }
}
if ($fields.status -ne 'awaiting_class_start' -or
    $fields.pid -ne [string]$GameProcessId -or
    $fields.hook_status -ne '0' -or $fields.mode -ne 'observation_only') {
    throw 'Observer is not awaiting a class sampling signal'
}
$eventPattern = '^Local\\NMSCourier-ClassObserver-' + $GameProcessId + '-[a-f0-9]{32}$'
if (!$fields.class_start_event -or $fields.class_start_event -cnotmatch $eventPattern) {
    throw 'Invalid process-specific observation event'
}
$eventHandle = [Threading.EventWaitHandle]::OpenExisting($fields.class_start_event)
try {
    if (!$eventHandle.Set()) { throw 'Observation signal was not accepted' }
} finally {
    $eventHandle.Dispose()
}
Write-Output 'Class observation start signaled; no reward or class mutation was requested.'
