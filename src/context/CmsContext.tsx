import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_CMS_DATA, DEFAULT_COMPARISON_CASES } from '../data/defaultCmsData';
import { resolveAccentColors, resolveTypographyPreset } from '../data/visualBrandingPresets';
import {
  CraftDetail,
  DrawingComparisonCase,
  ProcessStep,
  ProjectDetail,
  ServiceItem,
  StudioSiteConfig,
} from '../types';

interface CmsContextValue {
  siteConfig: StudioSiteConfig;
  projects: ProjectDetail[];
  services: ServiceItem[];
  processSteps: ProcessStep[];
  craftDetails: CraftDetail[];
  comparisonCases: DrawingComparisonCase[];
  isLoaded: boolean;
  lastSyncedAt: string;
  refreshCms: () => Promise<void>;
  updateSiteConfigLocal: (patch: Partial<StudioSiteConfig>) => void;
}

const CmsContext = createContext<CmsContextValue>({
  siteConfig: DEFAULT_CMS_DATA.siteConfig,
  projects: DEFAULT_CMS_DATA.projects,
  services: DEFAULT_CMS_DATA.services,
  processSteps: DEFAULT_CMS_DATA.processSteps,
  craftDetails: DEFAULT_CMS_DATA.craftDetails,
  comparisonCases: DEFAULT_COMPARISON_CASES,
  isLoaded: false,
  lastSyncedAt: DEFAULT_CMS_DATA.updatedAt,
  refreshCms: async () => {},
  updateSiteConfigLocal: () => {},
});

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<StudioSiteConfig>(DEFAULT_CMS_DATA.siteConfig);
  const [projects, setProjects] = useState<ProjectDetail[]>(DEFAULT_CMS_DATA.projects);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_CMS_DATA.services);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(DEFAULT_CMS_DATA.processSteps);
  const [craftDetails, setCraftDetails] = useState<CraftDetail[]>(DEFAULT_CMS_DATA.craftDetails);
  const [comparisonCases, setComparisonCases] = useState<DrawingComparisonCase[]>(
    DEFAULT_COMPARISON_CASES
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(DEFAULT_CMS_DATA.updatedAt);

  const refreshCms = useCallback(async () => {
    try {
      const res = await fetch('/api/cms', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.siteConfig) {
        const base = DEFAULT_CMS_DATA.siteConfig;
        const incoming = data.siteConfig as Partial<StudioSiteConfig>;
        setSiteConfig({
          ...base,
          ...incoming,
          customAccentColors: {
            ...base.customAccentColors!,
            ...(incoming.customAccentColors || {}),
          },
          navLabels: { ...base.navLabels!, ...(incoming.navLabels || {}) },
          promoPopup: { ...base.promoPopup!, ...(incoming.promoPopup || {}) },
          announcementTicker: { ...base.announcementTicker!, ...(incoming.announcementTicker || {}) },
          homepageSections:
            Array.isArray(incoming.homepageSections) && incoming.homepageSections.length > 0
              ? incoming.homepageSections
              : base.homepageSections,
        });
      }
      if (Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
      if (Array.isArray(data.services)) {
        setServices(data.services);
      }
      if (Array.isArray(data.processSteps)) {
        setProcessSteps(data.processSteps);
      }
      if (Array.isArray(data.craftDetails)) {
        setCraftDetails(data.craftDetails);
      }
      if (Array.isArray(data.comparisonCases)) {
        setComparisonCases(data.comparisonCases);
      }
      if (data.updatedAt) {
        setLastSyncedAt(data.updatedAt);
      }
      setIsLoaded(true);
    } catch {
      // Keep default seeded fallback seamlessly if server is starting up
    }
  }, []);

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
    void refreshCms();
  }, [refreshCms]);

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
        lastSyncedAt,
        refreshCms,
        updateSiteConfigLocal,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => useContext(CmsContext);
