# Shared preflight and signaling for the build 180836 research profile. Dot-source this file from
# one of the per-domain scripts in this folder; it sends nothing by itself.

$ErrorActionPreference = 'Stop'
$script:ProfileExecutableSha256 = '13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499'
$script:ProfileDiagnostics = Join-Path (Join-Path $env:LOCALAPPDATA 'NMSCourier') 'diagnostics'

# Check the process, the executable, the installed DLL and the profile status. Returns the session
# used by the other functions; throws when the profile must not be signaled.
function Open-ProfileSession([int]$GameProcessId, [string]$ExpectedDllSha256, [switch]$Dispatch) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$GameProcessId"
    if (!$processInfo -or !$processInfo.ExecutablePath -or
        [IO.Path]::GetFileName($processInfo.ExecutablePath) -ne 'NMS.exe') {
        throw 'The selected process is not an accessible NMS executable'
    }
    if ((Get-FileHash -LiteralPath $processInfo.ExecutablePath -Algorithm SHA256).Hash -ne $script:ProfileExecutableSha256) {
        throw 'Unsupported executable fingerprint'
    }
    $dllPath = Join-Path (Split-Path $processInfo.ExecutablePath -Parent) 'xinput9_1_0.dll'
    if ((Get-FileHash -LiteralPath $dllPath -Algorithm SHA256).Hash -ne $ExpectedDllSha256) {
        throw 'Installed bridge DLL does not match the intended tested build'
    }
    $logPath = Join-Path $script:ProfileDiagnostics "native-profile-180836-$GameProcessId.log"
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
        $fields.mode -ne 'research_profile') {
        throw 'Profile is not accepting requests'
    }
    # A new dispatch is allowed only when none is in flight: unused (0) or returned (3).
    if ($Dispatch -and $fields.dispatch_state -notin @('0', '3')) {
        throw 'A previous dispatch did not return in this process; its outcome is uncertain'
    }
    $basePattern = '^Local\\NMSCourier-Profile180836-' + $GameProcessId + '-[a-f0-9]{32}$'
    if (!$fields.event_base -or $fields.event_base -cnotmatch $basePattern) {
        throw 'Invalid process-specific event base'
    }
    [pscustomobject]@{ ProcessId = $GameProcessId; Created = $processInfo.CreationDate; Fields = $fields }
}

function Send-ProfileEvent($Session, [string]$Tag) {
    $handle = [Threading.EventWaitHandle]::OpenExisting("$($Session.Fields.event_base)-$Tag")
    try {
        $current = Get-CimInstance Win32_Process -Filter "ProcessId=$($Session.ProcessId)"
        if (!$current -or $current.CreationDate -ne $Session.Created) {
            throw 'Selected process changed before signaling'
        }
        if (!$handle.Set()) { throw "Signal $Tag was not accepted" }
    } finally {
        $handle.Dispose()
    }
}

# Write one per-process request file read by the profile (ASCII, one value per line).
function Write-ProfileRequest($Session, [string]$Kind, [string[]]$Lines) {
    $path = Join-Path $script:ProfileDiagnostics "native-$Kind-request-180836-$($Session.ProcessId).txt"
    [IO.File]::WriteAllLines($path, $Lines, [Text.Encoding]::ASCII)
}

# Arm the class and grid options shared by offers (freighter purchase, corvette build).
function Send-ProfileOfferOptions($Session, [string]$Class, [bool]$MaxSlots, [bool]$ExtendedTechnology, [bool]$Supercharge) {
    Send-ProfileEvent $Session $Class.ToLowerInvariant()
    if ($MaxSlots) { Send-ProfileEvent $Session 'slots' }
    if ($ExtendedTechnology) { Send-ProfileEvent $Session 'techrows' }
    if ($Supercharge) { Send-ProfileEvent $Session 'super' }
    # Let the worker enable its hooks and store the options before a dispatch request.
    Start-Sleep -Milliseconds 2500
}

# One dispatch of a shipped reward from the profile's compiled-in list.
function Send-ProfileListedReward($Session, [string]$RewardId) {
    Write-ProfileRequest $Session 'reward' @($RewardId)
    Start-Sleep -Milliseconds 2500
    Send-ProfileEvent $Session 'reward'
    Write-Output "One dispatch of $RewardId requested."
}

# One silent in-place change of an owned store set: full grids and/or every technology slot special.
function Send-ProfileOwnedChange($Session, [string]$Target, [int]$Index, [bool]$Slots, [bool]$Supercharge) {
    if (!($Slots -or $Supercharge)) { throw 'Owned request needs at least one change' }
    $lines = @("target=$Target", "index=$Index")
    if ($Slots) { $lines += 'slots=1' }
    if ($Supercharge) { $lines += 'super=1' }
    Write-ProfileRequest $Session 'owned' $lines
    Send-ProfileEvent $Session 'owned'
    Write-Output "Owned $Target $Index change requested."
}
