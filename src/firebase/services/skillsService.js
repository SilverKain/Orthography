// Сервис для работы с матрицей навыков
import { db } from '../config.js';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Структура навыка:
 * {
 *   skillId: string,
 *   name: string,
 *   category: string, // 'orthography' или 'punctuation'
 *   level: number, // 0-5 (0 - не изучен, 5 - мастер)
 *   progress: number, // 0-100%
 *   practiceCount: number, // количество практик
 *   correctAnswers: number,
 *   totalAnswers: number,
 *   lastPracticed: timestamp,
 *   relatedLessons: array, // ID связанных уроков
 *   relatedExercises: array // ID связанных упражнений
 * }
 */

// Определение всех навыков курса (порядок соответствует порядку уроков)
export const SKILLS_DEFINITION = {
  // ОРФОГРАФИЯ - Модуль 1: Гласные
  'vowels-checked': {
    skillId: 'vowels-checked',
    name: 'Проверяемые безударные гласные',
    category: 'orthography',
    description: 'Умение проверять безударные гласные в корне слова',
    relatedLessons: ['lesson-01-vowels-checked'],
    relatedExercises: ['exercise-01-vowels-roots'],
    order: 1
  },
  'vowels-unchecked': {
    skillId: 'vowels-unchecked',
    name: 'Непроверяемые гласные (словарные слова)',
    category: 'orthography',
    description: 'Знание словарных слов',
    relatedLessons: ['lesson-02-vowels-unchecked'],
    relatedExercises: ['exercise-02-vowels-dictionary'],
    order: 2
  },
  'vowels-alternating': {
    skillId: 'vowels-alternating',
    name: 'Чередующиеся гласные в корне',
    category: 'orthography',
    description: 'Правописание корней с чередованием',
    relatedLessons: ['lesson-03-alternating-vowels'],
    relatedExercises: ['exercise-01-vowels-roots'],
    order: 3
  },
  
  // ОРФОГРАФИЯ - Модуль 2: Согласные
  'consonants-checked': {
    skillId: 'consonants-checked',
    name: 'Проверяемые согласные',
    category: 'orthography',
    description: 'Проверка согласных в слабой позиции',
    relatedLessons: ['lesson-04-consonants-checked'],
    relatedExercises: ['exercise-02-consonants'],
    order: 4
  },
  'consonants-unchecked': {
    skillId: 'consonants-unchecked',
    name: 'Непроизносимые согласные',
    category: 'orthography',
    description: 'Правописание непроизносимых согласных',
    relatedLessons: ['lesson-05-consonants-unchecked'],
    relatedExercises: ['exercise-02-consonants'],
    order: 5
  },
  'vowels-after-sibilants': {
    skillId: 'vowels-after-sibilants',
    name: 'Гласные после шипящих и Ц',
    category: 'orthography',
    description: 'О-Е после шипящих, И-Ы после Ц',
    relatedLessons: ['lesson-06-vowels-after-sibilants'],
    relatedExercises: ['exercise-02-consonants'],
    order: 6
  },
  
  // ОРФОГРАФИЯ - Модуль 3: Ь и Ъ знаки
  'soft-sign': {
    skillId: 'soft-sign',
    name: 'Употребление Ь и Ъ',
    category: 'orthography',
    description: 'Правила употребления мягкого и твёрдого знаков',
    relatedLessons: ['lesson-07-soft-sign'],
    relatedExercises: ['exercise-03-signs'],
    order: 7
  },
  
  // ОРФОГРАФИЯ - Модуль 4: Приставки
  'prefixes': {
    skillId: 'prefixes',
    name: 'Правописание приставок',
    category: 'orthography',
    description: 'Приставки на З-С, ПРЕ-ПРИ',
    relatedLessons: ['lesson-08-prefixes'],
    relatedExercises: ['exercise-04-prefixes-suffixes'],
    order: 8
  },
  
  // ОРФОГРАФИЯ - Модуль 5: Суффиксы
  'suffixes-nouns': {
    skillId: 'suffixes-nouns',
    name: 'Суффиксы существительных',
    category: 'orthography',
    description: 'ЕК-ИК, ЧИК-ЩИК и другие',
    relatedLessons: ['lesson-09-suffixes-nouns'],
    relatedExercises: ['exercise-04-prefixes-suffixes'],
    order: 9
  },
  'suffixes-adjectives': {
    skillId: 'suffixes-adjectives',
    name: 'Суффиксы прилагательных',
    category: 'orthography',
    description: 'Н и НН в прилагательных',
    relatedLessons: ['lesson-10-suffixes-adjectives'],
    relatedExercises: ['exercise-04-prefixes-suffixes'],
    order: 10
  },
  'verb-endings': {
    skillId: 'verb-endings',
    name: 'Личные окончания глаголов',
    category: 'orthography',
    description: 'Определение спряжения глаголов',
    relatedLessons: ['lesson-11-verb-endings'],
    relatedExercises: ['exercise-05-verbs-participles'],
    order: 11
  },
  'participles': {
    skillId: 'participles',
    name: 'Правописание причастий',
    category: 'orthography',
    description: 'Н и НН в причастиях, суффиксы',
    relatedLessons: ['lesson-12-participles'],
    relatedExercises: ['exercise-05-verbs-participles'],
    order: 12
  },
  
  // ОРФОГРАФИЯ - Модуль 6: Наречия и частицы
  'adverbs': {
    skillId: 'adverbs',
    name: 'Правописание наречий',
    category: 'orthography',
    description: 'Слитное, дефисное, раздельное написание',
    relatedLessons: ['lesson-13-adverbs'],
    relatedExercises: ['exercise-06-adverbs-particles'],
    order: 13
  },
  'particles-not-ne': {
    skillId: 'particles-not-ne',
    name: 'Частицы НЕ и НИ',
    category: 'orthography',
    description: 'Различение НЕ и НИ, слитное/раздельное',
    relatedLessons: ['lesson-14-particles-not-ne'],
    relatedExercises: ['exercise-06-adverbs-particles'],
    order: 14
  },
  
  // ОРФОГРАФИЯ - Модуль 7: Слитно/дефисно/раздельно
  'combined-words': {
    skillId: 'combined-words',
    name: 'Слитное, дефисное, раздельное написание',
    category: 'orthography',
    description: 'Общие правила написания слов',
    relatedLessons: ['lesson-15-combined-words'],
    relatedExercises: ['exercise-07-combined-writing'],
    order: 15
  },

  // ПУНКТУАЦИЯ - Модуль 8: Основы пунктуации
  'comma-placement': {
    skillId: 'comma-placement',
    name: 'Правила расположения запятых',
    category: 'punctuation',
    description: 'Систематизация всех правил запятых',
    relatedLessons: ['lesson-16-comma-rules-overview'],
    relatedExercises: ['exercise-09-comma-placement'],
    order: 16
  },
  'sentence-end': {
    skillId: 'sentence-end',
    name: 'Знаки в конце предложения',
    category: 'punctuation',
    description: 'Точка, вопросительный, восклицательный знаки',
    relatedLessons: ['lesson-17-sentence-end'],
    relatedExercises: ['exercise-10-simple-sentence'],
    order: 17
  },
  'homogeneous-members': {
    skillId: 'homogeneous-members',
    name: 'Однородные члены предложения',
    category: 'punctuation',
    description: 'Запятые при однородных членах',
    relatedLessons: ['lesson-18-homogeneous-members'],
    relatedExercises: ['exercise-11-homogeneous'],
    order: 18
  },
  'generalization-words': {
    skillId: 'generalization-words',
    name: 'Обобщающие слова',
    category: 'punctuation',
    description: 'Двоеточие и тире при обобщающих словах',
    relatedLessons: ['lesson-19-generalization-words'],
    relatedExercises: ['exercise-11-homogeneous'],
    order: 19
  },
  
  // ПУНКТУАЦИЯ - Модуль 9: Обособления
  'separate-definitions': {
    skillId: 'separate-definitions',
    name: 'Обособленные определения',
    category: 'punctuation',
    description: 'Причастные обороты и определения',
    relatedLessons: ['lesson-20-separate-definitions'],
    relatedExercises: ['exercise-12-separate-members'],
    order: 20
  },
  'separate-applications': {
    skillId: 'separate-applications',
    name: 'Обособленные приложения',
    category: 'punctuation',
    description: 'Выделение приложений',
    relatedLessons: ['lesson-21-separate-applications'],
    relatedExercises: ['exercise-12-separate-members'],
    order: 21
  },
  'separate-circumstances': {
    skillId: 'separate-circumstances',
    name: 'Обособленные обстоятельства',
    category: 'punctuation',
    description: 'Деепричастные обороты',
    relatedLessons: ['lesson-22-separate-circumstances'],
    relatedExercises: ['exercise-12-separate-members'],
    order: 22
  },
  'separate-additions': {
    skillId: 'separate-additions',
    name: 'Уточняющие члены предложения',
    category: 'punctuation',
    description: 'Уточняющие и поясняющие члены',
    relatedLessons: ['lesson-23-separate-additions'],
    relatedExercises: ['exercise-12-separate-members'],
    order: 23
  },
  
  // ПУНКТУАЦИЯ - Модуль 10: Обращения и вводные
  'appeals': {
    skillId: 'appeals',
    name: 'Обращения и вводные слова',
    category: 'punctuation',
    description: 'Выделение обращений и вводных слов',
    relatedLessons: ['lesson-24-appeals'],
    relatedExercises: ['exercise-13-insertions'],
    order: 24
  },
  'introductory-constructions': {
    skillId: 'introductory-constructions',
    name: 'Вводные конструкции',
    category: 'punctuation',
    description: 'Вводные предложения и вставные конструкции',
    relatedLessons: ['lesson-25-introductory-constructions'],
    relatedExercises: ['exercise-13-insertions'],
    order: 25
  },
  
  // ПУНКТУАЦИЯ - Модуль 11: Прямая речь
  'direct-speech': {
    skillId: 'direct-speech',
    name: 'Прямая речь и диалог',
    category: 'punctuation',
    description: 'Оформление чужой речи',
    relatedLessons: ['lesson-26-direct-speech'],
    relatedExercises: ['exercise-15-direct-speech'],
    order: 26
  },
  
  // ПУНКТУАЦИЯ - Модуль 12: Сложное предложение
  'complex-sentence': {
    skillId: 'complex-sentence',
    name: 'Сложносочинённое предложение',
    category: 'punctuation',
    description: 'Знаки в ССП',
    relatedLessons: ['lesson-27-complex-sentence'],
    relatedExercises: ['exercise-14-complex-sentence'],
    order: 27
  },
  'subordinate-clauses': {
    skillId: 'subordinate-clauses',
    name: 'Сложноподчинённое предложение',
    category: 'punctuation',
    description: 'Знаки в СПП',
    relatedLessons: ['lesson-28-subordinate-clauses'],
    relatedExercises: ['exercise-14-complex-sentence'],
    order: 28
  },
  'non-union-sentence': {
    skillId: 'non-union-sentence',
    name: 'Бессоюзное сложное предложение',
    category: 'punctuation',
    description: 'Двоеточие и тире в БСП',
    relatedLessons: ['lesson-29-non-union-sentence'],
    relatedExercises: ['exercise-14-complex-sentence'],
    order: 29
  },
  'complex-with-types': {
    skillId: 'complex-with-types',
    name: 'Сложные предложения с разными видами связи',
    category: 'punctuation',
    description: 'Комбинированные сложные предложения',
    relatedLessons: ['lesson-30-complex-with-types'],
    relatedExercises: ['exercise-14-complex-sentence'],
    order: 30
  },
  'quotes-parentheses': {
    skillId: 'quotes-parentheses',
    name: 'Кавычки, скобки, тире',
    category: 'punctuation',
    description: 'Особые случаи пунктуации',
    relatedLessons: ['lesson-31-quotes-parentheses'],
    relatedExercises: ['exercise-14-complex-sentence'],
    order: 31
  }
};

