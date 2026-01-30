# Firebase Services Documentation

## Структура данных в Firestore

### Коллекции

```
users/
  {userId}/
    lessonProgress/
      {lessonId}/
        - lessonId: string
        - completed: boolean
        - score: number (0-100)
        - timeSpent: number (минуты)
        - lastAccessed: timestamp
        - completedAt: timestamp (optional)
    
    exerciseResults/
      {exerciseId}/
        - exerciseId: string
        - score: number (0-100)
        - attempts: number
        - completed: boolean
        - lastAttempt: timestamp
        - answers: array
        - mistakes: array
        - attemptHistory: array
    
    dictionary/
      {wordId}/
        - word: string
        - definition: string
        - example: string
        - mastered: boolean
        - addedAt: timestamp
        - masteredAt: timestamp (optional)
    
    stats/
      overall/
        - lessonsCompleted: number
        - exercisesCompleted: number
        - totalTimeSpent: number
        - averageScore: number
        - updatedAt: timestamp
```

## Сервисы

### AuthService

Управление аутентификацией пользователей.

#### Методы:

**register(email, password, displayName)**
```javascript
const result = await AuthService.register(
  'user@example.com',
  'password123',
  'Иван Иванов'
);
// { success: true, user: { uid, email, displayName } }
```

**login(email, password)**
```javascript
const result = await AuthService.login('user@example.com', 'password123');
// { success: true, user: { uid, email, displayName } }
```

**loginWithGoogle()**
```javascript
const result = await AuthService.loginWithGoogle();
// { success: true, user: { uid, email, displayName, photoURL } }
```

**logout()**
```javascript
await AuthService.logout();
```

**getCurrentUser()**
```javascript
const user = AuthService.getCurrentUser();
// { uid, email, displayName, ... } или null
```

**onAuthChange(callback)**
```javascript
const unsubscribe = AuthService.onAuthChange((user) => {
  if (user) {
    console.log('Пользователь вошел:', user);
  } else {
    console.log('Пользователь вышел');
  }
});

// Отписаться
unsubscribe();
```

**resetPassword(email)**
```javascript
await AuthService.resetPassword('user@example.com');
```

### ProgressService

Управление прогрессом обучения.

#### Методы:

**getLessonProgress(userId, lessonId)**
```javascript
const result = await ProgressService.getLessonProgress(userId, 'lesson-01');
// { success: true, data: { lessonId, completed, score, ... } }
```

**saveProgress(userId, lessonId, progressData)**
```javascript
await ProgressService.saveProgress(userId, 'lesson-01', {
  completed: true,
  score: 95,
  timeSpent: 45
});
```

**getAllProgress(userId)**
```javascript
const result = await ProgressService.getAllProgress(userId);
// { success: true, data: [...] }
```

**completeLesson(userId, lessonId, score)**
```javascript
await ProgressService.completeLesson(userId, 'lesson-01', 100);
```

**updateStudyTime(userId, lessonId, minutes)**
```javascript
await ProgressService.updateStudyTime(userId, 'lesson-01', 30);
```

**getModuleStats(userId, lessonIds)**
```javascript
const stats = await ProgressService.getModuleStats(userId, [
  'lesson-01',
  'lesson-02',
  'lesson-03'
]);
// { success: true, data: { completed, total, percentage, averageScore, totalTime } }
```

**getUserStats(userId)**
```javascript
const stats = await ProgressService.getUserStats(userId);
// { success: true, data: { lessonsCompleted, exercisesCompleted, totalTimeSpent, ... } }
```

### ExerciseService

Управление результатами упражнений.

#### Методы:

**saveResult(userId, exerciseId, resultData)**
```javascript
await ExerciseService.saveResult(userId, 'exercise-01', {
  score: 85,
  answers: ['ответ1', 'ответ2'],
  mistakes: ['ошибка1']
});
```

**getExerciseResult(userId, exerciseId)**
```javascript
const result = await ExerciseService.getExerciseResult(userId, 'exercise-01');
```

**getAllResults(userId)**
```javascript
const results = await ExerciseService.getAllResults(userId);
```

**getExerciseStats(userId)**
```javascript
const stats = await ExerciseService.getExerciseStats(userId);
// { completed, total, percentage, averageScore, totalAttempts, topMistakes }
```

**getExercisesNeedingReview(userId, threshold)**
```javascript
const needReview = await ExerciseService.getExercisesNeedingReview(userId, 70);
```

### DictionaryService

Управление личным словарем.

#### Методы:

**addWord(userId, word, definition, example)**
```javascript
await DictionaryService.addWord(
  userId,
  'орфография',
  'Система правил написания',
  'Правила орфографии сложны'
);
```

**getAllWords(userId)**
```javascript
const words = await DictionaryService.getAllWords(userId);
```

**searchWord(userId, query)**
```javascript
const results = await DictionaryService.searchWord(userId, 'орфо');
```

**markAsMastered(userId, wordId, mastered)**
```javascript
await DictionaryService.markAsMastered(userId, 'орфография', true);
```

**deleteWord(userId, wordId)**
```javascript
await DictionaryService.deleteWord(userId, wordId);
```

**getDictionaryStats(userId)**
```javascript
const stats = await DictionaryService.getDictionaryStats(userId);
// { total, mastered, unmastered, percentage }
```

## Правила безопасности Firestore

Добавьте в Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать и писать только свои данные
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Использование в коде

```javascript
import { AuthService } from './firebase/services/authService';
import { ProgressService } from './firebase/services/progressService';
import { ExerciseService } from './firebase/services/exerciseService';
import { DictionaryService } from './firebase/services/dictionaryService';

// Вход пользователя
const loginResult = await AuthService.login('user@example.com', 'password');

if (loginResult.success) {
  const userId = loginResult.user.uid;
  
  // Сохранить прогресс
  await ProgressService.completeLesson(userId, 'lesson-01', 95);
  
  // Сохранить результат упражнения
  await ExerciseService.saveResult(userId, 'exercise-01', {
    score: 88,
    answers: ['ответ'],
    mistakes: []
  });
  
  // Добавить слово в словарь
  await DictionaryService.addWord(userId, 'пунктуация', 'Знаки препинания', 'Правильная пунктуация важна');
}
```
