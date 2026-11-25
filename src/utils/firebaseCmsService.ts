import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { DEFAULT_BRAND_ASSETS, DEFAULT_CMS_DATA, DEFAULT_COMPARISON_CASES } from '../data/defaultCmsData';
import { db, FIREBASE_PROJECT_INFO, handleFirestoreError, OperationType } from '../firebase';
import {
  CmsStoreData,
  EnquiryOrder,
  EnquiryStatus,
  MediaItem,
  ProjectDetail,
  StorageStats,
} from '../types';
import { compressImageForFirestore } from './imageOptimizer';
import {
  cacheMediaAsset,
  evictCachedMediaAsset,
  extractMediaId,
  isFirebaseMediaRef,
  makeFirebaseMediaRef,
} from './firebaseMediaCache';
import { hydrateCmsStore } from './localCmsFallback';

const SPARK_FREE_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GiB Spark Firestore Storage

export interface MediaIndexEntry {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  originalSizeBytes: number;
  width: number;
  height: number;
  uploadedAt: string;
}

function toIsoString(val: unknown, fallback?: string): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string' && val.trim()) {
    return val;
  }
  if (val && typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return fallback || new Date().toISOString();
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

export function getBundledArchiveMedia(): MediaItem[] {
  const seen = new Set<string>();
  const items: MediaItem[] = [];
  for (const url of Object.values(DEFAULT_BRAND_ASSETS)) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const filename = url.split('/').pop() || 'asset.jpg';
    const stem = filename.replace(/\.[^.]+$/, '');
    items.push({
      filename,
      url,
      webpUrl: `/assets/muskan/opt/${stem}-1440w.webp`,
      optimized: true,
      source: 'muskan',
      sizeBytes: 340 * 1024,
      updatedAt: DEFAULT_CMS_DATA.updatedAt,
    });
  }
  return items.sort((a, b) => a.filename.localeCompare(b.filename));
}

export async function checkIsUserAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email?.toLowerCase() === FIREBASE_PROJECT_INFO.primaryAdminEmail.toLowerCase()) {
    return true;
  }
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch {
    return false;
  }
}

function buildPublicPayload(store: Partial<CmsStoreData>) {
  const hydrated = hydrateCmsStore(store);
  return {
    siteConfig: stripUndefinedDeep(hydrated.siteConfig),
    projects: stripUndefinedDeep(hydrated.projects).slice(0, 100),
    services: stripUndefinedDeep(hydrated.services).slice(0, 30),
    processSteps: stripUndefinedDeep(hydrated.processSteps).slice(0, 20),
    craftDetails: stripUndefinedDeep(hydrated.craftDetails).slice(0, 30),
    comparisonCases: stripUndefinedDeep(
      hydrated.comparisonCases || DEFAULT_COMPARISON_CASES
    ).slice(0, 20),
    updatedAt: serverTimestamp(),
  };
}

export function subscribePublicCms(
  onData: (data: CmsStoreData, fromServer: boolean) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'cms/public';
  return onSnapshot(
    doc(db, 'cms', 'public'),
    (snap) => {
      if (!snap.exists()) {
        onData(hydrateCmsStore(DEFAULT_CMS_DATA), false);
        return;
      }
      const raw = snap.data() as Record<string, unknown>;
      const hydrated = hydrateCmsStore({
        ...(raw as Partial<CmsStoreData>),
        updatedAt: toIsoString(raw.updatedAt, DEFAULT_CMS_DATA.updatedAt),
      });
      onData(hydrated, true);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (err) {
        if (onError && err instanceof Error) {
          onError(err);
        }
      }
    }
  );
}

