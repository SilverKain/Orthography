// Сервис для работы с результатами упражнений
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  serverTimestamp,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../config';

export class ExerciseService {
  /**
   * Получить результаты упражнения
   */
  static async getExerciseResult(userId, exerciseId) {
    try {
      const docRef = doc(db, 'users', userId, 'exerciseResults', exerciseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Сохранить результат выполнения упражнения
   */
  static async saveResult(userId, exerciseId, resultData) {
    try {
      const docRef = doc(db, 'users', userId, 'exerciseResults', exerciseId);
      
      // Получаем текущие данные
      const existing = await getDoc(docRef);
      const currentAttempts = existing.exists() ? (existing.data().attempts || 0) : 0;

      const data = {
        exerciseId,
        score: resultData.score || 0,
        attempts: currentAttempts + 1,
        completed: resultData.score >= 80, // 80% - порог успешности
        lastAttempt: serverTimestamp(),
        answers: resultData.answers || [],
        mistakes: resultData.mistakes || [],
        taskResults: resultData.taskResults || [] // Добавляем результаты по каждому заданию
      };

      // Сохраняем историю попыток
      if (resultData.score !== undefined) {
        data.attemptHistory = arrayUnion({
          score: resultData.score,
          timestamp: new Date().toISOString(),
          mistakes: resultData.mistakes || []
        });
      }

      await setDoc(docRef, data, { merge: true });

      // Обновляем статистику, если упражнение завершено
      if (data.completed && currentAttempts === 0) {
        const statsRef = doc(db, 'users', userId, 'stats', 'overall');
        await setDoc(statsRef, {
          exercisesCompleted: increment(1),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить все результаты упражнений пользователя
   */
  static async getAllResults(userId) {
    try {
      const resultsRef = collection(db, 'users', userId, 'exerciseResults');
      const querySnapshot = await getDocs(resultsRef);
      
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить статистику по упражнениям
   */
  static async getExerciseStats(userId) {
    try {
      const results = await this.getAllResults(userId);
      
      if (!results.success) {
        return results;
      }

      const data = results.data;
      const completed = data.filter(r => r.completed).length;
      const total = data.length;
      const averageScore = data.length > 0
        ? Math.round(data.reduce((sum, r) => sum + (r.score || 0), 0) / data.length)
        : 0;
      const totalAttempts = data.reduce((sum, r) => sum + (r.attempts || 0), 0);

      // Анализ типичных ошибок
      const allMistakes = data.flatMap(r => r.mistakes || []);
      const mistakeFrequency = {};
      
      allMistakes.forEach(mistake => {
        mistakeFrequency[mistake] = (mistakeFrequency[mistake] || 0) + 1;
      });

      const topMistakes = Object.entries(mistakeFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([mistake, count]) => ({ mistake, count }));

      return {
        success: true,
        data: {
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          averageScore,
          totalAttempts,
          topMistakes
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить упражнения, требующие повторения
   */
  static async getExercisesNeedingReview(userId, threshold = 70) {
    try {
      const results = await this.getAllResults(userId);
      
      if (!results.success) {
        return results;
      }

      const needReview = results.data.filter(r => 
        r.score < threshold || !r.completed
      );

      return { success: true, data: needReview };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить последние попытки
   */
  static async getRecentAttempts(userId, limit = 5) {
    try {
      const results = await this.getAllResults(userId);
      
      if (!results.success) {
        return results;
      }

      const sorted = results.data.sort((a, b) => {
        const timeA = a.lastAttempt?.toMillis() || 0;
        const timeB = b.lastAttempt?.toMillis() || 0;
        return timeB - timeA;
      });

      return { success: true, data: sorted.slice(0, limit) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
