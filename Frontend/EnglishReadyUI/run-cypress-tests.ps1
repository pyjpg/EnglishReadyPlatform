[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$output = npx cypress run
$cleanOutput = $output | ForEach-Object { $_ -replace '[^\u0009\u000A\u000D\u0020-\u007E]', '' }

$specs = @()
$currentSpec = $null

foreach ($line in $cleanOutput) {
    if ($line -match '^\s*Running:\s+(.+\.cy\.js)') {
        if ($currentSpec) { $specs += $currentSpec }
        $specName = $matches[1].Trim()
        $currentSpec = [PSCustomObject]@{
            Spec     = $specName
            Tests    = 0
            Passing  = 0
            Failing  = 0
            Pending  = 0
            Skipped  = 0
            Duration = 0
        }
    }

    if ($line -match '^\s*(\d+)\s+passing.*\((\d+)s\)') {
        $currentSpec.Passing = [int]$matches[1]
        $currentSpec.Tests += [int]$matches[1]
        $currentSpec.Duration = [int]$matches[2]
    }
    elseif ($line -match '^\s*(\d+)\s+passing') {
        $currentSpec.Passing = [int]$matches[1]
        $currentSpec.Tests += [int]$matches[1]
    }

    if ($line -match '^\s*(\d+)\s+failing') {
        $currentSpec.Failing = [int]$matches[1]
        $currentSpec.Tests += [int]$matches[1]
    }
    if ($line -match '^\s*(\d+)\s+pending') {
        $currentSpec.Pending = [int]$matches[1]
        $currentSpec.Tests += [int]$matches[1]
    }
    if ($line -match '^\s*(\d+)\s+skipped') {
        $currentSpec.Skipped = [int]$matches[1]
        $currentSpec.Tests += [int]$matches[1]
    }
}

if ($currentSpec) { $specs += $currentSpec }

Write-Host ""
Write-Host "+-------------------------------------------------------------------------------------+" -ForegroundColor Green
Write-Host "| Spec                                        Time  Tests Pass Fail Pending Skip     |" -ForegroundColor Green
Write-Host "+-------------------------------------------------------------------------------------+" -ForegroundColor Green

$totalTests = 0
$totalPassing = 0
$totalFailing = 0
$totalPending = 0
$totalSkipped = 0
$totalDuration = 0

foreach ($spec in $specs) {
    $shortSpec = $spec.Spec
    if ($shortSpec.Length -gt 44) {
        $shortSpec = $shortSpec.Substring(0, 44)
    }

    $line = ('| {0,-44} {1,5:D2}s  {2,5} {3,5} {4,5}  {5,6} {6,5} |' -f `
        $shortSpec, $spec.Duration, $spec.Tests, $spec.Passing, $spec.Failing, $spec.Pending, $spec.Skipped)

    Write-Host $line -ForegroundColor Green

    $totalTests += $spec.Tests
    $totalPassing += $spec.Passing
    $totalFailing += $spec.Failing
    $totalPending += $spec.Pending
    $totalSkipped += $spec.Skipped
    $totalDuration += $spec.Duration
}

Write-Host "+-------------------------------------------------------------------------------------+" -ForegroundColor Green

Write-Host "`n=================== TEST SUMMARY ===================" -ForegroundColor Cyan
Write-Host ("Total Tests:     {0}" -f $totalTests) -ForegroundColor Cyan
Write-Host ("Passing:         {0}" -f $totalPassing) -ForegroundColor Cyan
Write-Host ("Failing:         {0}" -f $totalFailing) -ForegroundColor Cyan
Write-Host ("Pending:         {0}" -f $totalPending) -ForegroundColor Cyan
Write-Host ("Skipped:         {0}" -f $totalSkipped) -ForegroundColor Cyan
Write-Host ("Total Duration:  {0} seconds" -f $totalDuration) -ForegroundColor Cyan

if ($totalFailing -eq 0) {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed." -ForegroundColor Red
}
