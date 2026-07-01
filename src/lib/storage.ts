import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const BASE64_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp|gif);base64,/i;

export function isBase64Image(value: string | undefined): value is string {
  return typeof value === 'string' && BASE64_IMAGE_PATTERN.test(value);
}

function createStoragePath(folder: string, fileName: string, imageData: string) {
  const extMatch = imageData.match(BASE64_IMAGE_PATTERN);
  const extension = extMatch ? extMatch[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
  return `${folder}/${fileName}.${extension}`;
}

export async function uploadBase64Image(imageData: string, storagePath: string): Promise<string> {
  const imageRef = ref(storage, storagePath);
  await uploadString(imageRef, imageData, 'data_url');
  return await getDownloadURL(imageRef);
}

export async function uploadPhotoIfNeeded(
  photoUrl: string | undefined,
  folder: string,
  fileName: string
): Promise<string | undefined> {
  if (!photoUrl) return undefined;
  if (!isBase64Image(photoUrl)) return photoUrl;

  try {
    const storagePath = createStoragePath(folder, fileName, photoUrl);
    return await uploadBase64Image(photoUrl, storagePath);
  } catch (error) {
    console.error('Firebase Storage upload failed:', error);
    return photoUrl;
  }
}

export async function uploadPhotosIfNeeded(
  photoUrls: string[] | undefined,
  folder: string,
  baseName: string
): Promise<string[]> {
  if (!photoUrls || photoUrls.length === 0) return [];

  const uploads = photoUrls.map(async (photoUrl, index) => {
    if (!isBase64Image(photoUrl)) return photoUrl;
    try {
      const storagePath = createStoragePath(folder, `${baseName}-${index + 1}`, photoUrl);
      return await uploadBase64Image(photoUrl, storagePath);
    } catch (error) {
      console.error('Firebase Storage upload failed for photo index', index, error);
      return photoUrl;
    }
  });

  return await Promise.all(uploads);
}
