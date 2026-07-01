/**
 * Firebase Firestore Cloud Storage Module
 * ใช้เป็นฐานข้อมูลกลางบนคลาวด์เพื่อ sync ข้อมูลข้ามเครื่อง
 */
import { getApps, getApp, initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase (reuse existing app if already initialized from auth.ts)
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Single shared document ID for all app data
const SHARED_DOC_ID = 'shared_fleet_data';

/** Whether Firestore is available (set to false on first failure to avoid repeated errors) */
let firestoreAvailable = true;

/**
 * Save data to Firestore under a specific key in the shared document.
 * Non-blocking — errors are logged but don't break the app.
 */
export async function saveToCloud(key: string, data: any): Promise<void> {
  if (!firestoreAvailable) return;
  try {
    const docRef = doc(db, 'app_data', SHARED_DOC_ID);
    await setDoc(docRef, { [key]: JSON.stringify(data), [`${key}_updatedAt`]: new Date().toISOString() }, { merge: true });
  } catch (error: any) {
    console.warn(`[Firestore] saveToCloud("${key}") failed:`, error.message || error);
    if (error?.code === 'not-found' || error?.code === 'permission-denied' || error?.message?.includes('NOT_FOUND')) {
      firestoreAvailable = false;
      console.warn('[Firestore] Firestore appears to be unavailable. Cloud sync disabled for this session.');
    }
  }
}

/**
 * Load data from Firestore for a specific key.
 * Returns null if Firestore is unavailable or key doesn't exist.
 */
export async function loadFromCloud<T = any>(key: string): Promise<T | null> {
  if (!firestoreAvailable) return null;
  try {
    const docRef = doc(db, 'app_data', SHARED_DOC_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const raw = snapshot.data()[key];
      if (raw) {
        return JSON.parse(raw) as T;
      }
    }
    return null;
  } catch (error: any) {
    console.warn(`[Firestore] loadFromCloud("${key}") failed:`, error.message || error);
    if (error?.code === 'not-found' || error?.code === 'permission-denied' || error?.message?.includes('NOT_FOUND')) {
      firestoreAvailable = false;
      console.warn('[Firestore] Firestore appears to be unavailable. Cloud sync disabled for this session.');
    }
    return null;
  }
}

/**
 * Delete a key from the shared Firestore document.
 */
export async function deleteFromCloud(key: string): Promise<void> {
  if (!firestoreAvailable) return;
  try {
    const docRef = doc(db, 'app_data', SHARED_DOC_ID);
    await setDoc(docRef, { [key]: null, [`${key}_updatedAt`]: null }, { merge: true });
  } catch (error: any) {
    console.warn(`[Firestore] deleteFromCloud("${key}") failed:`, error.message || error);
  }
}

/**
 * Load ALL app data from Firestore in a single read.
 * More efficient than calling loadFromCloud for each key separately.
 */
export async function loadAllFromCloud(): Promise<Record<string, any> | null> {
  if (!firestoreAvailable) return null;
  try {
    const docRef = doc(db, 'app_data', SHARED_DOC_ID);
    const snapshot = await getDoc(docRef);
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
    console.warn('[Firestore] loadAllFromCloud() failed:', error.message || error);
    if (error?.code === 'not-found' || error?.code === 'permission-denied' || error?.message?.includes('NOT_FOUND')) {
      firestoreAvailable = false;
    }
    return null;
  }
}

/** Check if Firestore cloud sync is available */
export function isCloudAvailable(): boolean {
  return firestoreAvailable;
}
