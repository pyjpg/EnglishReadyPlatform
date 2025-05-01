[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Run Jest with JSON output
$tempFile = "jest-results.json"
Remove-Item $tempFile -ErrorAction Ignore
npm test -- --json --outputFile=$tempFile | Out-Null

if (-not (Test-Path $tempFile)) {
    Write-Host "❌ Jest results file not found. Jest might have failed." -ForegroundColor Red
    exit 1
}

# Load and parse JSON results
$json = Get-Content $tempFile -Raw | ConvertFrom-Json
$specs = @()

$totalTests = 0
$totalPassing = 0
$totalFailing = 0
$totalPending = 0
$totalSkipped = 0
$totalDuration = 0

foreach ($result in $json.testResults) {
    $fileName = [System.IO.Path]::GetFileName($result.name)

    $numPassing = $result.assertionResults | Where-Object { $_.status -eq "passed" } | Measure-Object | Select-Object -ExpandProperty Count
    $numFailing = $result.assertionResults | Where-Object { $_.status -eq "failed" } | Measure-Object | Select-Object -ExpandProperty Count
    $numPending = $result.assertionResults | Where-Object { $_.status -eq "pending" } | Measure-Object | Select-Object -ExpandProperty Count
    $numSkipped = $result.assertionResults | Where-Object { $_.status -eq "skipped" } | Measure-Object | Select-Object -ExpandProperty Count

    $total = $numPassing + $numFailing + $numPending + $numSkipped
    $duration = [math]::Round($result.endTime - $result.startTime) / 1000

    $specs += [PSCustomObject]@{
        Spec     = $fileName
        Tests    = $total
        Passing  = $numPassing
        Failing  = $numFailing
        Pending  = $numPending
        Skipped  = $numSkipped
        Duration = [int]$duration
    }

    $totalTests += $total
    $totalPassing += $numPassing
    $totalFailing += $numFailing
    $totalPending += $numPending
    $totalSkipped += $numSkipped
    $totalDuration += [int]$duration
}

# Display table
Write-Host ""
Write-Host "+-------------------------------------------------------------------------------------+" -ForegroundColor Green
Write-Host "| Spec                                        Time  Tests Pass Fail Pending Skip     |" -ForegroundColor Green
Write-Host "+-------------------------------------------------------------------------------------+" -ForegroundColor Green

foreach ($spec in $specs) {
    $shortSpec = $spec.Spec
    if ($shortSpec.Length -gt 44) {
        $shortSpec = $shortSpec.Substring(0, 44)
    }

    $line = ('| {0,-44} {1,5:D2}s  {2,5} {3,5} {4,5}  {5,6} {6,5} |' -f `
        $shortSpec, $spec.Duration, $spec.Tests, $spec.Passing, $spec.Failing, $spec.Pending, $spec.Skipped)

    Write-Host $line -ForegroundColor Green
}

Write-Host "+-------------------------------------------------------------------------------------+" -ForegroundColor Green

# Display summary
Write-Host "`n=================== TEST SUMMARY ===================" -ForegroundColor Cyan
Write-Host ("Total Tests:     {0}" -f $totalTests) -ForegroundColor Cyan
Write-Host ("Passing:         {0}" -f $totalPassing) -ForegroundColor Cyan
Write-Host ("Failing:         {0}" -f $totalFailing) -ForegroundColor Cyan
Write-Host ("Pending:         {0}" -f $totalPending) -ForegroundColor Cyan
Write-Host ("Skipped:         {0}" -f $totalSkipped) -ForegroundColor Cyan
Write-Host ("Total Duration:  {0} seconds" -f $totalDuration) -ForegroundColor Cyan

# Final verdict
if ($totalFailing -eq 0) {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed." -ForegroundColor Red
}