export async function fetchPublicCmsFromFirestore(): Promise<{
  store: CmsStoreData;
  existsInFirestore: boolean;
}> {
  const path = 'cms/public';
  try {
    const snap = await getDoc(doc(db, 'cms', 'public'));
    if (!snap.exists()) {
      return {
        store: hydrateCmsStore(DEFAULT_CMS_DATA),
        existsInFirestore: false,
      };
    }
    const raw = snap.data() as Record<string, unknown>;
    return {
      store: hydrateCmsStore({
        ...(raw as Partial<CmsStoreData>),
        updatedAt: toIsoString(raw.updatedAt, DEFAULT_CMS_DATA.updatedAt),
      }),
      existsInFirestore: true,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function savePublicCmsToFirestore(
  store: Partial<CmsStoreData>
): Promise<CmsStoreData> {
  const path = 'cms/public';
  const payload = buildPublicPayload(store);
  try {
    await setDoc(doc(db, 'cms', 'public'), payload);
    const hydrated = hydrateCmsStore(store);
    return {
      ...hydrated,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

function buildStorageStats(entries: MediaIndexEntry[], archiveCount: number): StorageStats {
  const uploadBytes = entries.reduce((sum, item) => sum + (item.sizeBytes || 0), 0);
  const originalBytes = entries.reduce(
    (sum, item) => sum + (item.originalSizeBytes || item.sizeBytes || 0),
    0
  );
  const saved = Math.max(0, originalBytes - uploadBytes);
  return {
    totalSourceImages: entries.length + archiveCount,
    totalWebpVariants: entries.length * 2 + archiveCount * 4,
    uploadsCount: entries.length,
    archiveCount,
    usedBytes: uploadBytes,
    originalBytesSaved: saved,
    freeBytes: Math.max(0, SPARK_FREE_QUOTA_BYTES - uploadBytes),
    totalDiskBytes: SPARK_FREE_QUOTA_BYTES,
    maxUploadMb: 40,
    storageMode: 'firebase-firestore',
  };
}

function indexEntriesToMediaItems(entries: MediaIndexEntry[]): MediaItem[] {
  const uploaded: MediaItem[] = entries.map((entry) => {
    const refUrl = makeFirebaseMediaRef(entry.id);
    return {
      id: entry.id,
      filename: entry.filename,
      url: refUrl,
      webpUrl: refUrl,
      thumbUrl: refUrl,
      optimized: true,
      source: 'uploads',
      sizeBytes: entry.sizeBytes,
      originalSizeBytes: entry.originalSizeBytes,
      width: entry.width,
      height: entry.height,
      updatedAt: entry.uploadedAt,
    };
  });
  return [...uploaded, ...getBundledArchiveMedia()];
}

async function readMediaIndexEntries(): Promise<MediaIndexEntry[]> {
  const path = 'media_index/all';
  try {
    const snap = await getDoc(doc(db, 'media_index', 'all'));
    if (!snap.exists()) return [];
    const data = snap.data() as { items?: MediaIndexEntry[] };
    return Array.isArray(data?.items) ? data.items : [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function loadAdminMediaFromFirestore(): Promise<{
  media: MediaItem[];
  storageStats: StorageStats;
}> {
  const entries = await readMediaIndexEntries();
  const archive = getBundledArchiveMedia();
  return {
    media: indexEntriesToMediaItems(entries),
    storageStats: buildStorageStats(entries, archive.length),
  };
}

export async function uploadCompressedMediaToFirestore(
  file: File,
  uploaderUid: string
): Promise<{
  mediaItem: MediaItem;
  media: MediaItem[];
  storageStats: StorageStats;
}> {
  const compressed = await compressImageForFirestore(file);
  const slugPart = compressed.filename
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .slice(0, 40) || 'photo';
  const mediaId = `img_${slugPart}_${Date.now().toString(36)}`;

  const mediaDocPath = `media/${mediaId}`;
  try {
    await setDoc(doc(db, 'media', mediaId), {
      id: mediaId,
      filename: compressed.filename,
      mimeType: compressed.mimeType,
      dataUrl: compressed.dataUrl,
      thumbUrl: compressed.thumbUrl,
      sizeBytes: compressed.sizeBytes,
      originalSizeBytes: compressed.originalSizeBytes,
      width: compressed.width,
      height: compressed.height,
      uploaderUid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, mediaDocPath);
  }

  await cacheMediaAsset(mediaId, compressed.dataUrl, compressed.thumbUrl);

  const existingEntries = await readMediaIndexEntries();
  const newEntry: MediaIndexEntry = {
    id: mediaId,
    filename: compressed.filename,
    mimeType: compressed.mimeType,
    sizeBytes: compressed.sizeBytes,
    originalSizeBytes: compressed.originalSizeBytes,
    width: compressed.width,
    height: compressed.height,
    uploadedAt: new Date().toISOString(),
  };

  const nextEntries = [newEntry, ...existingEntries].slice(0, 500);
  const indexPath = 'media_index/all';
  try {
    await setDoc(doc(db, 'media_index', 'all'), {
      items: nextEntries,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, indexPath);
  }

  const archive = getBundledArchiveMedia();
  const refUrl = makeFirebaseMediaRef(mediaId);
  const mediaItem: MediaItem = {
    id: mediaId,
    filename: compressed.filename,
    url: refUrl,
    webpUrl: refUrl,
    thumbUrl: refUrl,
    optimized: true,
    source: 'uploads',
    sizeBytes: compressed.sizeBytes,
    originalSizeBytes: compressed.originalSizeBytes,
    width: compressed.width,
    height: compressed.height,
    updatedAt: newEntry.uploadedAt,
  };

  return {
    mediaItem,
    media: indexEntriesToMediaItems(nextEntries),
    storageStats: buildStorageStats(nextEntries, archive.length),
  };
}

function scrubImageRefFromStore(store: CmsStoreData, targetUrl: string): {
  nextStore: CmsStoreData;
  changed: boolean;
} {
  let changed = false;
  const nextSite = { ...store.siteConfig };
  const siteImageKeys = [
    'logoEmblem',
    'heroPrimaryImage',
    'heroSecondaryImage',
    'heroTertiaryImage',
    'studioIntroImage',
    'founderPortrait',
    'founderStudioLaptop',
    'founderSiteVisit',
    'awardPlaque',
    'finalCtaImage',
  ] as const;

  for (const key of siteImageKeys) {
    if (nextSite[key] === targetUrl) {
      nextSite[key] = '';
      changed = true;
    }
  }

  if (nextSite.promoPopup?.image === targetUrl) {
    nextSite.promoPopup = { ...nextSite.promoPopup, image: '' };
    changed = true;
  }

  const nextProjects = store.projects.map((p: ProjectDetail) => {
    const filteredGallery = (p.galleryImages || []).filter((img) => img !== targetUrl);
    const heroMatch = p.heroImage === targetUrl;
    if (heroMatch || filteredGallery.length !== (p.galleryImages || []).length) {
      changed = true;
    }
    return {
      ...p,
      heroImage: heroMatch ? filteredGallery[0] || '' : p.heroImage,
      galleryImages: filteredGallery,
    };
  });

  const nextServices = store.services.map((s) => {
    if (s.image === targetUrl) {
      changed = true;
      return { ...s, image: '' };
    }
    return s;
  });

  const nextSteps = store.processSteps.map((step) => {
    if (step.image === targetUrl) {
      changed = true;
      return { ...step, image: '' };
    }
    return step;
  });

  return {
    changed,
    nextStore: {
      ...store,
      siteConfig: nextSite,
      projects: nextProjects,
      services: nextServices,
      processSteps: nextSteps,
    },
  };
}

export async function deleteMediaFromFirestore(
  item: MediaItem,
  currentStore: CmsStoreData
): Promise<{
  media: MediaItem[];
  store: CmsStoreData;
  storageStats: StorageStats;
}> {
  if (item.source === 'muskan' || !isFirebaseMediaRef(item.url)) {
    throw new Error(
      'Bundled 4K Studio Archive files are part of the static build; unassign from the slot or delete uploaded Firebase photos to free cloud space.'
    );
  }

  const mediaId = item.id || extractMediaId(item.url);
  const mediaPath = `media/${mediaId}`;

  // 1. Delete actual image document from Firestore to free quota space immediately
  try {
    await deleteDoc(doc(db, 'media', mediaId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, mediaPath);
  }

  // 2. Evict from browser IndexedDB cache
  await evictCachedMediaAsset(mediaId);

  // 3. Remove from /media_index/all
  const entries = await readMediaIndexEntries();
  const nextEntries = entries.filter((e) => e.id !== mediaId);
  try {
    await setDoc(doc(db, 'media_index', 'all'), {
      items: nextEntries,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'media_index/all');
  }

  // 4. Scrub stale fbimg:<mediaId> references from cms/public if present
  const { nextStore, changed } = scrubImageRefFromStore(currentStore, item.url);
  const finalStore = changed ? await savePublicCmsToFirestore(nextStore) : currentStore;
  const archive = getBundledArchiveMedia();

  return {
    media: indexEntriesToMediaItems(nextEntries),
    store: {
      ...finalStore,
      enquiries: currentStore.enquiries,
    },
    storageStats: buildStorageStats(nextEntries, archive.length),
  };
}

export async function submitEnquiryToFirestore(payload: {
  name: string;
  phone: string;
  email?: string;
  projectType?: string;
  location?: string;
  approxArea?: string;
  budget?: string;
  timeline?: string;
  brief?: string;
}): Promise<EnquiryOrder> {
  const id = `enq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const orderNumber = `SM-${Math.floor(1000 + Math.random() * 9000)}`;
  const path = `enquiries/${id}`;

  const docPayload = {
    id,
    orderNumber,
    studioTarget: 'spaces_by_muskan',
    name: String(payload.name || '').trim().slice(0, 120),
    phone: String(payload.phone || '').trim().slice(0, 40),
    email: String(payload.email || '').trim().slice(0, 120),
    projectType: String(payload.projectType || 'Residential Interiors').trim().slice(0, 120),
    location: String(payload.location || '').trim().slice(0, 120),
    approxArea: String(payload.approxArea || '').trim().slice(0, 60),
    budget: String(payload.budget || '').trim().slice(0, 80),
    timeline: String(payload.timeline || '').trim().slice(0, 80),
    brief: String(payload.brief || '').trim().slice(0, 2000),
    status: 'new' as const,
    internalNote: '',
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'enquiries', id), docPayload);
    return {
      ...docPayload,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function listEnquiriesFromFirestore(): Promise<EnquiryOrder[]> {
  const path = 'enquiries';
  try {
    const q = query(
      collection(db, 'enquiries'),
      where('studioTarget', '==', 'spaces_by_muskan')
    );
    const snap = await getDocs(q);
    const rows: EnquiryOrder[] = snap.docs.map((d) => {
      const raw = d.data() as Record<string, unknown>;
      return {
        id: String(raw.id || d.id),
        orderNumber: String(raw.orderNumber || ''),
        name: String(raw.name || ''),
        phone: String(raw.phone || ''),
        email: String(raw.email || ''),
        projectType: String(raw.projectType || 'Residential Interiors'),
        location: String(raw.location || ''),
        approxArea: String(raw.approxArea || ''),
        budget: String(raw.budget || ''),
        timeline: String(raw.timeline || ''),
        brief: String(raw.brief || ''),
        status: (raw.status as EnquiryStatus) || 'new',
        internalNote: String(raw.internalNote || ''),
        createdAt: toIsoString(raw.createdAt),
      };
    });

    return rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateEnquiryInFirestore(
  id: string,
  payload: { status?: EnquiryStatus; internalNote?: string }
): Promise<void> {
  const path = `enquiries/${id}`;
  const patch: Record<string, unknown> = {};
  if (payload.status) {
    patch.status = payload.status;
  }
  if (typeof payload.internalNote === 'string') {
    patch.internalNote = payload.internalNote.slice(0, 1500);
  }
  if (Object.keys(patch).length === 0) return;

  try {
    await updateDoc(doc(db, 'enquiries', id), patch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEnquiryFromFirestore(id: string): Promise<void> {
  const path = `enquiries/${id}`;
  try {
    await deleteDoc(doc(db, 'enquiries', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
