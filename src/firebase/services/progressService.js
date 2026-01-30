// Сервис для работы с прогрессом обучения в Firestore
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config';

export class ProgressService {
  /**
   * Получить прогресс пользователя по конкретному уроку
   */
  static async getLessonProgress(userId, lessonId) {
    try {
      const docRef = doc(db, 'users', userId, 'lessonProgress', lessonId);
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
   * Сохранить или обновить прогресс урока
   */
  static async saveProgress(userId, lessonId, progressData) {
    try {
      const docRef = doc(db, 'users', userId, 'lessonProgress', lessonId);
      
      const data = {
        lessonId,
        completed: progressData.completed || false,
        score: progressData.score || 0,
        timeSpent: progressData.timeSpent || 0,
        lastAccessed: serverTimestamp(),
        ...progressData
      };

      await setDoc(docRef, data, { merge: true });
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить весь прогресс пользователя
   */
  static async getAllProgress(userId) {
    try {
      const progressRef = collection(db, 'users', userId, 'lessonProgress');
      const querySnapshot = await getDocs(progressRef);
      
      const progress = [];
      querySnapshot.forEach((doc) => {
        progress.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Отметить урок как завершенный
   */
  static async completeLesson(userId, lessonId, score) {
    try {
      const docRef = doc(db, 'users', userId, 'lessonProgress', lessonId);
      
      await setDoc(docRef, {
        lessonId,
        completed: true,
        score: score || 100,
        completedAt: serverTimestamp(),
        lastAccessed: serverTimestamp()
      }, { merge: true });

      // Обновляем общую статистику пользователя
      await this.updateUserStats(userId, {
        lessonsCompleted: increment(1)
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Обновить время изучения урока
   */
  static async updateStudyTime(userId, lessonId, minutes) {
    try {
      const docRef = doc(db, 'users', userId, 'lessonProgress', lessonId);
      
      await setDoc(docRef, {
        lessonId,
        timeSpent: increment(minutes),
        lastAccessed: serverTimestamp()
      }, { merge: true });

      // Обновляем общее время обучения
      await this.updateUserStats(userId, {
        totalTimeSpent: increment(minutes)
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить статистику по модулю (группе уроков)
   */
  static async getModuleStats(userId, lessonIds) {
    try {
      const progress = await this.getAllProgress(userId);
      
      if (!progress.success) {
        return progress;
      }

      const moduleProgress = progress.data.filter(p => 
        lessonIds.includes(p.lessonId)
      );

      const completed = moduleProgress.filter(p => p.completed).length;
      const total = lessonIds.length;
      const averageScore = moduleProgress.length > 0
        ? Math.round(moduleProgress.reduce((sum, p) => sum + (p.score || 0), 0) / moduleProgress.length)
        : 0;
      const totalTime = moduleProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

      return {
        success: true,
        data: {
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          averageScore,
          totalTime
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить последние изученные уроки
   */
  static async getRecentLessons(userId, limit = 5) {
    try {
      const progressRef = collection(db, 'users', userId, 'lessonProgress');
      const querySnapshot = await getDocs(progressRef);
      
      const lessons = [];
      querySnapshot.forEach((doc) => {
        lessons.push({ id: doc.id, ...doc.data() });
      });

      // Сортируем по lastAccessed
      lessons.sort((a, b) => {
        const timeA = a.lastAccessed?.toMillis() || 0;
        const timeB = b.lastAccessed?.toMillis() || 0;
        return timeB - timeA;
      });

      return { 
        success: true, 
        data: lessons.slice(0, limit) 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Обновить общую статистику пользователя
   */
  static async updateUserStats(userId, stats) {
    try {
      const statsRef = doc(db, 'users', userId, 'stats', 'overall');
      await setDoc(statsRef, {
        ...stats,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить общую статистику пользователя
   */
  static async getUserStats(userId) {
    try {
      const statsRef = doc(db, 'users', userId, 'stats', 'overall');
      const docSnap = await getDoc(statsRef);
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { 
          success: true, 
          data: {
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            totalTimeSpent: 0,
            averageScore: 0
          }
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
