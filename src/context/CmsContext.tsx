import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_CMS_DATA, DEFAULT_COMPARISON_CASES } from '../data/defaultCmsData';
import { resolveAccentColors, resolveTypographyPreset } from '../data/visualBrandingPresets';
import {
  fetchPublicCmsFromFirestore,
  subscribePublicCms,
} from '../utils/firebaseCmsService';
import {
  DRAFT_PREVIEW_KEY,
  PREVIEW_ACTIVE_SESSION_KEY,
  PREVIEW_BROADCAST_CHANNEL,
  hydrateCmsStore,
  mergeSiteConfigSafe,
  readDraftPreviewStore,
} from '../utils/localCmsFallback';
import {
  CmsStoreData,
  CraftDetail,
  DrawingComparisonCase,
  ProcessStep,
  ProjectDetail,
  ServiceItem,
  StudioSiteConfig,
} from '../types';

const SWR_CACHE_KEY = 'sbm_cms_firestore_swr_v1';

interface CmsContextValue {
  siteConfig: StudioSiteConfig;
  projects: ProjectDetail[];
  services: ServiceItem[];
  processSteps: ProcessStep[];
  craftDetails: CraftDetail[];
  comparisonCases: DrawingComparisonCase[];
  isLoaded: boolean;
  isPreviewMode: boolean;
  syncSource: 'firestore' | 'preview' | 'default';
  lastSyncedAt: string;
  refreshCms: () => Promise<void>;
  exitPreviewMode: () => void;
  updateSiteConfigLocal: (patch: Partial<StudioSiteConfig>) => void;
}

function detectPreviewQueryOrSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === '1') {
      window.sessionStorage?.setItem(PREVIEW_ACTIVE_SESSION_KEY, '1');
      return true;
    }
    return window.sessionStorage?.getItem(PREVIEW_ACTIVE_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function readInitialSwrStore(previewActive: boolean): CmsStoreData {
  if (previewActive) {
    const draft = readDraftPreviewStore();
    if (draft) return draft;
  }
  try {
    const raw = localStorage.getItem(SWR_CACHE_KEY);
    if (!raw) return hydrateCmsStore(DEFAULT_CMS_DATA);
    const parsed = JSON.parse(raw) as Partial<CmsStoreData>;
    return hydrateCmsStore(parsed);
  } catch {
    return hydrateCmsStore(DEFAULT_CMS_DATA);
  }
}

function writeSwrStore(store: CmsStoreData): void {
  try {
    localStorage.setItem(
      SWR_CACHE_KEY,
      JSON.stringify({
        siteConfig: store.siteConfig,
        projects: store.projects,
        services: store.services,
        processSteps: store.processSteps,
        craftDetails: store.craftDetails,
        comparisonCases: store.comparisonCases,
        updatedAt: store.updatedAt,
      })
    );
  } catch {
    // Ignore storage quota issues cleanly
  }
}

const initialPreviewActive = detectPreviewQueryOrSession();
const initialSeed = readInitialSwrStore(initialPreviewActive);

const CmsContext = createContext<CmsContextValue>({
  siteConfig: initialSeed.siteConfig,
  projects: initialSeed.projects.filter((p) => p.status !== 'draft'),
  services: initialSeed.services.filter((s) => s.status !== 'draft'),
  processSteps: initialSeed.processSteps.filter((step) => step.status !== 'draft'),
  craftDetails: initialSeed.craftDetails,
  comparisonCases: initialSeed.comparisonCases || DEFAULT_COMPARISON_CASES,
  isLoaded: false,
  isPreviewMode: initialPreviewActive,
  syncSource: initialPreviewActive ? 'preview' : 'default',
  lastSyncedAt: initialSeed.updatedAt,
  refreshCms: async () => {},
  exitPreviewMode: () => {},
  updateSiteConfigLocal: () => {},
});

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(() =>
    detectPreviewQueryOrSession()
  );
  const [siteConfig, setSiteConfig] = useState<StudioSiteConfig>(initialSeed.siteConfig);
  const [projects, setProjects] = useState<ProjectDetail[]>(() =>
    initialSeed.projects.filter((p) => p.status !== 'draft')
  );
  const [services, setServices] = useState<ServiceItem[]>(() =>
    initialSeed.services.filter((s) => s.status !== 'draft')
  );
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(() =>
    initialSeed.processSteps.filter((step) => step.status !== 'draft')
  );
  const [craftDetails, setCraftDetails] = useState<CraftDetail[]>(initialSeed.craftDetails);
  const [comparisonCases, setComparisonCases] = useState<DrawingComparisonCase[]>(
    initialSeed.comparisonCases || DEFAULT_COMPARISON_CASES
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncSource, setSyncSource] = useState<'firestore' | 'preview' | 'default'>(
    initialPreviewActive ? 'preview' : 'default'
  );
  const [lastSyncedAt, setLastSyncedAt] = useState(initialSeed.updatedAt);

  const applyStoreSnapshot = useCallback(
    (store: CmsStoreData, source: 'firestore' | 'preview' | 'default') => {
      setSiteConfig(mergeSiteConfigSafe(store.siteConfig));
      setProjects(store.projects.filter((p) => p.status !== 'draft'));
      setServices(store.services.filter((s) => s.status !== 'draft'));
      setProcessSteps(store.processSteps.filter((step) => step.status !== 'draft'));
      setCraftDetails(store.craftDetails);
      setComparisonCases(store.comparisonCases || DEFAULT_COMPARISON_CASES);
      setLastSyncedAt(store.updatedAt);
      setSyncSource(source);
      setIsLoaded(true);
      if (source === 'firestore') {
        writeSwrStore(store);
      }
    },
    []
  );

  const refreshCms = useCallback(async () => {
    if (isPreviewMode) {
      const draft = readDraftPreviewStore();
      if (draft) {
        applyStoreSnapshot(draft, 'preview');
        return;
      }
    }
    try {
      const { store, existsInFirestore } = await fetchPublicCmsFromFirestore();
      applyStoreSnapshot(store, existsInFirestore ? 'firestore' : 'default');
    } catch {
      setIsLoaded(true);
    }
  }, [applyStoreSnapshot, isPreviewMode]);

  const exitPreviewMode = useCallback(() => {
    try {
      window.sessionStorage?.removeItem(PREVIEW_ACTIVE_SESSION_KEY);
      const url = new URL(window.location.href);
      if (url.searchParams.has('preview')) {
        url.searchParams.delete('preview');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    } catch {
      // Ignore URL cleanup errors
    }
    setIsPreviewMode(false);
    void fetchPublicCmsFromFirestore()
      .then(({ store, existsInFirestore }) => {
        applyStoreSnapshot(store, existsInFirestore ? 'firestore' : 'default');
      })
      .catch(() => {
        applyStoreSnapshot(hydrateCmsStore(DEFAULT_CMS_DATA), 'default');
      });
  }, [applyStoreSnapshot]);

  useEffect(() => {
    if (isPreviewMode) {
      const draft = readDraftPreviewStore();
      if (draft) {
        applyStoreSnapshot(draft, 'preview');
      }

      const handleStorage = (e: StorageEvent) => {
        if (e.key === DRAFT_PREVIEW_KEY) {
          const updated = readDraftPreviewStore();
          if (updated) {
            applyStoreSnapshot(updated, 'preview');
          }
        }
      };

      window.addEventListener('storage', handleStorage);

      let channel: BroadcastChannel | null = null;
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(PREVIEW_BROADCAST_CHANNEL);
        channel.onmessage = () => {
          const updated = readDraftPreviewStore();
          if (updated) {
            applyStoreSnapshot(updated, 'preview');
          }
        };
      }

      const unsubscribeFirestore = subscribePublicCms(
        (store, fromServer) => {
          if (!readDraftPreviewStore()) {
            applyStoreSnapshot(store, fromServer ? 'firestore' : 'default');
          }
        },
        () => {
          setIsLoaded(true);
        }
      );

      return () => {
        window.removeEventListener('storage', handleStorage);
        channel?.close();
        unsubscribeFirestore();
      };
    }

    const unsubscribe = subscribePublicCms(
      (store, fromServer) => {
        applyStoreSnapshot(store, fromServer ? 'firestore' : 'default');
      },
      () => {
        setIsLoaded(true);
      }
    );
    return () => unsubscribe();
  }, [applyStoreSnapshot, isPreviewMode]);

  const updateSiteConfigLocal = useCallback((patch: Partial<StudioSiteConfig>) => {
    setSiteConfig((prev) => ({
      ...prev,
      ...patch,
      customAccentColors: {
        ...(prev.customAccentColors || DEFAULT_CMS_DATA.siteConfig.customAccentColors!),
        ...(patch.customAccentColors || {}),
      },
    }));
  }, []);

  useEffect(() => {
    const activeAccent = siteConfig.accentTheme || 'terracotta';
    const colors = resolveAccentColors(activeAccent, siteConfig.customAccentColors);
    const typography = resolveTypographyPreset(siteConfig.typographyPreset);
    const spacing = siteConfig.layoutSpacing || 'balanced';

    const root = document.documentElement;
    root.dataset.accent = activeAccent;
    root.dataset.typography = typography.id;
    root.dataset.spacing = spacing;

    root.style.setProperty('--color-clay-brand', colors.brand);
    root.style.setProperty('--color-clay-dark', colors.dark);
    root.style.setProperty('--color-clay-soft', colors.soft);
    root.style.setProperty('--color-stone-canvas', colors.canvas);

    root.style.setProperty('--font-serif', typography.serifFont);
    root.style.setProperty('--font-sans', typography.sansFont);
  }, [
    siteConfig.accentTheme,
    siteConfig.customAccentColors,
    siteConfig.typographyPreset,
    siteConfig.layoutSpacing,
  ]);

  return (
    <CmsContext.Provider
      value={{
        siteConfig,
        projects,
        services,
        processSteps,
        craftDetails,
        comparisonCases,
        isLoaded,
        isPreviewMode,
        syncSource,
        lastSyncedAt,
        refreshCms,
        exitPreviewMode,
        updateSiteConfigLocal,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => useContext(CmsContext);
