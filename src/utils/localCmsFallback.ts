import { DEFAULT_BRAND_ASSETS, DEFAULT_CMS_DATA } from '../data/defaultCmsData';
import {
  CmsStoreData,
  EnquiryOrder,
  MediaItem,
  ProcessStep,
  ProjectDetail,
  StudioSiteConfig,
} from '../types';

const BROWSER_STORE_KEY = 'sbm_browser_cms_store_v1';
const BROWSER_MEDIA_KEY = 'sbm_browser_media_v1';
export const DRAFT_PREVIEW_KEY = 'sbm_cms_draft_preview_v1';
export const PREVIEW_ACTIVE_SESSION_KEY = 'sbm_cms_preview_active';
export const PREVIEW_BROADCAST_CHANNEL = 'sbm_cms_preview';

function notifyPreviewChannel(type: 'draft-updated' | 'draft-cleared'): void {
  try {
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(PREVIEW_BROADCAST_CHANNEL);
      ch.postMessage({ type, at: Date.now() });
      ch.close();
    }
  } catch {
    // Ignore BroadcastChannel errors
  }
}

export function saveDraftPreviewStore(store: Partial<CmsStoreData>): CmsStoreData {
  const hydrated = hydrateCmsStore(store);
  const next: CmsStoreData = {
    ...hydrated,
    enquiries: [],
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(DRAFT_PREVIEW_KEY, JSON.stringify(next));
    notifyPreviewChannel('draft-updated');
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

export function readDraftPreviewStore(): CmsStoreData | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREVIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CmsStoreData>;
    return hydrateCmsStore(parsed);
  } catch {
    return null;
  }
}

export function clearDraftPreviewStore(): void {
  try {
    localStorage.removeItem(DRAFT_PREVIEW_KEY);
    notifyPreviewChannel('draft-cleared');
  } catch {
    // Ignore
  }
}

export interface SafeJsonResult<T = Record<string, unknown>> {
  ok: boolean;
  status: number;
  data: T | null;
  isJson: boolean;
}

export async function fetchJsonSafe<T = Record<string, unknown>>(
  url: string,
  init?: RequestInit
): Promise<SafeJsonResult<T>> {
  try {
    const res = await fetch(url, init);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const isJson = contentType.includes('application/json');
    if (!isJson) {
      return { ok: false, status: res.status, data: null, isJson: false };
    }
    try {
      const data = (await res.json()) as T;
      return { ok: res.ok, status: res.status, data, isJson: true };
    } catch {
      return { ok: false, status: res.status, data: null, isJson: false };
    }
  } catch {
    return { ok: false, status: 0, data: null, isJson: false };
  }
}

export function mergeSiteConfigSafe(incoming?: Partial<StudioSiteConfig>): StudioSiteConfig {
  const base = DEFAULT_CMS_DATA.siteConfig;
  const parsed = incoming || {};
  return {
    ...base,
    ...parsed,
    customAccentColors: {
      ...base.customAccentColors!,
      ...(parsed.customAccentColors || {}),
    },
    navLabels: {
      ...base.navLabels!,
      ...(parsed.navLabels || {}),
    },
    promoPopup: {
      ...base.promoPopup!,
      ...(parsed.promoPopup || {}),
    },
    announcementTicker: {
      ...base.announcementTicker!,
      ...(parsed.announcementTicker || {}),
    },
    homepageSections:
      Array.isArray(parsed.homepageSections) && parsed.homepageSections.length > 0
        ? parsed.homepageSections
        : structuredClone(base.homepageSections!),
  };
}

