import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface CachedMediaRecord {
  id: string;
  dataUrl: string;
  thumbUrl: string;
  cachedAt: number;
}

const DB_NAME = 'sbm_firebase_media_cache';
const STORE_NAME = 'media';
const DB_VERSION = 1;

const memoryCache = new Map<string, CachedMediaRecord>();
const inflightRequests = new Map<string, Promise<CachedMediaRecord | null>>();

export const FIREBASE_MEDIA_PREFIX = 'fbimg:';

export function isFirebaseMediaRef(src?: string): boolean {
  return Boolean(src && src.startsWith(FIREBASE_MEDIA_PREFIX));
}

export function makeFirebaseMediaRef(mediaId: string): string {
  return `${FIREBASE_MEDIA_PREFIX}${mediaId}`;
}

export function extractMediaId(src: string): string {
  return src.startsWith(FIREBASE_MEDIA_PREFIX)
    ? src.slice(FIREBASE_MEDIA_PREFIX.length).trim()
    : src.trim();
}

function openMediaDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readFromIdb(id: string): Promise<CachedMediaRecord | null> {
  const database = await openMediaDb();
  if (!database) return null;
  return new Promise((resolve) => {
    try {
      const tx = database.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as CachedMediaRecord) || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeToIdb(record: CachedMediaRecord): Promise<void> {
  const database = await openMediaDb();
  if (!database) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = database.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function deleteFromIdb(id: string): Promise<void> {
  const database = await openMediaDb();
  if (!database) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = database.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function cacheMediaAsset(
  id: string,
  dataUrl: string,
  thumbUrl?: string
): Promise<void> {
  const record: CachedMediaRecord = {
    id,
    dataUrl,
    thumbUrl: thumbUrl || dataUrl,
    cachedAt: Date.now(),
  };
  memoryCache.set(id, record);
  await writeToIdb(record);
}

export async function evictCachedMediaAsset(id: string): Promise<void> {
  memoryCache.delete(id);
  await deleteFromIdb(id);
}

export async function loadMediaRecord(mediaId: string): Promise<CachedMediaRecord | null> {
  const cleanId = extractMediaId(mediaId);
  if (!cleanId) return null;

  const fromMem = memoryCache.get(cleanId);
  if (fromMem) return fromMem;

  const existingInflight = inflightRequests.get(cleanId);
  if (existingInflight) return existingInflight;

  const job = (async () => {
    const fromIdb = await readFromIdb(cleanId);
    if (fromIdb) {
      memoryCache.set(cleanId, fromIdb);
      return fromIdb;
    }

    const path = `media/${cleanId}`;
    try {
      const snap = await getDoc(doc(db, 'media', cleanId));
      if (!snap.exists()) return null;
      const data = snap.data() as { dataUrl?: string; thumbUrl?: string };
      if (!data?.dataUrl) return null;

      const record: CachedMediaRecord = {
        id: cleanId,
        dataUrl: data.dataUrl,
        thumbUrl: data.thumbUrl || data.dataUrl,
        cachedAt: Date.now(),
      };
      memoryCache.set(cleanId, record);
      void writeToIdb(record);
      return record;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  })();

  inflightRequests.set(cleanId, job);
  try {
    return await job;
  } finally {
    inflightRequests.delete(cleanId);
  }
}

export async function resolveFirebaseMediaUrl(
  src?: string,
  preferThumb = false
): Promise<string> {
  if (!src) return '';
  if (!isFirebaseMediaRef(src)) return src;
  const record = await loadMediaRecord(src);
  if (!record) return '';
  return preferThumb ? record.thumbUrl || record.dataUrl : record.dataUrl;
}
