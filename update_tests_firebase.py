"""
Скрипт для автоматического добавления интеграции Firebase во все тесты
"""

import os
import re
from pathlib import Path

def update_test_file(file_path, module_num, lesson_num):
    """Обновляет один файл теста, добавляя интеграцию Firebase"""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Проверяем, не обновлен ли уже файл
        if 'firebase-test-integration.js' in content:
            print(f"  ⏭️  Уже обновлен: {file_path.name}")
            return False
        
        # 1. Заменяем <script> на <script type="module">
        content = re.sub(
            r'<script>(\s*)let answeredQuestions',
            r'<script type="module">\1import { saveTestResult, checkAuth } from \'../../../src/firebase/firebase-test-integration.js\';\n\n\1let answeredQuestions',
            content,
            count=1
        )
        
        # 2. Добавляем константу lessonId
        lesson_id = f'module-{module_num}-lesson-{lesson_num}'
        content = re.sub(
            r'(let answeredQuestions = 0;\s*let correctAnswers = 0;\s*const totalQuestions = \d+;)',
            f'\\1\n        const lessonId = \'{lesson_id}\'; // ID урока для сохранения в Firebase',
            content,
            count=1
        )
        
        # 3. Добавляем сохранение результатов в функцию showResults()
        # Ищем место перед resultsDiv.scrollIntoView
        save_code = """
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

"""
        
        content = re.sub(
            r"(document\.getElementById\('results-message'\)\.textContent = message;\s*document\.getElementById\('results-icon'\)\.textContent = icon;)\s*(resultsDiv\.scrollIntoView)",
            f'\\1{save_code}            \\2',
            content,
            count=1
        )
        
        # Сохраняем обновленный файл
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✅ Обновлен: {file_path.name}")
        return True
        
    except Exception as e:
        print(f"  ❌ Ошибка при обработке {file_path.name}: {str(e)}")
        return False

def main():
    """Главная функция для обновления всех тестов"""
    
    # Путь к папке с тестами
    tests_dir = Path(__file__).parent / 'theory' / 'modules' / 'practice'
    
    if not tests_dir.exists():
        print(f"❌ Папка с тестами не найдена: {tests_dir}")
        return
    
    print("🚀 Начинаем обновление тестов...\n")
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    # Обрабатываем файлы по модулям
    for module_num in range(1, 6):  # Модули 1-5
        # Определяем количество уроков в модуле
        lessons_per_module = {
            1: 3,  # Модуль 1: уроки 1-3
            2: 4,  # Модуль 2: уроки 1-4
            3: 8,  # Модуль 3: уроки 1-8
            4: 4,  # Модуль 4: уроки 1-4
            5: 4   # Модуль 5: уроки 1-4
        }
        
        num_lessons = lessons_per_module.get(module_num, 0)
        
        print(f"📚 Модуль {module_num}:")
        
        for lesson_num in range(1, num_lessons + 1):
            file_name = f'module-{module_num}-lesson-{lesson_num}-test.html'
            file_path = tests_dir / file_name
            
            if not file_path.exists():
                print(f"  ⚠️  Файл не найден: {file_name}")
                error_count += 1
                continue
            
            result = update_test_file(file_path, module_num, lesson_num)
            if result:
                updated_count += 1
            elif result is False:
                skipped_count += 1
            else:
                error_count += 1
        
        print()  # Пустая строка между модулями
    
    # Итоги
    print("=" * 50)
    print(f"✅ Обновлено файлов: {updated_count}")
    print(f"⏭️  Пропущено (уже обновлены): {skipped_count}")
    print(f"❌ Ошибок: {error_count}")
    print(f"📊 Всего обработано: {updated_count + skipped_count + error_count}")
    print("=" * 50)
    
    if updated_count > 0:
        print("\n🎉 Интеграция Firebase успешно добавлена!")
        print("📊 Теперь результаты тестов будут сохраняться в Firebase")
        print("🔗 Просмотреть статистику: statistics.html")

if __name__ == '__main__':
    main()
