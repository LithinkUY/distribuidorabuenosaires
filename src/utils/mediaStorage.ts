// Client-side IndexedDB media storage for large video files and images
// Avoids localStorage 5MB quota errors

const DB_NAME = 'dba_media_db';
const STORE_NAME = 'media_files';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Memory cache for object URLs to avoid recreating them repeatedly
const objectUrlCache = new Map<string, string>();

/**
 * Save a Blob or File to IndexedDB
 */
export async function saveMediaBlob(key: string, blob: Blob): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);

      req.onsuccess = () => {
        // Revoke any previous cached URL
        if (objectUrlCache.has(key)) {
          try {
            URL.revokeObjectURL(objectUrlCache.get(key)!);
          } catch (e) {}
          objectUrlCache.delete(key);
        }
        resolve(`idb:${key}`);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save media to IndexedDB:', err);
    throw err;
  }
}

/**
 * Get a Blob from IndexedDB
 */
export async function getMediaBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get media from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete a media file from IndexedDB
 */
export async function deleteMediaBlob(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => {
        if (objectUrlCache.has(key)) {
          try {
            URL.revokeObjectURL(objectUrlCache.get(key)!);
          } catch (e) {}
          objectUrlCache.delete(key);
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete media from IndexedDB:', err);
  }
}

/**
 * Resolves any media URL (converts 'idb:<key>' into a usable blob URL, or returns original URL)
 */
export async function resolveMediaUrl(url: string | undefined): Promise<string> {
  if (!url) return '';
  if (!url.startsWith('idb:')) {
    return url;
  }

  const key = url.replace('idb:', '');
  if (objectUrlCache.has(key)) {
    return objectUrlCache.get(key)!;
  }

  const blob = await getMediaBlob(key);
  if (!blob) {
    return '';
  }

  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(key, objectUrl);
  return objectUrl;
}
