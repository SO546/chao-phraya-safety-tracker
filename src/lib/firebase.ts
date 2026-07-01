import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ดึงค่า Config จากไฟล์ .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ตรวจสอบไม่ให้ Firebase ทำงานซ้ำซ้อนเวลา Vite รีโหลดหน้าเว็บ
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ดึงตัวแปรฐานข้อมูล (db) ออกไปใช้งานในหน้าอื่น
export const db = getFirestore(app);
