# PowerShell скрипт для добавления интеграции Firebase во все тесты

$testsDir = "theory\modules\practice"
$updatedCount = 0
$skippedCount = 0
$errorCount = 0

# Определяем структуру модулей
$modules = @{
    1 = 3  # Модуль 1: уроки 1-3
    2 = 4  # Модуль 2: уроки 1-4
    3 = 8  # Модуль 3: уроки 1-8
    4 = 4  # Модуль 4: уроки 1-4
    5 = 4  # Модуль 5: уроки 1-4
}

Write-Host "Starting tests update...`n" -ForegroundColor Cyan

foreach ($moduleNum in 1..5) {
    $numLessons = $modules[$moduleNum]
    Write-Host "Module $moduleNum" ":" -ForegroundColor Yellow
    
    for ($lessonNum = 1; $lessonNum -le $numLessons; $lessonNum++) {
        $fileName = "module-$moduleNum-lesson-$lessonNum-test.html"
        $filePath = Join-Path $testsDir $fileName
        
        if (-not (Test-Path $filePath)) {
            Write-Host "  File not found: $fileName" -ForegroundColor Red
            $errorCount++
            continue
        }
        
        try {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            
            # Проверяем, не обновлен ли уже файл
            if ($content -match 'firebase-test-integration\.js') {
                Write-Host "  Already updated: $fileName" -ForegroundColor Gray
                $skippedCount++
                continue
            }
            
            $lessonId = "module-$moduleNum-lesson-$lessonNum"
            
            # 1. Заменяем <script> на <script type="module"> и добавляем import
            $content = $content -replace '(<script>)(\s*)(let answeredQuestions)', 
                "`$1 type=`"module`">`$2import { saveTestResult, checkAuth } from '../../../src/firebase/firebase-test-integration.js';`n`n`$2`$3"
            
            # 2. Добавляем константу lessonId
            $content = $content -replace '(let answeredQuestions = 0;\s*let correctAnswers = 0;\s*const totalQuestions = \d+;)',
                "`$1`n        const lessonId = '$lessonId'; // ID урока для сохранения в Firebase"
            
            # 3. Добавляем сохранение результатов
            $saveCode = @"

            // Сохранение результатов в Firebase
            saveTestResult(lessonId, percentage, correctAnswers, totalQuestions)
                .then(result => {
                    if (result.success) {
                        console.log('✅ Результаты сохранены для пользователя:', result.user);
                    } else {
                        console.warn('⚠️ Результаты не сохранены:', result.error);
                    }
                })
                .catch(error => {
                    console.error('❌ Ошибка при сохранении:', error);
                });

"@
            
            $content = $content -replace "(document\.getElementById\('results-message'\)\.textContent = message;\s*document\.getElementById\('results-icon'\)\.textContent = icon;)\s*(resultsDiv\.scrollIntoView)",
                "`$1$saveCode            `$2"
            
            # Сохраняем файл
            Set-Content -Path $filePath -Value $content -Encoding UTF8
            
            Write-Host "  Updated: $fileName" -ForegroundColor Green
            $updatedCount++
        }
        catch {
            Write-Host "  Error: $fileName - $_" -ForegroundColor Red
            $errorCount++
        }
    }
    
    Write-Host ""
}

# Итоги
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "Updated files: $updatedCount" -ForegroundColor Green
Write-Host "Skipped (already updated): $skippedCount" -ForegroundColor Gray
Write-Host "Errors: $errorCount" -ForegroundColor Red
$total = $updatedCount + $skippedCount + $errorCount
Write-Host "Total processed: $total" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

if ($updatedCount -gt 0) {
    Write-Host "`nFirebase integration added successfully!" -ForegroundColor Green
    Write-Host "Test results will now be saved to Firebase" -ForegroundColor Cyan
    Write-Host "View statistics: statistics.html" -ForegroundColor Cyan
}