export function hydrateCmsStore(parsed?: Partial<CmsStoreData>): CmsStoreData {
  const raw = parsed || {};
  const rawSteps: ProcessStep[] = Array.isArray(raw.processSteps)
    ? raw.processSteps
    : structuredClone(DEFAULT_CMS_DATA.processSteps);

  const hydratedSteps: ProcessStep[] = rawSteps.map((step, i) => {
    const fallback = DEFAULT_CMS_DATA.processSteps[i];
    return {
      ...(fallback || {}),
      ...step,
      id: step.id || fallback?.id || `step-${i + 1}`,
      image: step.image !== undefined ? step.image : fallback?.image || '',
      imagePosition: step.imagePosition || fallback?.imagePosition || 'center',
      activities: Array.isArray(step.activities) ? step.activities : fallback?.activities || [],
      status: step.status || 'published',
    };
  });

  return {
    siteConfig: mergeSiteConfigSafe(raw.siteConfig),
    projects: Array.isArray(raw.projects)
      ? raw.projects
      : structuredClone(DEFAULT_CMS_DATA.projects),
    services: Array.isArray(raw.services)
      ? raw.services
      : structuredClone(DEFAULT_CMS_DATA.services),
    processSteps: hydratedSteps,
    craftDetails: Array.isArray(raw.craftDetails)
      ? raw.craftDetails
      : structuredClone(DEFAULT_CMS_DATA.craftDetails),
    comparisonCases: Array.isArray(raw.comparisonCases)
      ? raw.comparisonCases
      : structuredClone(DEFAULT_CMS_DATA.comparisonCases),
    enquiries: Array.isArray(raw.enquiries) ? raw.enquiries : [],
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function readBrowserCmsStore(): CmsStoreData {
  try {
    const raw = localStorage.getItem(BROWSER_STORE_KEY);
    if (!raw) {
      return hydrateCmsStore(DEFAULT_CMS_DATA);
    }
    const parsed = JSON.parse(raw) as Partial<CmsStoreData>;
    return hydrateCmsStore(parsed);
  } catch {
    return hydrateCmsStore(DEFAULT_CMS_DATA);
  }
}

export function saveBrowserCmsStore(store: CmsStoreData): CmsStoreData {
  const next: CmsStoreData = {
    ...store,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(BROWSER_STORE_KEY, JSON.stringify(next));
  } catch {
    // Handle storage quota gracefully without crashing UI
  }
  return next;
}

export function resetBrowserCmsStore(): CmsStoreData {
  const current = readBrowserCmsStore();
  const next: CmsStoreData = {
    ...structuredClone(DEFAULT_CMS_DATA),
    enquiries: current.enquiries || [],
    updatedAt: new Date().toISOString(),
  };
  return saveBrowserCmsStore(next);
}

export function getBundledArchiveMedia(): MediaItem[] {
  const seen = new Set<string>();
  const items: MediaItem[] = [];
  const urls = Object.values(DEFAULT_BRAND_ASSETS);

  for (const url of urls) {
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

function readBrowserUploads(): MediaItem[] {
  try {
    const raw = localStorage.getItem(BROWSER_MEDIA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MediaItem[]) : [];
  } catch {
    return [];
  }
}

function writeBrowserUploads(items: MediaItem[]): void {
  localStorage.setItem(BROWSER_MEDIA_KEY, JSON.stringify(items));
}

export function listBrowserMedia(): MediaItem[] {
  const uploads = readBrowserUploads();
  const archive = getBundledArchiveMedia();
  return [...uploads, ...archive];
}

export function saveBrowserUpload(
  fileName: string,
  dataBase64: string,
  sizeBytes: number
): { mediaItem: MediaItem; media: MediaItem[] } {
  const cleanName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `studio-${Date.now()}.jpg`;

  const mediaItem: MediaItem = {
    filename: `${Date.now().toString(36)}-${cleanName}`,
    url: dataBase64,
    optimized: false,
    source: 'uploads',
    sizeBytes,
    updatedAt: new Date().toISOString(),
  };

  const existing = readBrowserUploads();
  const nextUploads = [mediaItem, ...existing];
  try {
    writeBrowserUploads(nextUploads);
  } catch {
    throw new Error(
      'Browser local storage quota reached. Please upload a smaller compressed photo (under 1.5 MB) or delete older uploads.'
    );
  }

  return {
    mediaItem,
    media: [...nextUploads, ...getBundledArchiveMedia()],
  };
}

export function deleteBrowserMedia(
  filename: string
): { media: MediaItem[]; store: CmsStoreData } {
  const existing = readBrowserUploads();
  const target = existing.find((item) => item.filename === filename);
  if (!target) {
    throw new Error(
      'Bundled 4K Studio Archive files are part of the static build; delete custom uploaded photos or unassign the image from the page instead.'
    );
  }

  const nextUploads = existing.filter((item) => item.filename !== filename);
  writeBrowserUploads(nextUploads);

  const deletedUrl = target.url;
  const store = readBrowserCmsStore();

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
    if (store.siteConfig[key] === deletedUrl) {
      store.siteConfig[key] = '';
    }
  }

  store.projects = store.projects.map((p: ProjectDetail) => {
    const nextGallery = (p.galleryImages || []).filter((img) => img !== deletedUrl);
    return {
      ...p,
      heroImage: p.heroImage === deletedUrl ? nextGallery[0] || '' : p.heroImage,
      galleryImages: nextGallery,
    };
  });

  store.services = store.services.map((s) =>
    s.image === deletedUrl ? { ...s, image: '' } : s
  );

  store.processSteps = store.processSteps.map((step) =>
    step.image === deletedUrl ? { ...step, image: '' } : step
  );

  const savedStore = saveBrowserCmsStore(store);

  return {
    media: [...nextUploads, ...getBundledArchiveMedia()],
    store: savedStore,
  };
}

export function addBrowserEnquiry(payload: {
  name: string;
  phone: string;
  email?: string;
  projectType?: string;
  location?: string;
  approxArea?: string;
  budget?: string;
  timeline?: string;
  brief?: string;
}): EnquiryOrder {
  const store = readBrowserCmsStore();
  const newOrder: EnquiryOrder = {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `enq-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    orderNumber: `SM-${Math.floor(1000 + Math.random() * 9000)}`,
    name: String(payload.name || '').trim().slice(0, 120),
    phone: String(payload.phone || '').trim().slice(0, 40),
    email: String(payload.email || '').trim().slice(0, 120),
    projectType: String(payload.projectType || 'Residential Interiors').trim().slice(0, 120),
    location: String(payload.location || '').trim().slice(0, 120),
    approxArea: String(payload.approxArea || '').trim().slice(0, 60),
    budget: String(payload.budget || '').trim().slice(0, 80),
    timeline: String(payload.timeline || '').trim().slice(0, 80),
    brief: String(payload.brief || '').trim().slice(0, 2000),
    status: 'new',
    internalNote: '',
    createdAt: new Date().toISOString(),
  };

  store.enquiries = [newOrder, ...(store.enquiries || [])];
  saveBrowserCmsStore(store);
  return newOrder;
}

export function buildBrowserProject(
  payload: ProjectDetail,
  existingCount: number
): ProjectDetail {
  const cleanSlug =
    String(payload.id || payload.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `project-${Date.now()}`;

  return {
    ...payload,
    id: cleanSlug,
    sku: String(payload.sku || `SM-PRJ-${String(existingCount + 1).padStart(3, '0')}`).trim(),
    heroImage:
      String(payload.heroImage || DEFAULT_CMS_DATA.siteConfig.heroPrimaryImage).trim(),
    galleryImages:
      Array.isArray(payload.galleryImages) && payload.galleryImages.length > 0
        ? payload.galleryImages
        : [String(payload.heroImage || DEFAULT_CMS_DATA.siteConfig.heroPrimaryImage).trim()],
    status: payload.status === 'draft' ? 'draft' : 'published',
    updatedAt: new Date().toISOString(),
  };
}
