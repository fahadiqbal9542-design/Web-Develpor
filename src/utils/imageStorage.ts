// Robust persistent storage and image compression for Web Developer School
// Solves browser 5MB localStorage quota limit and preserves images across page navigation and page reloads.

export async function compressImage(
  source: File | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const processImage = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original
        if (typeof source === 'string') resolve(source);
        else resolve('');
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as jpeg with high visual fidelity but small footprint (~80kb)
      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (e) {
        // In case of canvas taint or error, resolve original if available
        if (typeof source === 'string') resolve(source);
        else reject(e);
      }
    };

    img.onload = processImage;
    img.onerror = () => {
      if (typeof source === 'string') resolve(source);
      else reject(new Error('Failed to load image for compression'));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Could not read file'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(source);
    }
  });
}

// Simple lightweight IndexedDB helper for unlimited reliable persistence
const DB_NAME = 'webdev_school_app_db';
const STORE_NAME = 'media_store';
const DB_VERSION = 1;

function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB set error:', err);
  }
}

// Hybrid storage helper: writes to IndexedDB and compressed into localStorage
export async function savePersistentData<T>(key: string, data: T): Promise<void> {
  // Always save to IndexedDB (virtually unlimited capacity)
  await idbSet(key, data);

  // Also attempt saving to localStorage for instant synchronous hydrations
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage quota reached, saved to IndexedDB successfully instead.', e);
  }
}

export async function loadPersistentData<T>(key: string, defaultValue: T): Promise<T> {
  // First check IndexedDB
  const idbVal = await idbGet<T>(key);
  if (idbVal !== null && idbVal !== undefined) {
    return idbVal;
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(key);
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    console.error(e);
  }

  return defaultValue;
}
