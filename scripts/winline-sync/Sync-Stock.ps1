<#
.SYNOPSIS
    Daily WinLine → SWING B2B stock sync.

.DESCRIPTION
    Picks up the most recent Bestandsliste CSV produced by WinLine FAKT and
    POSTs it to https://swingparagliders.pro/api/sync-stock via bearer token.
    Logs the response JSON + HTTP status to a rotating daily log file.

    Expected setup:
      1. WinLine is configured to export the Bestandsliste to $WatchFolder
         (default: C:\WinLine-Exports\) with a dated filename.
         Either via WinLine START's Scheduler, or via a manual daily routine.
      2. A Windows Scheduled Task triggers this script once per day after
         the export has finished. See SyncStock-Task.xml for a ready-to-import
         task definition.
      3. Env-style config below (or via -SyncToken / -ApiUrl params).

.PARAMETER ApiUrl
    Target URL. Default: https://swingparagliders.pro/api/sync-stock

.PARAMETER SyncToken
    Bearer token. Must match STOCK_SYNC_TOKEN on the B2B portal (Netlify env).
    Prefer setting the environment variable SWING_STOCK_SYNC_TOKEN instead of
    passing on the command line (safer in Task Scheduler).

.PARAMETER WatchFolder
    Folder where WinLine writes the daily CSV export.
    Default: C:\WinLine-Exports

.PARAMETER FilePattern
    Glob for CSV files to pick. Default: *.csv

.PARAMETER LogFolder
    Where to write per-day JSON logs. Default: $WatchFolder\sync-logs

.EXAMPLE
    .\Sync-Stock.ps1

.EXAMPLE
    .\Sync-Stock.ps1 -ApiUrl https://staging.swingparagliders.pro/api/sync-stock

.NOTES
    Author: SWING B2B Integration
    Requires: PowerShell 5.1+ (ships with Windows 10/11)
#>

[CmdletBinding()]
param(
    [string]$ApiUrl      = $env:SWING_SYNC_URL,
    [string]$SyncToken   = $env:SWING_STOCK_SYNC_TOKEN,
    [string]$WatchFolder = $(if ($env:SWING_WATCH_FOLDER) { $env:SWING_WATCH_FOLDER } else { 'C:\WinLine-Exports' }),
    [string]$FilePattern = '*.csv',
    [string]$LogFolder
)

# ── Defaults + validation ────────────────────────────────────────────
if (-not $ApiUrl)    { $ApiUrl = 'https://swingparagliders.pro/api/sync-stock' }
if (-not $LogFolder) { $LogFolder = Join-Path $WatchFolder 'sync-logs' }

if (-not $SyncToken) {
    Write-Error 'SyncToken not provided. Set SWING_STOCK_SYNC_TOKEN env var or pass -SyncToken.'
    exit 2
}
if (-not (Test-Path $WatchFolder)) {
    Write-Error "Watch folder does not exist: $WatchFolder"
    exit 2
}
if (-not (Test-Path $LogFolder)) {
    New-Item -ItemType Directory -Path $LogFolder -Force | Out-Null
}

# ── Pick newest CSV ──────────────────────────────────────────────────
$csv = Get-ChildItem -Path $WatchFolder -Filter $FilePattern -File `
        | Sort-Object LastWriteTime -Descending `
        | Select-Object -First 1

if (-not $csv) {
    Write-Error "No CSV files matching '$FilePattern' in $WatchFolder"
    exit 3
}

# Sanity: file must be at least ~1 minute old (WinLine might still be writing)
$ageMinutes = (New-TimeSpan -Start $csv.LastWriteTime -End (Get-Date)).TotalMinutes
if ($ageMinutes -lt 1) {
    Write-Warning "File is very recent ($([math]::Round($ageMinutes,2)) min old) — WinLine may still be writing. Waiting 60s..."
    Start-Sleep -Seconds 60
}

$logStamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$logFile  = Join-Path $LogFolder "$logStamp.json"

Write-Host "Syncing: $($csv.FullName)"
Write-Host "         size=$($csv.Length) bytes, age=$([math]::Round($ageMinutes,1)) min"
Write-Host "Target:  $ApiUrl"

# ── POST via multipart/form-data ─────────────────────────────────────
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

# Read CSV as raw bytes (preserve encoding — WinLine typically CP1252)
$csvBytes = [System.IO.File]::ReadAllBytes($csv.FullName)

# Build multipart body manually (Invoke-RestMethod -Form is PS7+ only;
# PS5.1 needs manual construction).
$enc = [System.Text.Encoding]::GetEncoding(28591) # ISO-8859-1 — byte-preserving
$headerPart = "--$boundary$LF" `
    + "Content-Disposition: form-data; name=`"file`"; filename=`"$($csv.Name)`"$LF" `
    + "Content-Type: text/csv$LF$LF"
$footerPart = "$LF--$boundary--$LF"

$headerBytes = $enc.GetBytes($headerPart)
$footerBytes = $enc.GetBytes($footerPart)

$body = New-Object System.IO.MemoryStream
$body.Write($headerBytes, 0, $headerBytes.Length)
$body.Write($csvBytes,    0, $csvBytes.Length)
$body.Write($footerBytes, 0, $footerBytes.Length)
$bodyBytes = $body.ToArray()

$headers = @{
    Authorization = "Bearer $SyncToken"
    'Content-Type' = "multipart/form-data; boundary=$boundary"
}

try {
    $response = Invoke-RestMethod -Uri $ApiUrl -Method Post `
        -Headers $headers -Body $bodyBytes `
        -TimeoutSec 120 -ErrorAction Stop

    $payload = [PSCustomObject]@{
        timestamp      = (Get-Date).ToString('o')
        ok             = $true
        file           = $csv.Name
        file_size      = $csv.Length
        response       = $response
    }
    $payload | ConvertTo-Json -Depth 8 | Set-Content -Path $logFile -Encoding UTF8

    Write-Host ("OK — portal: {0} updated ({1} zeroed) / {2} unchanged / {3} untouched-family-absent | {4} items-not-in-portal | {5} rows | took={6}ms" -f `
        $response.portal_updated, $response.portal_zeroed, $response.portal_unchanged, `
        $response.portal_untouched, $response.items_not_in_portal, $response.csv_rows, `
        $response.duration_ms)
    if ($response.items_not_in_portal -gt 0) {
        Write-Warning "$($response.items_not_in_portal) WinLine items are not in the B2B portal — ignored. See $logFile for details."
    }
    exit 0
}
catch {
    $errorPayload = [PSCustomObject]@{
        timestamp = (Get-Date).ToString('o')
        ok        = $false
        file      = $csv.Name
        error     = $_.Exception.Message
        status    = $_.Exception.Response.StatusCode.value__ 2>$null
    }
    $errorPayload | ConvertTo-Json -Depth 4 | Set-Content -Path $logFile -Encoding UTF8
    Write-Error "Sync failed: $($_.Exception.Message)"
    exit 1
}
