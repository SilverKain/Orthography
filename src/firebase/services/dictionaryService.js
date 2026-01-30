// Сервис для работы с личным словарем пользователя
import { 
  doc, 
  getDoc,
  setDoc,
  deleteDoc,
  collection, 
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config';

export class DictionaryService {
  /**
   * Добавить слово в словарь
   */
  static async addWord(userId, word, definition, example = '') {
    try {
      // Используем слово как ID документа для предотвращения дубликатов
      const wordId = word.toLowerCase().replace(/\s+/g, '-');
      const docRef = doc(db, 'users', userId, 'dictionary', wordId);
      
      const data = {
        word,
        definition,
        example,
        mastered: false,
        addedAt: serverTimestamp()
      };

      await setDoc(docRef, data, { merge: true });
      
      return { success: true, data: { id: wordId, ...data } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить все слова из словаря
   */
  static async getAllWords(userId) {
    try {
      const dictRef = collection(db, 'users', userId, 'dictionary');
      const querySnapshot = await getDocs(dictRef);
      
      const words = [];
      querySnapshot.forEach((doc) => {
        words.push({ id: doc.id, ...doc.data() });
      });

      // Сортируем по дате добавления (новые первыми)
      words.sort((a, b) => {
        const timeA = a.addedAt?.toMillis() || 0;
        const timeB = b.addedAt?.toMillis() || 0;
        return timeB - timeA;
      });
      
      return { success: true, data: words };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Поиск слова в словаре
   */
  static async searchWord(userId, searchQuery) {
    try {
      const allWords = await this.getAllWords(userId);
      
      if (!allWords.success) {
        return allWords;
      }

      const lowerQuery = searchQuery.toLowerCase();
      const filtered = allWords.data.filter(item =>
        item.word.toLowerCase().includes(lowerQuery) ||
        item.definition.toLowerCase().includes(lowerQuery) ||
        (item.example && item.example.toLowerCase().includes(lowerQuery))
      );

      return { success: true, data: filtered };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Отметить слово как изученное
   */
  static async markAsMastered(userId, wordId, mastered = true) {
    try {
      const docRef = doc(db, 'users', userId, 'dictionary', wordId);
      
      await updateDoc(docRef, {
        mastered,
        masteredAt: mastered ? serverTimestamp() : null
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить неизученные слова
   */
  static async getUnmasteredWords(userId) {
    try {
      const allWords = await this.getAllWords(userId);
      
      if (!allWords.success) {
        return allWords;
      }

      const unmastered = allWords.data.filter(w => !w.mastered);
      
      return { success: true, data: unmastered };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Удалить слово из словаря
   */
  static async deleteWord(userId, wordId) {
    try {
      const docRef = doc(db, 'users', userId, 'dictionary', wordId);
      await deleteDoc(docRef);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Обновить слово в словаре
   */
  static async updateWord(userId, wordId, updates) {
    try {
      const docRef = doc(db, 'users', userId, 'dictionary', wordId);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить статистику словаря
   */
  static async getDictionaryStats(userId) {
    try {
      const allWords = await this.getAllWords(userId);
      
      if (!allWords.success) {
        return allWords;
      }

      const total = allWords.data.length;
      const mastered = allWords.data.filter(w => w.mastered).length;

      return {
        success: true,
        data: {
          total,
          mastered,
          unmastered: total - mastered,
          percentage: total > 0 ? Math.round((mastered / total) * 100) : 0
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
