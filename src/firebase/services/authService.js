// Сервис аутентификации пользователей
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config';

export class AuthService {
  /**
   * Регистрация нового пользователя
   */
  static async register(email, password, displayName = '') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Вход по email и паролю
   */
  static async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Вход через Google
   */
  static async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Выход из системы
   */
  static async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Получить текущего пользователя
   */
  static getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Подписка на изменения состояния аутентификации
   */
  static onAuthChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        callback(null);
      }
    });
  }

  /**
   * Сброс пароля
   */
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Письмо для сброса пароля отправлено на ' + email
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Обновить профиль пользователя
   */
  static async updateUserProfile(displayName, photoURL = null) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      const updates = { displayName };
      if (photoURL) {
        updates.photoURL = photoURL;
      }

      await updateProfile(user, updates);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Перевод кодов ошибок Firebase
   */
  static getErrorMessage(errorCode) {
    const errors = {
      'auth/email-already-in-use': 'Этот email уже используется',
      'auth/invalid-email': 'Неверный формат email',
      'auth/operation-not-allowed': 'Операция не разрешена',
      'auth/weak-password': 'Слишком простой пароль (минимум 6 символов)',
      'auth/user-disabled': 'Пользователь заблокирован',
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
      'auth/network-request-failed': 'Ошибка сети. Проверьте подключение к интернету',
      'auth/popup-closed-by-user': 'Окно входа закрыто',
      'auth/cancelled-popup-request': 'Запрос отменен'
    };

    return errors[errorCode] || 'Произошла ошибка: ' + errorCode;
  }
}
