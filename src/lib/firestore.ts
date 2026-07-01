/**
 * Firebase Firestore Cloud Storage Module
 * ใช้เป็นฐานข้อมูลกลางบนคลาวด์เพื่อ sync ข้อมูลข้ามเครื่อง
 */
import { getApps, getApp, initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase (reuse existing app if already initialized from auth.ts)
let firebaseApp = getApps().length ? getApp() : null;
if (!firebaseApp) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('[Firebase] App initialized successfully');
  } catch (error) {
    console.error('[Firebase] Failed to initialize app:', error);
    throw error;
  }
}

// Initialize Firestore with error handling
let db: ReturnType<typeof getFirestore>;
try {
  db = getFirestore(firebaseApp);
  console.log('[Firebase] Firestore initialized successfully for project:', firebaseConfig.projectId);
} catch (error) {
  console.error('[Firebase] Failed to initialize Firestore:', error);
  throw error;
}

// Export db for use in other components
export { db };

// Single shared document ID for all app data
const SHARED_DOC_ID = 'shared_fleet_data';

/** The last encountered Firestore error message, if any */
let lastFirestoreError: string | null = null;

/**
 * Helper to wrap a promise with a timeout.
 * Prevents hanging indefinitely if Firestore isn't created or network is down.
 */
function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Firebase operation timeout (Firestore might not be initialized or connection is slow)'));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Save data to Firestore under a specific key in the shared document.
 * Non-blocking for auto-saves, but throws for manual saves.
 */
export async function saveToCloud(key: string, data: any): Promise<void> {
  try {
    lastFirestoreError = null; // Clear previous error on retry
    const docRef = doc(db, 'app_data', SHARED_DOC_ID);
    await withTimeout(
      setDoc(docRef, { [key]: JSON.stringify(data), [`${key}_updatedAt`]: new Date().toISOString() }, { merge: true }),
      5000
    );
  } catch (error: any) {
    const errMsg = error.message || String(error);
    console.warn(`[Firestore] saveToCloud("${key}") failed:`, errMsg);
    lastFirestoreError = errMsg;
    throw error; // Propagate error so caller can toast or handle it
  }
}

/**
 * Load data from Firestore for a specific key.
 */
export async function loadFromCloud<T = any>(key: string): Promise<T | null> {
  try {
    lastFirestoreError = null;
    const docRef = doc(db, 'app_data', SHARED_DOC_ID);
    const snapshot = await withTimeout(getDoc(docRef), 5000);
    if (snapshot.exists()) {
      const raw = snapshot.data()[key];
      if (raw) {
        return JSON.parse(raw) as T;
      }
    }
    return null;
  } catch (error: any) {
    const errMsg = error.message || String(error);
    console.warn(`[Firestore] loadFromCloud("${key}") failed:`, errMsg);
    lastFirestoreError = errMsg;
    throw error;
  }
}

/**
 * Delete a key from the shared Firestore document.
 */
export async function deleteFromCloud(key: string): Promise<void> {
  try {
    const docRef = doc(db, 'app_data', SHARED_DOC_ID);
    await withTimeout(
      setDoc(docRef, { [key]: null, [`${key}_updatedAt`]: null }, { merge: true }),
      5000
    );
  } catch (error: any) {
    console.warn(`[Firestore] deleteFromCloud("${key}") failed:`, error.message || error);
  }
}

/**
 * Load ALL app data from Firestore in a single read.
 */
export async function loadAllFromCloud(): Promise<Record<string, any> | null> {
  try {
    lastFirestoreError = null;
    const docRef = doc(db, 'app_data', SHARED_DOC_ID);
    const snapshot = await withTimeout(getDoc(docRef), 5000);
    if (snapshot.exists()) {
      const raw = snapshot.data();
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(raw)) {
        if (key.endsWith('_updatedAt')) continue;
        if (typeof value === 'string') {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      }
      return result;
    }
    return null;
  } catch (error: any) {
    const errMsg = error.message || String(error);
    console.warn('[Firestore] loadAllFromCloud() failed:', errMsg);
    lastFirestoreError = errMsg;
    throw error;
  }
}

/** Check if Firestore cloud sync has active errors */
export function getFirestoreError(): string | null {
  return lastFirestoreError;
}

/** Check if Firestore is configured and reachable */
export function isCloudAvailable(): boolean {
  return lastFirestoreError === null;
}
