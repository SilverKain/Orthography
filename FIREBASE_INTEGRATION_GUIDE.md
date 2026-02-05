# Интеграция Firebase для сохранения результатов тестов

## Как добавить сохранение результатов в тест

### Шаг 1: Изменить тег `<script>` на `<script type="module">`

Найдите в вашем HTML-файле теста:
```html
<script>
```

Замените на:
```html
<script type="module">
```

### Шаг 2: Импортировать функцию сохранения

Добавьте в начало скрипта (после открытия тега):
```javascript
import { saveTestResult, checkAuth } from '../../../src/firebase/firebase-test-integration.js';
```

### Шаг 3: Добавить константу lessonId

Определите ID урока в начале скрипта:
```javascript
const lessonId = 'module-X-lesson-Y'; // Замените X и Y на номера модуля и урока
```

Примеры:
- Модуль 1, Урок 1: `'module-1-lesson-1'`
- Модуль 2, Урок 3: `'module-2-lesson-3'`
- Модуль 5, Урок 4: `'module-5-lesson-4'`

### Шаг 4: Вызвать функцию сохранения в функции showResults()

В конце функции `showResults()`, после установки текста сообщения, добавьте:

```javascript
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
```

## Полный пример изменений

### До:
```javascript
<script>
    let answeredQuestions = 0;
    let correctAnswers = 0;
    const totalQuestions = 8;

    // ... остальной код ...

    function showResults() {
        // ... вычисление результатов ...
        
        document.getElementById('results-message').textContent = message;
        document.getElementById('results-icon').textContent = icon;

        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
</script>
```

### После:
```javascript
<script type="module">
    import { saveTestResult, checkAuth } from '../../../src/firebase/firebase-test-integration.js';

    let answeredQuestions = 0;
    let correctAnswers = 0;
    const totalQuestions = 8;
    const lessonId = 'module-1-lesson-1'; // ID урока для сохранения в Firebase

    // ... остальной код ...

    function showResults() {
        // ... вычисление результатов ...
        
        document.getElementById('results-message').textContent = message;
        document.getElementById('results-icon').textContent = icon;

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

        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
</script>
```

## Важно!

1. **Путь к модулю**: Убедитесь, что путь `'../../../src/firebase/firebase-test-integration.js'` правильный относительно расположения вашего HTML-файла теста.

2. **lessonId**: Формат должен быть строго `'module-X-lesson-Y'`, где:
   - X - номер модуля (1-5)
   - Y - номер урока (1-8)

3. **Авторизация**: Результаты сохраняются только для авторизованных пользователей. Если пользователь не авторизован, в консоли появится предупреждение, но тест продолжит работать нормально.

4. **Просмотр результатов**: Все сохранённые результаты можно увидеть на странице [statistics.html](../statistics.html).

## Структура данных в Firebase

Результаты сохраняются в Firestore по следующему пути:
```
users/{userId}/lessonProgress/{lessonId}
```

Структура документа:
```javascript
{
    lessonId: "module-1-lesson-1",
    completed: true,
    score: 87.5,              // процент правильных ответов
    correctAnswers: 7,        // количество правильных ответов
    totalQuestions: 8,        // общее количество вопросов
    completedAt: timestamp,   // дата завершения
    lastAccessed: timestamp   // последний доступ
}
```

## Тестирование

После внесения изменений:
1. Откройте тест в браузере
2. Пройдите тест до конца
3. Откройте консоль браузера (F12)
4. Убедитесь, что видите сообщение "✅ Результаты сохранены"
5. Перейдите на страницу статистики и проверьте, что результат отображается

## Список файлов для обновления

Все тесты находятся в папке `theory/modules/practice/`:

**Модуль 1:**
- module-1-lesson-1-test.html ✅ (обновлён)
- module-1-lesson-2-test.html
- module-1-lesson-3-test.html

**Модуль 2:**
- module-2-lesson-1-test.html
- module-2-lesson-2-test.html
- module-2-lesson-3-test.html
- module-2-lesson-4-test.html

**Модуль 3:**
- module-3-lesson-1-test.html
- module-3-lesson-2-test.html
- module-3-lesson-3-test.html
- module-3-lesson-4-test.html
- module-3-lesson-5-test.html
- module-3-lesson-6-test.html
- module-3-lesson-7-test.html
- module-3-lesson-8-test.html

**Модуль 4:**
- module-4-lesson-1-test.html
- module-4-lesson-2-test.html
- module-4-lesson-3-test.html
- module-4-lesson-4-test.html

**Модуль 5:**
- module-5-lesson-1-test.html
- module-5-lesson-2-test.html
- module-5-lesson-3-test.html
- module-5-lesson-4-test.html

**Всего: 23 файла**