// Уровни владения навыком
export const SKILL_LEVELS = {
  0: { name: 'Не изучен', color: '#9e9e9e', emoji: '⚪' },
  1: { name: 'Новичок', color: '#f44336', emoji: '🔴' },
  2: { name: 'Начинающий', color: '#ff9800', emoji: '🟠' },
  3: { name: 'Практикующий', color: '#ffeb3b', emoji: '🟡' },
  4: { name: 'Опытный', color: '#8bc34a', emoji: '🟢' },
  5: { name: 'Мастер', color: '#4caf50', emoji: '🟢' }
};

class SkillsService {
  /**
   * Инициализировать навыки для нового пользователя
   */
  async initializeSkills(userId) {
    try {
      const skillsRef = collection(db, 'users', userId, 'skills');
      
      for (const [skillId, skillDef] of Object.entries(SKILLS_DEFINITION)) {
        const skillData = {
          ...skillDef,
          level: 0,
          progress: 0,
          practiceCount: 0,
          correctAnswers: 0,
          totalAnswers: 0,
          lastPracticed: null,
          createdAt: serverTimestamp()
        };
        
        await setDoc(doc(skillsRef, skillId), skillData);
      }
      
      return { success: true, message: 'Навыки инициализированы' };
    } catch (error) {
      console.error('Ошибка инициализации навыков:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить все навыки пользователя
   */
  async getAllSkills(userId) {
    try {
      const skillsRef = collection(db, 'users', userId, 'skills');
      const snapshot = await getDocs(skillsRef);
      
      if (snapshot.empty) {
        // Если навыков нет - инициализируем
        await this.initializeSkills(userId);
        return await this.getAllSkills(userId);
      }
      
      const skills = [];
      snapshot.forEach(doc => {
        skills.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: skills };
    } catch (error) {
      console.error('Ошибка получения навыков:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить навыки по категории
   */
  async getSkillsByCategory(userId, category) {
    try {
      const skillsRef = collection(db, 'users', userId, 'skills');
      const q = query(skillsRef, where('category', '==', category));
      const snapshot = await getDocs(q);
      
      const skills = [];
      snapshot.forEach(doc => {
        skills.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: skills };
    } catch (error) {
      console.error('Ошибка получения навыков по категории:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить один навык
   */
  async getSkill(userId, skillId) {
    try {
      const skillRef = doc(db, 'users', userId, 'skills', skillId);
      const snapshot = await getDoc(skillRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Навык не найден' };
      }
      
      return { success: true, data: { id: snapshot.id, ...snapshot.data() } };
    } catch (error) {
      console.error('Ошибка получения навыка:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Обновить прогресс навыка после практики
   */
  async updateSkillProgress(userId, skillId, correct, total) {
    try {
      const skillRef = doc(db, 'users', userId, 'skills', skillId);
      const snapshot = await getDoc(skillRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Навык не найден' };
      }
      
      const currentData = snapshot.data();
      const newCorrectAnswers = (currentData.correctAnswers || 0) + correct;
      const newTotalAnswers = (currentData.totalAnswers || 0) + total;
      const newProgress = Math.round((newCorrectAnswers / newTotalAnswers) * 100);
      
      // Определить уровень на основе прогресса и количества практик
      const practiceCount = (currentData.practiceCount || 0) + 1;
      let newLevel = currentData.level || 0;
      
      if (newProgress >= 90 && practiceCount >= 10) {
        newLevel = 5; // Мастер
      } else if (newProgress >= 80 && practiceCount >= 7) {
        newLevel = 4; // Опытный
      } else if (newProgress >= 70 && practiceCount >= 5) {
        newLevel = 3; // Практикующий
      } else if (newProgress >= 50 && practiceCount >= 3) {
        newLevel = 2; // Начинающий
      } else if (practiceCount >= 1) {
        newLevel = 1; // Новичок
      }
      
      await updateDoc(skillRef, {
        correctAnswers: newCorrectAnswers,
        totalAnswers: newTotalAnswers,
        progress: newProgress,
        level: newLevel,
        practiceCount: practiceCount,
        lastPracticed: serverTimestamp()
      });
      
      return { 
        success: true, 
        data: { 
          progress: newProgress, 
          level: newLevel,
          practiceCount: practiceCount
        } 
      };
    } catch (error) {
      console.error('Ошибка обновления навыка:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Обновить прогресс навыка напрямую (на основе суммы заданий)
   */
  async updateSkillProgressDirect(userId, skillId, progress, correctAnswers, totalAnswers) {
    try {
      const skillRef = doc(db, 'users', userId, 'skills', skillId);
      const snapshot = await getDoc(skillRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Навык не найден' };
      }
      
      const currentData = snapshot.data();
      const practiceCount = currentData.practiceCount || 1;
      
      // Определить уровень на основе прогресса и количества практик
      let newLevel = currentData.level || 0;
      
      if (progress >= 90 && practiceCount >= 10) {
        newLevel = 5; // Мастер
      } else if (progress >= 80 && practiceCount >= 7) {
        newLevel = 4; // Опытный
      } else if (progress >= 70 && practiceCount >= 5) {
        newLevel = 3; // Практикующий
      } else if (progress >= 50 && practiceCount >= 3) {
        newLevel = 2; // Начинающий
      } else if (practiceCount >= 1) {
        newLevel = 1; // Новичок
      }
      
      await updateDoc(skillRef, {
        correctAnswers: correctAnswers,
        totalAnswers: totalAnswers,
        progress: progress,
        level: newLevel,
        lastPracticed: serverTimestamp()
      });
      
      return { 
        success: true, 
        data: { 
          progress: progress, 
          level: newLevel
        } 
      };
    } catch (error) {
      console.error('Ошибка обновления прогресса навыка:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить статистику по всем навыкам
   */
  async getSkillsStats(userId) {
    try {
      const result = await this.getAllSkills(userId);
      if (!result.success) return result;
      
      const skills = result.data;
      
      const stats = {
        total: skills.length,
        byLevel: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        byCategory: { orthography: 0, punctuation: 0 },
        averageProgress: 0,
        masterSkills: 0,
        inProgressSkills: 0
      };
      
      let totalProgress = 0;
      
      skills.forEach(skill => {
        stats.byLevel[skill.level]++;
        stats.byCategory[skill.category]++;
        totalProgress += skill.progress;
        
        if (skill.level === 5) stats.masterSkills++;
        if (skill.level > 0 && skill.level < 5) stats.inProgressSkills++;
      });
      
      stats.averageProgress = Math.round(totalProgress / skills.length);
      
      return { success: true, data: stats };
    } catch (error) {
      console.error('Ошибка получения статистики навыков:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получить навыки, требующие практики (давно не практиковались)
   */
  async getSkillsNeedingPractice(userId, days = 7) {
    try {
      const result = await this.getAllSkills(userId);
      if (!result.success) return result;
      
      const skills = result.data;
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      const threshold = now - (days * dayInMs);
      
      const needingPractice = skills.filter(skill => {
        if (!skill.lastPracticed) return skill.level > 0; // Изучен, но не практиковался
        
        const lastPracticedMs = skill.lastPracticed.toMillis ? 
          skill.lastPracticed.toMillis() : skill.lastPracticed;
        
        return lastPracticedMs < threshold && skill.level < 5;
      });
      
      // Сортировать по дате последней практики (старые первыми)
      needingPractice.sort((a, b) => {
        if (!a.lastPracticed) return -1;
        if (!b.lastPracticed) return 1;
        
        const aTime = a.lastPracticed.toMillis ? a.lastPracticed.toMillis() : a.lastPracticed;
        const bTime = b.lastPracticed.toMillis ? b.lastPracticed.toMillis() : b.lastPracticed;
        
        return aTime - bTime;
      });
      
      return { success: true, data: needingPractice };
    } catch (error) {
      console.error('Ошибка получения навыков для практики:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Сбросить навык (для повторного изучения)
   */
  async resetSkill(userId, skillId) {
    try {
      const skillRef = doc(db, 'users', userId, 'skills', skillId);
      
      await updateDoc(skillRef, {
        level: 0,
        progress: 0,
        practiceCount: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        lastPracticed: null
      });
      
      return { success: true, message: 'Навык сброшен' };
    } catch (error) {
      console.error('Ошибка сброса навыка:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SkillsService();
