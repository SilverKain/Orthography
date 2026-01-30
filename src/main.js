// Главный файл приложения
import { AuthService } from './firebase/services/authService.js';
import { ProgressService } from './firebase/services/progressService.js';
import { ExerciseService } from './firebase/services/exerciseService.js';
import { DictionaryService } from './firebase/services/dictionaryService.js';
import SkillsService from './firebase/services/skillsService.js';

console.log('🚀 Курс русского языка загружен');
console.log('🔥 Firebase подключен');
console.log('📊 Система навыков готова');

// Инициализация приложения
async function initApp() {
  try {
    // Проверка аутентификации
    AuthService.onAuthChange(async (user) => {
      if (user) {
        console.log('✅ Пользователь вошел:', user.email);
        
        // Создаем демо-данные для демо-пользователя
        if (user.email === 'demo@example.com') {
          await createDemoData(user.uid);
        }
        
        // Отображение информации
        await displayInfo(user.uid);
      } else {
        console.log('❌ Пользователь не авторизован');
        displayLoginForm();
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
  }
}

// Создание демонстрационных данных
async function createDemoData(userId) {
  console.log('📝 Создание демо-данных...');
  
  try {
    // Инициализируем навыки для нового пользователя
    await SkillsService.initializeSkills(userId);

    // Добавляем прогресс по первому уроку
    await ProgressService.saveProgress(userId, 'lesson-01-vowels-checked', {
      completed: true,
      score: 95,
      timeSpent: 45
    });

    // Обновляем навык после выполнения упражнения
    await SkillsService.updateSkillProgress(userId, 'vowels-checked', 9, 10);

    // Добавляем результат упражнения
    await ExerciseService.saveResult(userId, 'exercise-01-vowels-roots', {
      score: 88,
      answers: ['ответ1', 'ответ2', 'ответ3'],
      mistakes: ['ошибка при написании чередующейся гласной']
    });

    // Добавляем слово в словарь
    await DictionaryService.addWord(
      userId,
      'орфография',
      'Система правил написания слов и их значимых частей',
      'Знание орфографии необходимо для грамотного письма'
    );

    console.log('✅ Демо-данные созданы');
  } catch (error) {
    console.error('❌ Ошибка создания демо-данных:', error);
  }
}

// Форма входа
function displayLoginForm() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px;">
      <h1>🔐 Вход в систему</h1>
      <div style="margin: 20px 0;">
        <input type="email" id="email" placeholder="Email" 
               style="width: 100%; padding: 10px; margin: 5px 0; box-sizing: border-box;">
        <input type="password" id="password" placeholder="Пароль" 
               style="width: 100%; padding: 10px; margin: 5px 0; box-sizing: border-box;">
        <button id="loginBtn" style="width: 100%; padding: 10px; background: #4CAF50; 
                color: white; border: none; cursor: pointer; margin: 5px 0;">
          Войти
        </button>
        <button id="googleBtn" style="width: 100%; padding: 10px; background: #DB4437; 
                color: white; border: none; cursor: pointer; margin: 5px 0;">
          Войти через Google
        </button>
        <button id="demoBtn" style="width: 100%; padding: 10px; background: #2196F3; 
                color: white; border: none; cursor: pointer; margin: 5px 0;">
          Демо-вход (demo@example.com)
        </button>
      </div>
      <div id="error" style="color: red; margin-top: 10px;"></div>
    </div>
  `;

  // Обработчики
  document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const result = await AuthService.login(email, password);
    
    if (!result.success) {
      document.getElementById('error').textContent = result.error;
    }
  };

  document.getElementById('googleBtn').onclick = async () => {
    const result = await AuthService.loginWithGoogle();
    if (!result.success) {
      document.getElementById('error').textContent = result.error;
    }
  };

  document.getElementById('demoBtn').onclick = async () => {
    const errorEl = document.getElementById('error');
    errorEl.textContent = 'Попытка входа...';
    
    // Сначала пытаемся войти
    let result = await AuthService.login('demo@example.com', 'demo123456');
    
    // Если пользователь не существует, создаём его
    if (!result.success && result.error.includes('пользовател')) {
      errorEl.textContent = 'Создаём демо-пользователя...';
      result = await AuthService.register('demo@example.com', 'demo123456', 'Демо-пользователь');
      
      if (result.success) {
        errorEl.textContent = 'Демо-пользователь создан! Вход выполнен.';
      }
    }
    
    if (!result.success) {
      errorEl.textContent = 'Ошибка: ' + result.error;
    }
  };
}

// Структура курса
const courseStructure = {
  theory: [
    { id: 'lesson-01-vowels-checked', module: 1, title: '1. Проверяемые гласные в корне', file: 'theory/01-orthography/lesson-01-vowels-checked.md' },
    { id: 'lesson-02-vowels-unchecked', module: 1, title: '2. Непроверяемые гласные в корне', file: 'theory/01-orthography/lesson-02-vowels-unchecked.md' },
    { id: 'lesson-03-alternating-vowels', module: 1, title: '3. Чередующиеся гласные в корне', file: 'theory/01-orthography/lesson-03-alternating-vowels.md' },
    { id: 'lesson-04-consonants-checked', module: 2, title: '4. Проверяемые согласные', file: 'theory/01-orthography/lesson-04-consonants-checked.md' },
    { id: 'lesson-05-consonants-unchecked', module: 2, title: '5. Непроверяемые согласные', file: 'theory/01-orthography/lesson-05-consonants-unchecked.md' },
    { id: 'lesson-06-vowels-after-sibilants', module: 2, title: '6. Гласные после шипящих и Ц', file: 'theory/01-orthography/lesson-06-vowels-after-sibilants.md' },
    { id: 'lesson-07-soft-sign', module: 3, title: '7. Употребление Ь и Ъ', file: 'theory/01-orthography/lesson-07-soft-sign.md' },
    { id: 'lesson-08-prefixes', module: 4, title: '8. Правописание приставок', file: 'theory/01-orthography/lesson-08-prefixes.md' },
    { id: 'lesson-09-suffixes-nouns', module: 5, title: '9. Суффиксы существительных', file: 'theory/01-orthography/lesson-09-suffixes-nouns.md' },
    { id: 'lesson-10-suffixes-adjectives', module: 5, title: '10. Суффиксы прилагательных', file: 'theory/01-orthography/lesson-10-suffixes-adjectives.md' },
    { id: 'lesson-11-verb-endings', module: 5, title: '11. Личные окончания глаголов', file: 'theory/01-orthography/lesson-11-verb-endings.md' },
    { id: 'lesson-12-participles', module: 5, title: '12. Правописание причастий', file: 'theory/01-orthography/lesson-12-participles.md' },
    { id: 'lesson-13-adverbs', module: 6, title: '13. Правописание наречий', file: 'theory/01-orthography/lesson-13-adverbs.md' },
    { id: 'lesson-14-particles-not-ne', module: 6, title: '14. Частицы НЕ и НИ', file: 'theory/01-orthography/lesson-14-particles-not-ne.md' },
    { id: 'lesson-15-combined-words', module: 7, title: '15. Слитное, дефисное, раздельное', file: 'theory/01-orthography/lesson-15-combined-words.md' },
    { id: 'lesson-16-comma-rules-overview', module: 8, title: '16. Правила расположения запятых', file: 'theory/02-punctuation/lesson-16-comma-rules-overview.md' },
    { id: 'lesson-17-sentence-end', module: 8, title: '17. Знаки в конце предложения', file: 'theory/02-punctuation/lesson-17-sentence-end.md' },
    { id: 'lesson-18-homogeneous-members', module: 8, title: '18. Однородные члены', file: 'theory/02-punctuation/lesson-18-homogeneous-members.md' },
    { id: 'lesson-19-generalization-words', module: 8, title: '19. Обобщающие слова', file: 'theory/02-punctuation/lesson-19-generalization-words.md' },
    { id: 'lesson-20-separate-definitions', module: 9, title: '20. Обособленные определения', file: 'theory/02-punctuation/lesson-20-separate-definitions.md' },
    { id: 'lesson-21-separate-applications', module: 9, title: '21. Обособленные приложения', file: 'theory/02-punctuation/lesson-21-separate-applications.md' },
    { id: 'lesson-22-separate-circumstances', module: 9, title: '22. Обособленные обстоятельства', file: 'theory/02-punctuation/lesson-22-separate-circumstances.md' },
    { id: 'lesson-23-separate-additions', module: 9, title: '23. Уточняющие члены', file: 'theory/02-punctuation/lesson-23-separate-additions.md' },
    { id: 'lesson-24-appeals', module: 10, title: '24. Обращения и вводные слова', file: 'theory/02-punctuation/lesson-24-appeals.md' },
    { id: 'lesson-25-introductory-constructions', module: 10, title: '25. Вводные конструкции', file: 'theory/02-punctuation/lesson-25-introductory-constructions.md' },
    { id: 'lesson-26-direct-speech', module: 11, title: '26. Прямая речь и диалог', file: 'theory/02-punctuation/lesson-26-direct-speech.md' },
    { id: 'lesson-27-complex-sentence', module: 12, title: '27. Сложносочинённое предложение', file: 'theory/02-punctuation/lesson-27-complex-sentence.md' },
    { id: 'lesson-28-subordinate-clauses', module: 12, title: '28. Сложноподчинённое предложение', file: 'theory/02-punctuation/lesson-28-subordinate-clauses.md' },
    { id: 'lesson-29-non-union-sentence', module: 12, title: '29. Бессоюзное предложение', file: 'theory/02-punctuation/lesson-29-non-union-sentence.md' },
    { id: 'lesson-30-complex-with-types', module: 12, title: '30. Предложения с разными видами связи', file: 'theory/02-punctuation/lesson-30-complex-with-types.md' },
    { id: 'lesson-31-quotes-parentheses', module: 12, title: '31. Кавычки, скобки, тире', file: 'theory/02-punctuation/lesson-31-quotes-parentheses.md' }
  ],
  practice: [
    { id: 'exercise-01-vowels-roots', title: '1. Гласные в корнях', file: 'practice/exercise-01-vowels-roots.md' },
    { id: 'exercise-02-consonants', title: '2. Согласные в словах', file: 'practice/exercise-02-consonants.md' },
    { id: 'exercise-03-signs', title: '3. Ь и Ъ знаки', file: 'practice/exercise-03-signs.md' },
    { id: 'exercise-04-prefixes-suffixes', title: '4. Приставки и суффиксы', file: 'practice/exercise-04-prefixes-suffixes.md' },
    { id: 'exercise-05-verbs-participles', title: '5. Глаголы и причастия', file: 'practice/exercise-05-verbs-participles.md' },
    { id: 'exercise-06-adverbs-particles', title: '6. Наречия и частицы', file: 'practice/exercise-06-adverbs-particles.md' },
    { id: 'exercise-07-combined-writing', title: '7. Слитно, дефисно, раздельно', file: 'practice/exercise-07-combined-writing.md' },
    { id: 'exercise-08-complete-orthography', title: '8. Комплексная орфография', file: 'practice/exercise-08-complete-orthography.md' },
    { id: 'exercise-09-comma-placement', title: '9. Расположение запятых', file: 'practice/exercise-09-comma-placement.md' },
    { id: 'exercise-10-simple-sentence', title: '10. Простое предложение', file: 'practice/exercise-10-simple-sentence.md' },
    { id: 'exercise-11-homogeneous', title: '11. Однородные члены', file: 'practice/exercise-11-homogeneous.md' },
    { id: 'exercise-12-separate-members', title: '12. Обособленные члены', file: 'practice/exercise-12-separate-members.md' },
    { id: 'exercise-13-insertions', title: '13. Обращения и вводные', file: 'practice/exercise-13-insertions.md' },
    { id: 'exercise-14-complex-sentence', title: '14. Сложное предложение', file: 'practice/exercise-14-complex-sentence.md' },
    { id: 'exercise-15-direct-speech', title: '15. Прямая речь', file: 'practice/exercise-15-direct-speech.md' },
    { id: 'exercise-16-final-dictation', title: '16. Итоговый диктант', file: 'practice/exercise-16-final-dictation.md' }
  ]
};

const moduleNames = {
  1: 'Модуль 1: Гласные',
  2: 'Модуль 2: Согласные',
  3: 'Модуль 3: Ь и Ъ знаки',
  4: 'Модуль 4: Приставки',
  5: 'Модуль 5: Суффиксы',
  6: 'Модуль 6: Наречия и частицы',
  7: 'Модуль 7: Слитно/дефисно/раздельно',
  8: 'Модуль 8: Основы пунктуации',
  9: 'Модуль 9: Обособления',
  10: 'Модуль 10: Обращения и вводные',
  11: 'Модуль 11: Прямая речь',
  12: 'Модуль 12: Сложное предложение'
};

// Отображение информации на странице
async function displayInfo(userId) {
  const app = document.getElementById('app');
  
  if (!app) {
    console.error('Элемент #app не найден');
    return;
  }

  const user = AuthService.getCurrentUser();
  
  // Получаем все данные
  const progressResult = await ProgressService.getAllProgress(userId);
  const exercisesResult = await ExerciseService.getAllResults(userId);
  const dictionaryResult = await DictionaryService.getAllWords(userId);
  const statsResult = await ProgressService.getUserStats(userId);
  const skillsStatsResult = await SkillsService.getSkillsStats(userId);

  // Извлекаем данные или используем значения по умолчанию
  const progress = progressResult.success ? progressResult.data : [];
  const exercises = exercisesResult.success ? exercisesResult.data : [];
  const dictionary = dictionaryResult.success ? dictionaryResult.data : [];
  const stats = statsResult.success ? statsResult.data : {};
  const skillsStats = skillsStatsResult.success ? skillsStatsResult.data : {};

  // Создаем карту прогресса для быстрого доступа
  const progressMap = {};
  progress.forEach(p => {
    progressMap[p.lessonId] = p;
  });
  
  const exercisesMap = {};
  exercises.forEach(e => {
    exercisesMap[e.exerciseId] = e;
  });

  app.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 20px auto; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #2196F3;">
        <h1 style="margin: 0;">📘 Курс русского языка: Орфография и Пунктуация</h1>
        <div style="text-align: right;">
          <div style="margin-bottom: 5px;">👤 ${user.displayName || user.email}</div>
          <button onclick="window.logout()" style="padding: 5px 15px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Выйти</button>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
          <div style="font-size: 36px; font-weight: bold;">${stats.lessonsCompleted || 0}/31</div>
          <div style="font-size: 14px; opacity: 0.9;">Уроков завершено</div>
        </div>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
          <div style="font-size: 36px; font-weight: bold;">${stats.exercisesCompleted || 0}/16</div>
          <div style="font-size: 14px; opacity: 0.9;">Упражнений выполнено</div>
        </div>
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
          <div style="font-size: 36px; font-weight: bold;">${stats.averageScore || 0}%</div>
          <div style="font-size: 14px; opacity: 0.9;">Средний балл</div>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <a href="/skills-matrix.html" style="display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(33,150,243,0.3);">
          📊 Открыть матрицу навыков
        </a>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
        
        <!-- Теория -->
        <div style="background: white; border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px;">
          <h2 style="margin-top: 0; color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">📚 Теория (31 урок)</h2>
          <div style="max-height: 600px; overflow-y: auto;">
            ${generateModuleLessons(courseStructure.theory, progressMap, moduleNames)}
          </div>
        </div>

        <!-- Практика -->
        <div style="background: white; border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px;">
          <h2 style="margin-top: 0; color: #c2185b; border-bottom: 2px solid #c2185b; padding-bottom: 10px;">✍️ Практика (16 упражнений)</h2>
          <div style="max-height: 600px; overflow-y: auto;">
            ${generatePracticeList(courseStructure.practice, exercisesMap)}
          </div>
        </div>
      </div>
      
      ${dictionary.length > 0 ? `
      <div style="background: #fff8e1; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #ffc107;">
        <h2 style="margin-top: 0; color: #f57c00;">📖 Личный словарь</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
          ${dictionary.slice(0, 6).map(w => `
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-weight: bold; color: #e65100; font-size: 18px; margin-bottom: 8px;">${w.word}</div>
              <div style="color: #555; font-size: 14px; line-height: 1.4;">${w.definition}</div>
            </div>
          `).join('')}
        </div>
        ${dictionary.length > 6 ? `<div style="margin-top: 15px; text-align: center; color: #666;">И ещё ${dictionary.length - 6} слов...</div>` : ''}
      </div>
      ` : ''}
    </div>
  `;
}

// Генерация списка уроков по модулям
function generateModuleLessons(lessons, progressMap, moduleNames) {
  let currentModule = 0;
  let html = '';
  
  lessons.forEach(lesson => {
    if (lesson.module !== currentModule) {
      if (currentModule !== 0) {
        html += '</div>';
      }
      currentModule = lesson.module;
      html += `
        <div style="margin-bottom: 20px;">
          <h3 style="background: #e3f2fd; padding: 10px; border-radius: 6px; font-size: 14px; color: #1565c0; margin: 15px 0 10px 0;">
            ${moduleNames[currentModule]}
          </h3>
      `;
    }
    
    const lessonProgress = progressMap[lesson.id];
    const completed = lessonProgress && lessonProgress.completed;
    const score = lessonProgress ? lessonProgress.score || 0 : 0;
    
    html += `
      <div style="display: flex; align-items: center; padding: 10px; margin: 5px 0; background: ${completed ? '#e8f5e9' : '#f5f5f5'}; border-radius: 6px; border-left: 4px solid ${completed ? '#4caf50' : '#9e9e9e'}; cursor: pointer; transition: all 0.2s;" 
           onclick="openLesson('${lesson.file}', '${lesson.id}')"
           onmouseover="this.style.background='${completed ? '#c8e6c9' : '#eeeeee'}'"
           onmouseout="this.style.background='${completed ? '#e8f5e9' : '#f5f5f5'}'">
        <div style="flex: 1;">
          <div style="font-weight: 500; color: #333;">${lesson.title}</div>
          ${completed ? `<div style="font-size: 12px; color: #4caf50; margin-top: 3px;">✅ Завершено • Балл: ${score}</div>` : ''}
        </div>
        <div style="font-size: 20px;">${completed ? '✅' : '⭕'}</div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

// Генерация списка практических заданий
function generatePracticeList(exercises, exercisesMap) {
  return exercises.map(exercise => {
    const result = exercisesMap[exercise.id];
    const completed = result && result.attempts > 0;
    const score = result ? result.score || 0 : 0;
    const attempts = result ? result.attempts || 0 : 0;
    
    return `
      <div style="display: flex; align-items: center; padding: 12px; margin: 8px 0; background: ${completed ? '#fce4ec' : '#f5f5f5'}; border-radius: 6px; border-left: 4px solid ${completed ? '#e91e63' : '#9e9e9e'}; cursor: pointer; transition: all 0.2s;"
           onclick="openPractice('${exercise.file}', '${exercise.id}')"
           onmouseover="this.style.background='${completed ? '#f8bbd0' : '#eeeeee'}'"
           onmouseout="this.style.background='${completed ? '#fce4ec' : '#f5f5f5'}'">
        <div style="flex: 1;">
          <div style="font-weight: 500; color: #333;">${exercise.title}</div>
          ${completed ? `<div style="font-size: 12px; color: #c2185b; margin-top: 3px;">✅ Балл: ${score} • Попыток: ${attempts}</div>` : ''}
        </div>
        <div style="font-size: 20px;">${completed ? '✅' : '⭕'}</div>
      </div>
    `;
  }).join('');
}

// Функции для открытия уроков и практики
window.openLesson = function(file, lessonId) {
  console.log('Открыть урок:', file, lessonId);
  
  // Преобразуем путь к файлу в HTML версию
  const htmlFile = file.replace('.md', '.html');
  
  // Открываем урок
  window.location.href = '/' + htmlFile;
};

window.openPractice = function(file, exerciseId) {
  console.log('Открыть упражнение:', file, exerciseId);
  
  // Преобразуем путь к файлу в HTML версию  
  const htmlFile = file.replace('.md', '.html');
  
  // Открываем упражнение
  window.location.href = '/' + htmlFile;
};

// Запуск приложения
initApp();

// Экспорт для использования в консоли браузера
window.AuthService = AuthService;
window.ProgressService = ProgressService;
window.ExerciseService = ExerciseService;
window.DictionaryService = DictionaryService;
window.currentUserId = null;

// Обновляем currentUserId при изменении пользователя
AuthService.onAuthChange((user) => {
  window.currentUserId = user ? user.uid : null;
});

// Функция выхода
window.logout = async () => {
  await AuthService.logout();
  window.location.reload();
};
