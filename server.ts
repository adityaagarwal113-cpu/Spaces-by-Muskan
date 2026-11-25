import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_CMS_DATA } from './src/data/defaultCmsData';
import {
  CmsStoreData,
  EnquiryOrder,
  EnquiryStatus,
  MediaItem,
  ProjectDetail,
  ServiceItem,
  StorageStats,
  StudioSiteConfig,
} from './src/types';

const execFileAsync = promisify(execFile);

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve('data');
const STORE_PATH = path.join(DATA_DIR, 'cms-store.json');
const SECURITY_PATH = path.join(DATA_DIR, 'cms-security.json');
const MUSKAN_DIR = path.resolve('public/assets/muskan');
const MUSKAN_OPT_DIR = path.join(MUSKAN_DIR, 'opt');
const UPLOADS_DIR = path.resolve('public/uploads');
const UPLOADS_OPT_DIR = path.join(UPLOADS_DIR, 'opt');
const DIST_DIR = path.resolve('dist');
const RESPONSIVE_WIDTHS = [480, 960, 1440, 2160] as const;

interface SecurityState {
  passcodeEnabled: boolean;
  salt: string;
  passcodeHash: string;
  sessionSecret: string;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function ensureDirs(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_OPT_DIR, { recursive: true });
  fs.mkdirSync(MUSKAN_OPT_DIR, { recursive: true });
}

async function generateResponsiveWebpVariants(sourceFile: string, optDir: string, baseName: string): Promise<boolean> {
  try {
    fs.mkdirSync(optDir, { recursive: true });
    await Promise.all(
      RESPONSIVE_WIDTHS.map((width) => {
        const quality = width <= 480 ? '82' : width <= 960 ? '84' : width <= 1440 ? '86' : '88';
        const outPath = path.join(optDir, `${baseName}-${width}w.webp`);
        return execFileAsync('convert', [
          sourceFile,
          '-filter',
          'Lanczos',
          '-resize',
          `${width}x>`,
          '-quality',
          quality,
          '-define',
          'webp:method=4',
          outPath,
        ]);
      })
    );
    return true;
  } catch {
    return false;
  }
}

function removeWebpVariants(optDir: string, baseName: string): void {
  if (!fs.existsSync(optDir)) return;
  for (const width of RESPONSIVE_WIDTHS) {
    const variantPath = path.join(optDir, `${baseName}-${width}w.webp`);
    if (fs.existsSync(variantPath)) {
      try {
        fs.unlinkSync(variantPath);
      } catch {
        // ignore
      }
    }
  }
}

function scrubDeletedImageUrl(deletedUrl: string): void {
  const store = readCmsStore();
  let changed = false;

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
      changed = true;
    }
  }

  store.projects = store.projects.map((p) => {
    const nextGallery = (p.galleryImages || []).filter((img) => img !== deletedUrl);
    const heroRemoved = p.heroImage === deletedUrl;
    if (heroRemoved || nextGallery.length !== (p.galleryImages || []).length) {
      changed = true;
    }
    return {
      ...p,
      heroImage: heroRemoved ? (nextGallery[0] || '') : p.heroImage,
      galleryImages: nextGallery,
    };
  });

  store.services = store.services.map((s) => {
    if (s.image === deletedUrl) {
      changed = true;
      return { ...s, image: '' };
    }
    return s;
  });

  store.processSteps = store.processSteps.map((step) => {
    if (step.image === deletedUrl) {
      changed = true;
      return { ...step, image: '' };
    }
    return step;
  });

  if (Array.isArray(store.comparisonCases)) {
    store.comparisonCases = store.comparisonCases.map((c) => {
      if (c.planImage === deletedUrl || c.finishedImage === deletedUrl) {
        changed = true;
        return {
          ...c,
          planImage: c.planImage === deletedUrl ? '' : c.planImage,
          finishedImage: c.finishedImage === deletedUrl ? '' : c.finishedImage,
        };
      }
      return c;
    });
  }

  if (store.siteConfig.promoPopup?.image === deletedUrl) {
    store.siteConfig.promoPopup.image = '';
    changed = true;
  }

  if (Array.isArray(store.siteConfig.homepageSections)) {
    store.siteConfig.homepageSections = store.siteConfig.homepageSections.map((sec) => {
      if (sec.customImage === deletedUrl) {
        changed = true;
        return { ...sec, customImage: '' };
      }
      return sec;
    });
  }

  if (changed) {
    saveCmsStore(store);
  }
}

