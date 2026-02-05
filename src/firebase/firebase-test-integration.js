// Интеграция Firebase для сохранения прогресса тестов
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAHW6NZMKq_FUJSeQxzIt0HZvela223zi8",
    authDomain: "russian-orthography-course.firebaseapp.com",
    projectId: "russian-orthography-course",
    storageBucket: "russian-orthography-course.firebasestorage.app",
    messagingSenderId: "109056398196",
    appId: "1:109056398196:web:bc79e89ebe758203bf9221"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Сохранить результаты теста в Firebase
 * @param {string} lessonId - ID урока в формате "module-X-lesson-Y"
 * @param {number} score - Результат в процентах (0-100)
 * @param {number} correctAnswers - Количество правильных ответов
 * @param {number} totalQuestions - Общее количество вопросов
 */
export async function saveTestResult(lessonId, score, correctAnswers, totalQuestions) {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, 'users', user.uid, 'lessonProgress', lessonId);
                    
                    await setDoc(docRef, {
                        lessonId,
                        completed: true,
                        score: score,
                        correctAnswers: correctAnswers,
                        totalQuestions: totalQuestions,
                        completedAt: serverTimestamp(),
                        lastAccessed: serverTimestamp()
                    }, { merge: true });

                    console.log('✅ Результаты теста сохранены:', { lessonId, score });
                    resolve({ success: true, user: user.email });
                } catch (error) {
                    console.error('❌ Ошибка сохранения результатов:', error);
                    reject({ success: false, error: error.message });
                }
            } else {
                console.warn('⚠️ Пользователь не авторизован, результаты не сохранены');
                resolve({ success: false, error: 'Пользователь не авторизован' });
            }
        });
    });
}

/**
 * Проверить, авторизован ли пользователь
 */
export function checkAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(user ? { authenticated: true, user: user } : { authenticated: false });
        });
    });
}

export { auth, db };
