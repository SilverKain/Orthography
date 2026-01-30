// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Замените эти значения на ваши настройки из Firebase Console
// https://console.firebase.google.com/ → Project Settings → Your apps
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

// Инициализация сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