function readSecurityState(): SecurityState {
  ensureDirs();
  if (fs.existsSync(SECURITY_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(SECURITY_PATH, 'utf-8')) as Partial<SecurityState>;
      if (parsed.sessionSecret) {
        return {
          passcodeEnabled: Boolean(parsed.passcodeEnabled),
          salt: parsed.salt || '',
          passcodeHash: parsed.passcodeHash || '',
          sessionSecret: parsed.sessionSecret,
        };
      }
    } catch {
      // recreate below
    }
  }
  const initial: SecurityState = {
    passcodeEnabled: false,
    salt: '',
    passcodeHash: '',
    sessionSecret: process.env.CMS_SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  };
  writeJsonAtomic(SECURITY_PATH, initial);
  return initial;
}

function writeJsonAtomic(filePath: string, data: unknown): void {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

function mergeSiteConfig(incoming?: Partial<StudioSiteConfig>): StudioSiteConfig {
  const base = DEFAULT_CMS_DATA.siteConfig;
  const parsed = incoming || {};
  return {
    ...base,
    ...parsed,
    customAccentColors: { ...base.customAccentColors!, ...(parsed.customAccentColors || {}) },
    navLabels: { ...base.navLabels!, ...(parsed.navLabels || {}) },
    promoPopup: { ...base.promoPopup!, ...(parsed.promoPopup || {}) },
    announcementTicker: { ...base.announcementTicker!, ...(parsed.announcementTicker || {}) },
    homepageSections:
      Array.isArray(parsed.homepageSections) && parsed.homepageSections.length > 0
        ? parsed.homepageSections
        : structuredClone(base.homepageSections!),
  };
}

function readCmsStore(): CmsStoreData {
  ensureDirs();
  if (!fs.existsSync(STORE_PATH)) {
    const seeded: CmsStoreData = {
      ...structuredClone(DEFAULT_CMS_DATA),
      updatedAt: new Date().toISOString(),
    };
    writeJsonAtomic(STORE_PATH, seeded);
    return seeded;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<CmsStoreData>;
    const rawSteps = Array.isArray(parsed.processSteps)
      ? parsed.processSteps
      : structuredClone(DEFAULT_CMS_DATA.processSteps);

    const hydratedSteps = rawSteps.map((step, i) => {
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
      siteConfig: mergeSiteConfig(parsed.siteConfig),
      projects: Array.isArray(parsed.projects) ? parsed.projects : structuredClone(DEFAULT_CMS_DATA.projects),
      services: Array.isArray(parsed.services) ? parsed.services : structuredClone(DEFAULT_CMS_DATA.services),
      processSteps: hydratedSteps,
      craftDetails: Array.isArray(parsed.craftDetails) ? parsed.craftDetails : structuredClone(DEFAULT_CMS_DATA.craftDetails),
      comparisonCases: Array.isArray(parsed.comparisonCases) ? parsed.comparisonCases : structuredClone(DEFAULT_CMS_DATA.comparisonCases),
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    const recovered: CmsStoreData = {
      ...structuredClone(DEFAULT_CMS_DATA),
      updatedAt: new Date().toISOString(),
    };
    writeJsonAtomic(STORE_PATH, recovered);
    return recovered;
  }
}

function saveCmsStore(store: CmsStoreData): CmsStoreData {
  const next: CmsStoreData = {
    ...store,
    updatedAt: new Date().toISOString(),
  };
  writeJsonAtomic(STORE_PATH, next);
  return next;
}

function hashPasscode(passcode: string, salt: string): string {
  return crypto.scryptSync(passcode, salt, 64).toString('hex');
}

function createSessionToken(secret: string): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = `${expiresAt}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const sec = readSecurityState();
  if (!sec.passcodeEnabled) {
    next();
    return;
  }
  const token = req.header('x-admin-token');
  if (!verifySessionToken(token, sec.sessionSecret)) {
    res.status(401).json({ error: 'Admin passcode required.' });
    return;
  }
  next();
}

function listMediaItems(): MediaItem[] {
  ensureDirs();
  const items: MediaItem[] = [];

  const scanDir = (dirPath: string, optDir: string, urlPrefix: string, source: 'muskan' | 'uploads') => {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) continue;
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      if (!stat.isFile()) continue;
      const baseName = path.basename(file, ext);
      const hasWebp = fs.existsSync(path.join(optDir, `${baseName}-1440w.webp`));
      items.push({
        filename: file,
        url: `${urlPrefix}/${file}`,
        webpUrl: hasWebp ? `${urlPrefix}/opt/${baseName}-1440w.webp` : undefined,
        optimized: hasWebp,
        source,
        sizeBytes: stat.size,
        updatedAt: stat.mtime.toISOString(),
      });
    }
  };

  scanDir(UPLOADS_DIR, UPLOADS_OPT_DIR, '/uploads', 'uploads');
  scanDir(MUSKAN_DIR, MUSKAN_OPT_DIR, '/assets/muskan', 'muskan');

  return items.sort((a, b) => {
    if (a.source !== b.source) return a.source === 'uploads' ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

function dirSizeBytes(dirPath: string): { bytes: number; fileCount: number } {
  if (!fs.existsSync(dirPath)) return { bytes: 0, fileCount: 0 };
  let bytes = 0;
  let fileCount = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const sub = dirSizeBytes(full);
      bytes += sub.bytes;
      fileCount += sub.fileCount;
    } else if (entry.isFile()) {
      bytes += fs.statSync(full).size;
      fileCount += 1;
    }
  }
  return { bytes, fileCount };
}

function getStorageStats(): StorageStats {
  const mediaList = listMediaItems();
  const uploadsStat = dirSizeBytes(UPLOADS_DIR);
  const muskanStat = dirSizeBytes(MUSKAN_DIR);
  const uploadsOptStat = dirSizeBytes(UPLOADS_OPT_DIR);
  const muskanOptStat = dirSizeBytes(MUSKAN_OPT_DIR);

  let freeBytes = 0;
  let totalDiskBytes = 0;
  try {
    const fsStats = fs.statfsSync(path.resolve('.'));
    freeBytes = Number(fsStats.bavail) * Number(fsStats.bsize);
    totalDiskBytes = Number(fsStats.blocks) * Number(fsStats.bsize);
  } catch {
    // ignore if unavailable
  }

  return {
    totalSourceImages: mediaList.length,
    totalWebpVariants: uploadsOptStat.fileCount + muskanOptStat.fileCount,
    uploadsCount: mediaList.filter((m) => m.source === 'uploads').length,
    archiveCount: mediaList.filter((m) => m.source === 'muskan').length,
    usedBytes: uploadsStat.bytes + muskanStat.bytes,
    freeBytes,
    totalDiskBytes,
    maxUploadMb: 20,
    storageMode: 'local-server-disk',
  };
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

async function startServer() {
  ensureDirs();
  readCmsStore();
  readSecurityState();

  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Serve user uploaded media & optimized assets statically with smart caching
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));
  app.use('/assets/muskan', express.static(MUSKAN_DIR, { maxAge: '7d' }));

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Public Storefront CMS Feed (published projects/services + editable site copy)
  app.get('/api/cms', (_req, res) => {
    const store = readCmsStore();
    res.json({
      siteConfig: store.siteConfig,
      projects: store.projects.filter((p) => p.status !== 'draft'),
      services: store.services.filter((s) => s.status !== 'draft'),
      processSteps: store.processSteps.filter((step) => step.status !== 'draft'),
      craftDetails: store.craftDetails,
      comparisonCases: store.comparisonCases || DEFAULT_CMS_DATA.comparisonCases,
      updatedAt: store.updatedAt,
    });
  });

  // Public Enquiry Submission (feeds WooCommerce-style Orders inbox)
  app.post('/api/enquiries', (req, res) => {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    if (!name || !phone) {
      res.status(400).json({ error: 'Name and phone number are required.' });
      return;
    }

    const store = readCmsStore();
    const orderNumber = `SM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: EnquiryOrder = {
      id: crypto.randomUUID(),
      orderNumber,
      name: name.slice(0, 120),
      phone: phone.slice(0, 40),
      email: String(body.email || '').trim().slice(0, 120),
      projectType: String(body.projectType || 'Residential Interiors').trim().slice(0, 120),
      location: String(body.location || '').trim().slice(0, 120),
      approxArea: String(body.approxArea || '').trim().slice(0, 60),
      budget: String(body.budget || '').trim().slice(0, 80),
      timeline: String(body.timeline || '').trim().slice(0, 80),
      brief: String(body.brief || body.message || '').trim().slice(0, 2000),
      status: 'new',
      internalNote: '',
      createdAt: new Date().toISOString(),
    };

    store.enquiries = [newOrder, ...store.enquiries];
    saveCmsStore(store);

    res.status(201).json({ ok: true, enquiry: newOrder });
  });

  // Admin Authentication Status & Passcode Controls
  app.get('/api/admin/auth/status', (req, res) => {
    const sec = readSecurityState();
    const token = req.header('x-admin-token');
    const authenticated = !sec.passcodeEnabled || verifySessionToken(token, sec.sessionSecret);
    res.json({
      passcodeEnabled: sec.passcodeEnabled,
      authenticated,
    });
  });

  app.post('/api/admin/auth/login', (req, res) => {
    const sec = readSecurityState();
    if (!sec.passcodeEnabled) {
      res.json({ ok: true, token: createSessionToken(sec.sessionSecret) });
      return;
    }
    const passcode = String(req.body?.passcode || '');
    const candidateHash = hashPasscode(passcode, sec.salt);
    let valid = false;
    try {
      valid = crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(sec.passcodeHash));
    } catch {
      valid = false;
    }
    if (!valid) {
      res.status(401).json({ error: 'Incorrect studio passcode.' });
      return;
    }
    res.json({ ok: true, token: createSessionToken(sec.sessionSecret) });
  });

  app.post('/api/admin/auth/passcode', requireAdminAuth, (req, res) => {
    const sec = readSecurityState();
    const enable = Boolean(req.body?.enable);
    const newPasscode = String(req.body?.passcode || '').trim();

    if (!enable) {
      const updated: SecurityState = {
        ...sec,
        passcodeEnabled: false,
        salt: '',
        passcodeHash: '',
      };
      writeJsonAtomic(SECURITY_PATH, updated);
      res.json({ ok: true, passcodeEnabled: false });
      return;
    }

    if (newPasscode.length < 4) {
      res.status(400).json({ error: 'Passcode must be at least 4 characters.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const updated: SecurityState = {
      ...sec,
      passcodeEnabled: true,
      salt,
      passcodeHash: hashPasscode(newPasscode, salt),
    };
    writeJsonAtomic(SECURITY_PATH, updated);
    res.json({
      ok: true,
      passcodeEnabled: true,
      token: createSessionToken(updated.sessionSecret),
    });
  });

  // Protected Admin Endpoints
  app.get('/api/admin/cms', requireAdminAuth, (_req, res) => {
    const store = readCmsStore();
    res.json({
      ...store,
      media: listMediaItems(),
      storageStats: getStorageStats(),
    });
  });

  app.put('/api/admin/site', requireAdminAuth, (req, res) => {
    const store = readCmsStore();
    const incoming = req.body || {};
    store.siteConfig = mergeSiteConfig({
      ...store.siteConfig,
      ...incoming,
    });
    const saved = saveCmsStore(store);
    res.json({ ok: true, siteConfig: saved.siteConfig, updatedAt: saved.updatedAt });
  });

  app.post('/api/admin/projects', requireAdminAuth, (req, res) => {
    const body = req.body as Partial<ProjectDetail>;
    const title = String(body.title || '').trim();
    if (!title) {
      res.status(400).json({ error: 'Project title is required.' });
      return;
    }

    const store = readCmsStore();
    let slug = sanitizeSlug(body.id || title) || `project-${Date.now()}`;
    if (store.projects.some((p) => p.id === slug)) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const newProject: ProjectDetail = {
      id: slug,
      sku: String(body.sku || `SM-PRJ-${String(store.projects.length + 1).padStart(3, '0')}`).trim(),
      title,
      category: String(body.category || 'Residential Interior').trim(),
      categorySlug: body.categorySlug || 'residential',
      secondaryCategories: Array.isArray(body.secondaryCategories) ? body.secondaryCategories : [],
      location: String(body.location || '').trim(),
      heroImage: String(body.heroImage || DEFAULT_CMS_DATA.siteConfig.heroPrimaryImage).trim(),
      galleryImages: Array.isArray(body.galleryImages) && body.galleryImages.length > 0
        ? body.galleryImages
        : [String(body.heroImage || DEFAULT_CMS_DATA.siteConfig.heroPrimaryImage).trim()],
      scope: Array.isArray(body.scope) ? body.scope : [],
      materials: Array.isArray(body.materials) ? body.materials : [],
      dimensions: String(body.dimensions || '').trim(),
      description: String(body.description || '').trim(),
      architecturalNotes: String(body.architecturalNotes || '').trim(),
      hasTechnicalDrawing: Boolean(body.hasTechnicalDrawing),
      status: body.status === 'draft' ? 'draft' : 'published',
      featured: Boolean(body.featured),
      availability: body.availability || 'Open for Commission',
      estimateLabel: String(body.estimateLabel || 'Bespoke Quote').trim(),
      updatedAt: new Date().toISOString(),
    };

    store.projects = [newProject, ...store.projects];
    saveCmsStore(store);
    res.status(201).json({ ok: true, project: newProject, projects: store.projects });
  });

  app.put('/api/admin/projects/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<ProjectDetail>;
    const store = readCmsStore();
    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const existing = store.projects[idx];
    const updated: ProjectDetail = {
      ...existing,
      ...body,
      id: existing.id, // keep URL slug stable
      updatedAt: new Date().toISOString(),
    };
    store.projects[idx] = updated;
    saveCmsStore(store);
    res.json({ ok: true, project: updated, projects: store.projects });
  });

  app.put('/api/admin/projects-reorder', requireAdminAuth, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds) ? (req.body.orderedIds as string[]) : [];
    const store = readCmsStore();
    const map = new Map(store.projects.map((p) => [p.id, p]));
    const reordered: ProjectDetail[] = [];
    for (const id of orderedIds) {
      const found = map.get(id);
      if (found) {
        reordered.push(found);
        map.delete(id);
      }
    }
    for (const leftover of map.values()) {
      reordered.push(leftover);
    }
    store.projects = reordered;
    saveCmsStore(store);
    res.json({ ok: true, projects: store.projects });
  });

  app.delete('/api/admin/projects/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const store = readCmsStore();
    const before = store.projects.length;
    store.projects = store.projects.filter((p) => p.id !== id);
    if (store.projects.length === before) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    saveCmsStore(store);
    res.json({ ok: true, projects: store.projects });
  });

  app.put('/api/admin/services', requireAdminAuth, (req, res) => {
    const services = Array.isArray(req.body?.services) ? (req.body.services as ServiceItem[]) : null;
    if (!services) {
      res.status(400).json({ error: 'services array is required.' });
      return;
    }
    const store = readCmsStore();
    store.services = services.map((s, idx) => ({
      ...s,
      id: s.id || `srv-${idx + 1}`,
      number: s.number || String(idx + 1).padStart(2, '0'),
      status: s.status === 'draft' ? 'draft' : 'published',
    }));
    saveCmsStore(store);
    res.json({ ok: true, services: store.services });
  });

  app.put('/api/admin/process', requireAdminAuth, (req, res) => {
    const store = readCmsStore();
    if (Array.isArray(req.body?.processSteps)) {
      store.processSteps = req.body.processSteps;
    }
    if (Array.isArray(req.body?.craftDetails)) {
      store.craftDetails = req.body.craftDetails;
    }
    if (Array.isArray(req.body?.comparisonCases)) {
      store.comparisonCases = req.body.comparisonCases;
    }
    saveCmsStore(store);
    res.json({
      ok: true,
      processSteps: store.processSteps,
      craftDetails: store.craftDetails,
      comparisonCases: store.comparisonCases,
    });
  });

  app.get('/api/admin/media', requireAdminAuth, (_req, res) => {
    res.json({ media: listMediaItems(), storageStats: getStorageStats() });
  });

  app.post('/api/admin/media/upload', requireAdminAuth, async (req, res) => {
    const rawName = String(req.body?.filename || 'upload').trim();
    const mimeType = String(req.body?.mimeType || '').toLowerCase();
    const dataBase64 = String(req.body?.dataBase64 || '');

    if (!dataBase64) {
      res.status(400).json({ error: 'Image payload is required.' });
      return;
    }

    const base64Clean = dataBase64.includes(',') ? dataBase64.split(',')[1] : dataBase64;
    const buffer = Buffer.from(base64Clean, 'base64');
    if (buffer.length === 0 || buffer.length > 20 * 1024 * 1024) {
      res.status(400).json({ error: 'Image file must be under 20MB.' });
      return;
    }

    const originalExt = path.extname(rawName).toLowerCase();
    const ext = MIME_TO_EXT[mimeType] || (ALLOWED_EXTENSIONS.has(originalExt) ? originalExt : '');
    if (!ext) {
      res.status(400).json({ error: 'Only JPG, PNG, WebP, or AVIF images are supported.' });
      return;
    }

    const slugPart = sanitizeSlug(path.basename(rawName, path.extname(rawName))) || 'studio-asset';
    const fileStem = `${slugPart}-${Date.now().toString(36)}`;
    const finalName = `${fileStem}${ext}`;
    const destPath = path.join(UPLOADS_DIR, finalName);

    fs.writeFileSync(destPath, buffer);
    const optimized = await generateResponsiveWebpVariants(destPath, UPLOADS_OPT_DIR, fileStem);
    const stat = fs.statSync(destPath);

    const mediaItem: MediaItem = {
      filename: finalName,
      url: `/uploads/${finalName}`,
      webpUrl: optimized ? `/uploads/opt/${fileStem}-1440w.webp` : undefined,
      optimized,
      source: 'uploads',
      sizeBytes: stat.size,
      updatedAt: stat.mtime.toISOString(),
    };

    res.status(201).json({
      ok: true,
      mediaItem,
      media: listMediaItems(),
      storageStats: getStorageStats(),
    });
  });

  app.delete('/api/admin/media/:filename', requireAdminAuth, (req, res) => {
    const safeName = path.basename(String(req.params.filename || ''));
    if (!safeName) {
      res.status(400).json({ error: 'Invalid filename.' });
      return;
    }

    const requestedSource = req.query.source === 'muskan' ? 'muskan' : req.query.source === 'uploads' ? 'uploads' : null;
    const uploadPath = path.join(UPLOADS_DIR, safeName);
    const muskanPath = path.join(MUSKAN_DIR, safeName);

    let targetPath = '';
    let optDir = '';
    let deletedUrl = '';

    if (requestedSource === 'uploads' && uploadPath.startsWith(UPLOADS_DIR) && fs.existsSync(uploadPath)) {
      targetPath = uploadPath;
      optDir = UPLOADS_OPT_DIR;
      deletedUrl = `/uploads/${safeName}`;
    } else if (requestedSource === 'muskan' && muskanPath.startsWith(MUSKAN_DIR) && fs.existsSync(muskanPath)) {
      targetPath = muskanPath;
      optDir = MUSKAN_OPT_DIR;
      deletedUrl = `/assets/muskan/${safeName}`;
    } else if (!requestedSource && uploadPath.startsWith(UPLOADS_DIR) && fs.existsSync(uploadPath)) {
      targetPath = uploadPath;
      optDir = UPLOADS_OPT_DIR;
      deletedUrl = `/uploads/${safeName}`;
    } else if (!requestedSource && muskanPath.startsWith(MUSKAN_DIR) && fs.existsSync(muskanPath)) {
      targetPath = muskanPath;
      optDir = MUSKAN_OPT_DIR;
      deletedUrl = `/assets/muskan/${safeName}`;
    }

    if (!targetPath) {
      res.status(404).json({ error: 'Media file not found.' });
      return;
    }

    const baseName = path.basename(safeName, path.extname(safeName));
    fs.unlinkSync(targetPath);
    removeWebpVariants(optDir, baseName);
    scrubDeletedImageUrl(deletedUrl);

    const updatedStore = readCmsStore();
    res.json({
      ok: true,
      deletedUrl,
      media: listMediaItems(),
      storageStats: getStorageStats(),
      store: updatedStore,
    });
  });

  app.patch('/api/admin/enquiries/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const store = readCmsStore();
    const idx = store.enquiries.findIndex((e) => e.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }

    const validStatuses: EnquiryStatus[] = ['new', 'reviewed', 'consultation', 'completed', 'archived'];
    const incomingStatus = req.body?.status as EnquiryStatus | undefined;

    store.enquiries[idx] = {
      ...store.enquiries[idx],
      status: incomingStatus && validStatuses.includes(incomingStatus)
        ? incomingStatus
        : store.enquiries[idx].status,
      internalNote: typeof req.body?.internalNote === 'string'
        ? req.body.internalNote.slice(0, 1500)
        : store.enquiries[idx].internalNote,
    };

    saveCmsStore(store);
    res.json({ ok: true, enquiry: store.enquiries[idx], enquiries: store.enquiries });
  });

  app.delete('/api/admin/enquiries/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const store = readCmsStore();
    store.enquiries = store.enquiries.filter((e) => e.id !== id);
    saveCmsStore(store);
    res.json({ ok: true, enquiries: store.enquiries });
  });

  app.post('/api/admin/reset', requireAdminAuth, (_req, res) => {
    const current = readCmsStore();
    const resetStore: CmsStoreData = {
      ...structuredClone(DEFAULT_CMS_DATA),
      enquiries: current.enquiries, // preserve live client leads unless explicitly deleted
      updatedAt: new Date().toISOString(),
    };
    saveCmsStore(resetStore);
    res.json({ ok: true, store: resetStore });
  });

  // Frontend Hosting (Vite dev middleware in dev, static dist in production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(DIST_DIR));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Spaces by Muskan server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Spaces by Muskan server:', err);
  process.exit(1);
});
