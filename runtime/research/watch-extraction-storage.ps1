param(
    [Parameter(Mandatory = $true)][int]$WorkerId,
    [Parameter(Mandatory = $true)][string]$Diagnostics,
    [string]$DriveLetter = 'E',
    [int]$DiskNumber = 1
)

$ErrorActionPreference = 'Stop'
$logPath = Join-Path $Diagnostics 'storage-watch.jsonl'
$worker = Get-Process -Id $WorkerId
$workerStarted = $worker.StartTime.ToUniversalTime()
$since = Get-Date

function Write-WatchRecord($value) {
    $value | ConvertTo-Json -Compress -Depth 5 | Add-Content -LiteralPath $logPath
}

function Stop-Extraction($reason) {
    # Check the process creation time before acting on a potentially reused PID.
    $current = Get-Process -Id $WorkerId -ErrorAction SilentlyContinue
    if ($current -and $current.StartTime.ToUniversalTime() -eq $workerStarted) {
        $children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $WorkerId"
        Stop-Process -Id $WorkerId
        foreach ($child in $children) {
            if ($child.Name -like 'MBINCompiler*.exe') {
                $liveChild = Get-CimInstance Win32_Process -Filter "ProcessId = $($child.ProcessId)"
                if ($liveChild -and $liveChild.ParentProcessId -eq $WorkerId -and
                    $liveChild.CreationDate -eq $child.CreationDate) {
                    Stop-Process -Id $child.ProcessId -ErrorAction SilentlyContinue
                }
            }
        }
    }
    Write-WatchRecord @{ utc = [datetime]::UtcNow.ToString('o'); status = 'stopped'; reason = $reason }
    # Preserve lock, partial XML, SQLite, and reports for explicit recovery review.
    exit 2
}

Write-WatchRecord @{ utc = [datetime]::UtcNow.ToString('o'); status = 'watching'; worker = $WorkerId;
                    disk = $DiskNumber; drive = $DriveLetter }
while ($true) {
    $current = Get-Process -Id $WorkerId -ErrorAction SilentlyContinue
    if (-not $current -or $current.StartTime.ToUniversalTime() -ne $workerStarted) {
        Write-WatchRecord @{ utc = [datetime]::UtcNow.ToString('o'); status = 'worker_exited' }
        break
    }
    try {
        $volume = Get-Volume -DriveLetter $DriveLetter
        $disk = Get-Disk -Number $DiskNumber
        if ($volume.HealthStatus -ne 'Healthy' -or $disk.OperationalStatus -notcontains 'Online') {
            Stop-Extraction 'Target volume or disk is no longer healthy/online'
        }
        if ($volume.SizeRemaining -lt 20GB) {
            Stop-Extraction 'Target free-space reserve reached'
        }
    } catch {
        Stop-Extraction "Target storage check failed: $($_.Exception.Message)"
    }
    $until = Get-Date
    $events = Get-WinEvent -FilterHashtable @{ LogName = 'System'; StartTime = $since; EndTime = $until } -ErrorAction SilentlyContinue
    foreach ($event in $events) {
        if ($event.Level -gt 3) { continue }
        $diskMatch = $event.ProviderName -eq 'disk' -and
            $event.Message -match "Harddisk$DiskNumber(?:\\|\b)"
        # NVMe/NTFS warnings can be ambiguous; stop conservatively even if unmapped.
        if ($diskMatch -or $event.ProviderName -in @('stornvme', 'Ntfs', 'Microsoft-Windows-Ntfs')) {
            Stop-Extraction "System storage event $($event.Id): $($event.Message)"
        }
        if ($event.ProviderName -eq 'storahci') {
            Write-WatchRecord @{ utc = [datetime]::UtcNow.ToString('o'); status = 'other_controller_event';
                                provider = $event.ProviderName; id = $event.Id; message = $event.Message }
        }
    }
    $since = $until
    Start-Sleep -Seconds 30
}
