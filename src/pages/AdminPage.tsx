import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Check,
  Cloud,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileEdit,
  FolderKanban,
  GripVertical,
  HardDrive,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  Unlock,
  Upload,
  X,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { ResolvedImg } from '../components/OptimizedImage';
import { AdminEnquiriesPanel } from '../components/admin/AdminEnquiriesPanel';
import { AdminPromotionsEditor } from '../components/admin/AdminPromotionsEditor';
import { AdminVisualBrandingPanel } from '../components/admin/AdminVisualBrandingPanel';
import {
  AdminProcessEditor,
  AdminServicesEditor,
  AdminSiteEditor,
} from '../components/admin/AdminSiteEditor';
import { ProjectEditor } from '../components/admin/ProjectEditor';
import { DEFAULT_CMS_DATA } from '../data/defaultCmsData';
import { auth, FIREBASE_PROJECT_INFO, googleProvider } from '../firebase';
import {
  checkIsUserAdmin,
  deleteEnquiryFromFirestore,
  deleteMediaFromFirestore,
  fetchPublicCmsFromFirestore,
  listEnquiriesFromFirestore,
  loadAdminMediaFromFirestore,
  savePublicCmsToFirestore,
  updateEnquiryInFirestore,
  uploadCompressedMediaToFirestore,
} from '../utils/firebaseCmsService';
import { compressImageForFirestore } from '../utils/imageOptimizer';
import {
  buildBrowserProject,
  clearDraftPreviewStore,
  deleteBrowserMedia,
  getBundledArchiveMedia,
  hydrateCmsStore,
  listBrowserMedia,
  mergeSiteConfigSafe,
  readDraftPreviewStore,
  saveBrowserUpload,
  saveDraftPreviewStore,
} from '../utils/localCmsFallback';
import {
  AnnouncementTickerConfig,
  CmsStoreData,
  DrawingComparisonCase,
  EnquiryOrder,
  EnquiryStatus,
  MediaItem,
  ProcessStep,
  ProjectDetail,
  PromoPopupConfig,
  ServiceItem,
  StorageStats,
  StudioSiteConfig,
} from '../types';

type AdminTab =
  | 'dashboard'
  | 'projects'
  | 'enquiries'
  | 'media'
  | 'services'
  | 'site'
  | 'process'
  | 'promotions'
  | 'settings';

const DRAFT_DIRTY_KEY = 'sbm_cms_draft_dirty_v1';

const DEMO_SHOWCASE_ENQUIRIES: EnquiryOrder[] = [
  {
    id: 'demo-enq-1',
    orderNumber: 'SM-DEMO1',
    name: 'Sample Client Brief (Preview)',
    phone: '+91 98XXX XXXXX',
    email: 'sample-client@example.com',
    projectType: '3BHK Residence + Vastu Alignment',
    location: 'Sample Showcase Entry',
    approxArea: '1,850 sq.ft.',
    budget: 'Turnkey Bespoke',
    timeline: 'Within 2 months',
    brief:
      'Sample consultation brief shown in Open Showcase Mode. Sign in with Google to view and manage real client enquiries submitted from your live website.',
    status: 'new',
    internalNote: 'Sample showcase record — real customer enquiries remain protected.',
    createdAt: new Date().toISOString(),
  },
];

export const AdminPage: React.FC = () => {
  const { refreshCms } = useCms();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Firebase Auth & Access Lock state
  const [authChecked, setAuthChecked] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Store & Draft Preview state
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<CmsStoreData | null>(null);
  const [draftStore, setDraftStore] = useState<CmsStoreData | null>(null);
  const [hasUnpublishedDraft, setHasUnpublishedDraft] = useState(false);
  const [publishingDraft, setPublishingDraft] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);

  // Feedback Notice
  const [notice, setNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Projects list controls
  const [editingProject, setEditingProject] = useState<ProjectDetail | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('all');
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(null);
  const [dragProjectId, setDragProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);

  // Media Library controls
  const [mediaFilter, setMediaFilter] = useState<'all' | 'uploads' | 'muskan'>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [confirmDeleteMediaUrl, setConfirmDeleteMediaUrl] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Settings controls
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  const showNotice = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setNotice({ type, text });
  }, []);

  const loadAdminData = useCallback(
    async (isAdminAuthenticated: boolean) => {
      setLoading(true);
      try {
        const cmsRes = await fetchPublicCmsFromFirestore();
        const isLocked = Boolean(cmsRes.store.siteConfig.requireAdminLogin);
        setLoginRequired(isLocked);

        const isDirty = localStorage.getItem(DRAFT_DIRTY_KEY) === '1';
        const savedDraft = isDirty ? readDraftPreviewStore() : null;

        if (!isAdminAuthenticated) {
          if (isLocked) {
            setStore(null);
            setDraftStore(null);
            setLoading(false);
            return;
          }

          const baseStore = savedDraft || cmsRes.store;
          const showcaseStore: CmsStoreData = {
            ...baseStore,
            enquiries: DEMO_SHOWCASE_ENQUIRIES,
          };
          const localMedia = listBrowserMedia();
          const archiveCount = getBundledArchiveMedia().length;
          const uploadsCount = localMedia.filter((m) => m.source === 'uploads').length;
          const usedBytes = localMedia
            .filter((m) => m.source === 'uploads')
            .reduce((sum, item) => sum + (item.sizeBytes || 0), 0);

          setStore(showcaseStore);
          setDraftStore(showcaseStore);
          setHasUnpublishedDraft(Boolean(savedDraft));
          saveDraftPreviewStore(showcaseStore);
          setMedia(localMedia);
          setStorageStats({
            totalSourceImages: localMedia.length,
            totalWebpVariants: uploadsCount * 2 + archiveCount * 4,
            uploadsCount,
            archiveCount,
            usedBytes,
            originalBytesSaved: 0,
            freeBytes: Math.max(0, 1024 * 1024 * 1024 - usedBytes),
            totalDiskBytes: 1024 * 1024 * 1024,
            maxUploadMb: 40,
            storageMode: 'firebase-firestore',
          });
          return;
        }

        const [mediaRes, enquiriesRes] = await Promise.all([
          loadAdminMediaFromFirestore(),
          listEnquiriesFromFirestore(),
        ]);

        let activeStore = cmsRes.store;
        if (!cmsRes.existsInFirestore) {
          activeStore = await savePublicCmsToFirestore(cmsRes.store);
        }

        const liveWithEnquiries: CmsStoreData = {
          ...activeStore,
          enquiries: enquiriesRes,
        };
        setStore(liveWithEnquiries);

        if (savedDraft) {
          const mergedDraft: CmsStoreData = {
            ...savedDraft,
            enquiries: enquiriesRes,
          };
          setDraftStore(mergedDraft);
          setHasUnpublishedDraft(true);
          saveDraftPreviewStore(mergedDraft);
        } else {
          setDraftStore(liveWithEnquiries);
          setHasUnpublishedDraft(false);
          saveDraftPreviewStore(liveWithEnquiries);
        }

        setMedia(mediaRes.media);
        setStorageStats(mediaRes.storageStats);
      } catch (err) {
        showNotice(
          'error',
          err instanceof Error
            ? err.message
            : 'Could not sync studio data from Firebase Firestore.'
        );
      } finally {
        setLoading(false);
      }
    },
    [showNotice]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (!user) {
        setAuthenticated(false);
        setUnauthorizedEmail(null);
        setAuthChecked(true);
        await loadAdminData(false);
        return;
      }

      const isAdmin = await checkIsUserAdmin(user);
      if (!isAdmin) {
        setAuthenticated(false);
        setUnauthorizedEmail(user.email || 'Unknown account');
        setAuthChecked(true);
        await loadAdminData(false);
        return;
      }

      setUnauthorizedEmail(null);
      setAuthenticated(true);
      setAuthChecked(true);
      await loadAdminData(true);
    });

    return () => unsubscribe();
  }, [loadAdminData]);

  const handleGoogleSignIn = async () => {
    setLoginError('');
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      if (!msg.includes('popup-closed-by-user')) {
        setLoginError(msg);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAuthenticated(false);
      await loadAdminData(false);
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : 'Failed to sign out.');
    }
  };

  const updateDraftSnapshot = useCallback(
    (updater: (prev: CmsStoreData) => CmsStoreData) => {
      setDraftStore((prev) => {
        const base = prev || store;
        if (!base) return prev;
        const next = updater(base);
        saveDraftPreviewStore(next);
        try {
          localStorage.setItem(DRAFT_DIRTY_KEY, '1');
        } catch {
          // Ignore
        }
        setHasUnpublishedDraft(true);
        return next;
      });
    },
    [store]
  );

  const syncDraftPreviewNow = useCallback(() => {
    const target = draftStore || store;
    if (target) {
      saveDraftPreviewStore(target);
    }
  }, [draftStore, store]);

  const handleSiteDraftChange = useCallback(
    (draftSite: StudioSiteConfig) => {
      updateDraftSnapshot((prev) => ({
        ...prev,
        siteConfig: mergeSiteConfigSafe({ ...prev.siteConfig, ...draftSite }),
      }));
    },
    [updateDraftSnapshot]
  );

  const handleServicesDraftChange = useCallback(
    (draftServices: ServiceItem[]) => {
      updateDraftSnapshot((prev) => ({
        ...prev,
        services: draftServices,
      }));
    },
    [updateDraftSnapshot]
  );

  const handleProcessDraftChange = useCallback(
    (draftSteps: ProcessStep[], draftComparisons: DrawingComparisonCase[]) => {
      updateDraftSnapshot((prev) => ({
        ...prev,
        processSteps: draftSteps,
        comparisonCases: draftComparisons,
      }));
    },
    [updateDraftSnapshot]
  );

  const handlePromotionsDraftChange = useCallback(
    (patch: {
      promoPopup: PromoPopupConfig;
      announcementTicker: AnnouncementTickerConfig;
    }) => {
      updateDraftSnapshot((prev) => ({
        ...prev,
        siteConfig: mergeSiteConfigSafe({
          ...prev.siteConfig,
          promoPopup: patch.promoPopup,
          announcementTicker: patch.announcementTicker,
        }),
      }));
    },
    [updateDraftSnapshot]
  );

  const handleBrandingDraftChange = useCallback(
    (patch: Partial<StudioSiteConfig>) => {
      updateDraftSnapshot((prev) => ({
        ...prev,
        siteConfig: mergeSiteConfigSafe({
          ...prev.siteConfig,
          ...patch,
        }),
      }));
    },
    [updateDraftSnapshot]
  );

  const handleProjectDraftChange = useCallback(
    (draftProject: ProjectDetail, isNew: boolean) => {
      updateDraftSnapshot((prev) => {
        if (isNew) {
          const previewProj = buildBrowserProject(draftProject, prev.projects.length);
          if (!previewProj.title.trim()) {
            previewProj.title = 'Untitled New Project (Preview)';
          }
          const filtered = prev.projects.filter((p) => p.id !== '__preview_new_project__');
          return {
            ...prev,
            projects: [{ ...previewProj, id: '__preview_new_project__' }, ...filtered],
          };
        }
        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === draftProject.id ? { ...p, ...draftProject } : p
          ),
        };
      });
    },
    [updateDraftSnapshot]
  );

  const persistStoreChanges = useCallback(
    async (nextStore: CmsStoreData, successText: string) => {
      const cleanedProjects = nextStore.projects.filter(
        (p) => p.id !== '__preview_new_project__'
      );
      const sanitizedStore: CmsStoreData = {
        ...nextStore,
        projects: cleanedProjects,
      };

      if (!authenticated) {
        setStore(sanitizedStore);
        setDraftStore(sanitizedStore);
        saveDraftPreviewStore(sanitizedStore);
        try {
          localStorage.setItem(DRAFT_DIRTY_KEY, '1');
        } catch {
          // Ignore
        }
        setHasUnpublishedDraft(true);
        showNotice(
          'info',
          'Applied to Draft Preview! Click "Preview" in the top bar to open it in a new tab, or sign in with Google to publish live.'
        );
        return sanitizedStore;
      }

      const saved = await savePublicCmsToFirestore(sanitizedStore);
      const nextLive: CmsStoreData = {
        ...saved,
        enquiries: sanitizedStore.enquiries,
      };
      setStore(nextLive);
      setDraftStore(nextLive);
      saveDraftPreviewStore(nextLive);
      try {
        localStorage.removeItem(DRAFT_DIRTY_KEY);
      } catch {
        // Ignore
      }
      setHasUnpublishedDraft(false);
      await refreshCms();
      showNotice('success', successText);
      return saved;
    },
    [authenticated, refreshCms, showNotice]
  );

  const handlePublishDraftToLive = async () => {
    if (!draftStore) return;
    if (!authenticated) {
      await handleGoogleSignIn();
      return;
    }
    setPublishingDraft(true);
    try {
      await persistStoreChanges(
        draftStore,
        'All draft changes published live to Firebase across every device!'
      );
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to publish draft changes.'
      );
    } finally {
      setPublishingDraft(false);
    }
  };

  const handleDiscardDraft = () => {
    if (!store) return;
    clearDraftPreviewStore();
    try {
      localStorage.removeItem(DRAFT_DIRTY_KEY);
    } catch {
      // Ignore
    }
    if (authenticated) {
      setDraftStore(store);
      saveDraftPreviewStore(store);
      setHasUnpublishedDraft(false);
      showNotice('info', 'Discarded unpublished draft edits and synced with live site.');
    } else {
      void loadAdminData(false).then(() => {
        showNotice('info', 'Reset Open Showcase draft edits back to live website state.');
      });
    }
  };

  const handleToggleLoginLock = async (enable: boolean) => {
    if (!store || !authenticated) {
      showNotice('info', 'Please sign in with Google first to lock or unlock admin access.');
      return;
    }
    try {
      const base = draftStore || store;
      const nextStore: CmsStoreData = {
        ...base,
        siteConfig: mergeSiteConfigSafe({
          ...base.siteConfig,
          requireAdminLogin: enable,
        }),
      };
      await persistStoreChanges(
        nextStore,
        enable
          ? 'Google Login Lock enabled — /wp-admin now requires authorized Google Sign-In.'
          : 'Admin opened for client showcase — /wp-admin can now be viewed without signing in.'
      );
      setLoginRequired(enable);
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to update login lock setting.'
      );
    }
  };

  const handleUploadFile = async (file: File): Promise<MediaItem | null> => {
    if (!authenticated || !authUser) {
      const compressed = await compressImageForFirestore(file);
      const res = saveBrowserUpload(
        compressed.filename,
        compressed.dataUrl,
        compressed.sizeBytes
      );
      setMedia(res.media);
      showNotice(
        'info',
        `Staged "${res.mediaItem.filename}" in Browser Preview Library (Sign in with Google to upload permanently to Firebase).`
      );
      return res.mediaItem;
    }

    const result = await uploadCompressedMediaToFirestore(file, authUser.uid);
    setMedia(result.media);
    setStorageStats(result.storageStats);
    const savedKb =
      result.mediaItem.originalSizeBytes && result.mediaItem.originalSizeBytes > result.mediaItem.sizeBytes
        ? ` (compressed from ${(result.mediaItem.originalSizeBytes / 1024).toFixed(0)} KB to ${(result.mediaItem.sizeBytes / 1024).toFixed(0)} KB)`
        : '';
    showNotice(
      'success',
      `Uploaded "${result.mediaItem.filename}" to Firebase Cloud${savedKb}.`
    );
    return result.mediaItem;
  };

  const handleSaveSite = async (nextConfig: StudioSiteConfig) => {
    const active = draftStore || store;
    if (!active) return;
    try {
      const nextStore: CmsStoreData = {
        ...active,
        siteConfig: mergeSiteConfigSafe({ ...active.siteConfig, ...nextConfig }),
      };
      await persistStoreChanges(
        nextStore,
        'Site copy, layout, and branding synced live across all devices via Firebase.'
      );
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to save site settings to Firebase.'
      );
    }
  };

  const handleSaveProject = async (payload: ProjectDetail, isNew: boolean) => {
    const active = draftStore || store;
    if (!active) return;
    try {
      let savedProject: ProjectDetail;
      let nextProjects: ProjectDetail[];
      const cleanBaseProjects = active.projects.filter(
        (p) => p.id !== '__preview_new_project__'
      );

      if (isNew) {
        savedProject = buildBrowserProject(payload, cleanBaseProjects.length);
        if (cleanBaseProjects.some((p) => p.id === savedProject.id)) {
          savedProject.id = `${savedProject.id}-${Math.floor(100 + Math.random() * 900)}`;
        }
        nextProjects = [savedProject, ...cleanBaseProjects];
      } else {
        const existing = cleanBaseProjects.find((p) => p.id === payload.id);
        savedProject = {
          ...(existing || payload),
          ...payload,
          id: existing ? existing.id : payload.id,
          updatedAt: new Date().toISOString(),
        };
        nextProjects = cleanBaseProjects.map((p) =>
          p.id === savedProject.id ? savedProject : p
        );
      }

      await persistStoreChanges(
        { ...active, projects: nextProjects },
        isNew
          ? `Project "${savedProject.title}" published live to Firebase portfolio.`
          : `Project "${savedProject.title}" updated across all devices.`
      );
      setEditingProject(null);
      setIsCreatingProject(false);
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to save project to Firebase.'
      );
    }
  };

  const handleToggleProjectFlag = async (
    project: ProjectDetail,
    patch: Partial<ProjectDetail>
  ) => {
    const active = draftStore || store;
    if (!active) return;
    try {
      const nextProjects = active.projects.map((p) =>
        p.id === project.id
          ? { ...p, ...patch, updatedAt: new Date().toISOString() }
          : p
      );
      await persistStoreChanges(
        { ...active, projects: nextProjects },
        `Updated "${project.title}".`
      );
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to update project status.'
      );
    }
  };

  const handleDuplicateProject = async (project: ProjectDetail) => {
    const copy: ProjectDetail = {
      ...project,
      id: '',
      sku: `${project.sku || 'SM-PRJ'}-COPY`,
      title: `${project.title} (Copy)`,
      status: 'draft',
    };
    await handleSaveProject(copy, true);
  };

  const handleMoveProject = async (index: number, direction: -1 | 1) => {
    const active = draftStore || store;
    if (!active) return;
    const target = index + direction;
    if (target < 0 || target >= active.projects.length) return;
    const nextList = [...active.projects];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(target, 0, moved);

    try {
      await persistStoreChanges(
        { ...active, projects: nextList },
        'Portfolio display order updated in Firebase.'
      );
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to reorder portfolio.'
      );
    }
  };

  const handleDropProject = async (fromId: string, toId: string) => {
    const active = draftStore || store;
    if (!active || fromId === toId) return;
    const fromIdx = active.projects.findIndex((p) => p.id === fromId);
    const toIdx = active.projects.findIndex((p) => p.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    const nextList = [...active.projects];
    const [moved] = nextList.splice(fromIdx, 1);
    nextList.splice(toIdx, 0, moved);

    try {
      await persistStoreChanges(
        { ...active, projects: nextList },
        'Portfolio display order updated via drag & drop.'
      );
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to reorder portfolio.'
      );
    }
  };

  const handleDeleteProject = async (id: string) => {
    const active = draftStore || store;
    if (!active) return;
    try {
      const nextProjects = active.projects.filter((p) => p.id !== id);
      await persistStoreChanges(
        { ...active, projects: nextProjects },
        'Project removed from portfolio.'
      );
      setConfirmDeleteProjectId(null);
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Could not delete project.'
      );
    }
  };

  const handleSaveServices = async (services: ServiceItem[]) => {
    const active = draftStore || store;
    if (!active) return;
    try {
      const normalized: ServiceItem[] = services.map((s, idx) => ({
        ...s,
        id: s.id || `srv-${idx + 1}`,
        number: s.number || String(idx + 1).padStart(2, '0'),
        status: s.status === 'draft' ? 'draft' : 'published',
      }));
      await persistStoreChanges(
        { ...active, services: normalized },
        'Studio services updated in Firebase.'
      );
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to save services.'
      );
    }
  };

  const handleSaveProcess = async (
    processSteps: ProcessStep[],
    comparisonCases?: DrawingComparisonCase[]
  ) => {
    const active = draftStore || store;
    if (!active) return;
    try {
      await persistStoreChanges(
        {
          ...active,
          processSteps,
          comparisonCases: comparisonCases || active.comparisonCases,
        },
        'Design process stages & 2D/3D comparison studies saved to Firebase.'
      );
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to update process stages.'
      );
    }
  };

  const handleUpdateEnquiry = async (
    id: string,
    payload: { status?: EnquiryStatus; internalNote?: string }
  ) => {
    if (!store) return;
    if (!authenticated) {
      const nextEnquiries = store.enquiries.map((item) =>
        item.id === id
          ? {
              ...item,
              status: payload.status ?? item.status,
              internalNote:
                typeof payload.internalNote === 'string'
                  ? payload.internalNote
                  : item.internalNote,
            }
          : item
      );
      setStore({ ...store, enquiries: nextEnquiries });
      showNotice(
        'info',
        'Updated sample showcase enquiry (Sign in with Google to manage live client enquiries).'
      );
      return;
    }

    try {
      await updateEnquiryInFirestore(id, payload);
      const nextEnquiries = store.enquiries.map((item) =>
        item.id === id
          ? {
              ...item,
              status: payload.status ?? item.status,
              internalNote:
                typeof payload.internalNote === 'string'
                  ? payload.internalNote
                  : item.internalNote,
            }
          : item
      );
      setStore({ ...store, enquiries: nextEnquiries });
      showNotice('success', 'Enquiry status synced to Firebase.');
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to update enquiry.'
      );
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (!store) return;
    if (!authenticated) {
      showNotice(
        'info',
        'Sample showcase enquiry cannot be permanently deleted; sign in with Google for live enquiry actions.'
      );
      return;
    }

    try {
      await deleteEnquiryFromFirestore(id);
      setStore({
        ...store,
        enquiries: store.enquiries.filter((e) => e.id !== id),
      });
      showNotice('success', 'Enquiry deleted permanently from Firebase.');
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to delete enquiry.'
      );
    }
  };

  const handleDeleteMediaItem = async (item: MediaItem) => {
    const active = draftStore || store;
    if (!active) return;

    if (!authenticated) {
      try {
        const res = deleteBrowserMedia(item.filename);
        setMedia(res.media);
        setConfirmDeleteMediaUrl(null);
        showNotice('success', `Removed "${item.filename}" from Browser Preview Library.`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Cannot delete media file.';
        showNotice('error', msg);
        throw err;
      }
      return;
    }

    try {
      const res = await deleteMediaFromFirestore(item, active);
      setMedia(res.media);
      setStore(res.store);
      setDraftStore(res.store);
      saveDraftPreviewStore(res.store);
      setStorageStats(res.storageStats);
      setConfirmDeleteMediaUrl(null);
      await refreshCms();
      showNotice(
        'success',
        `Deleted "${item.filename}" from Firebase to free cloud storage quota.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cannot delete media file.';
      showNotice('error', msg);
      throw err;
    }
  };

  const handleResetDefaults = async () => {
    const active = draftStore || store;
    if (!active) return;
    try {
      const defaultHydrated = hydrateCmsStore(DEFAULT_CMS_DATA);
      await persistStoreChanges(
        {
          ...defaultHydrated,
          enquiries: active.enquiries,
        },
        'Restored default Spaces by Muskan portfolio & copy.'
      );
      setConfirmResetModal(false);
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Failed to reset CMS store.'
      );
    }
  };

  const handleExportJsonBackup = () => {
    const active = draftStore || store;
    if (!active) return;
    const backup = {
      exportedAt: new Date().toISOString(),
      firebaseProject: FIREBASE_PROJECT_INFO,
      cms: {
        siteConfig: active.siteConfig,
        projects: active.projects,
        services: active.services,
        processSteps: active.processSteps,
        craftDetails: active.craftDetails,
        comparisonCases: active.comparisonCases,
      },
      enquiries: authenticated ? active.enquiries : [],
      mediaIndex: media.filter((m) => m.source === 'uploads'),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spaces-by-muskan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('success', 'Downloaded complete studio CMS JSON backup.');
  };

  // Loading auth state screen
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F0F0F1] flex items-center justify-center p-4 font-sans text-xs text-[#646970]">
        Loading Spaces by Muskan Studio Admin...
      </div>
    );
  }

  // Firebase Google Auth Sign-In Screen (only shown when Login Lock is enabled)
  if (loginRequired && !authenticated) {
    return (
      <div className="min-h-screen bg-[#F0F0F1] flex items-center justify-center p-4 font-sans text-[#1D2327]">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#1D2327] text-white flex items-center justify-center shadow-sm">
              <Lock className="w-6 h-6 text-[#72AEE6]" />
            </div>
            <h1 className="text-lg font-medium">Spaces by Muskan · Studio Admin</h1>
            <p className="text-xs text-[#646970]">
              Protected Studio Login · Firebase Cloud Sync
            </p>
          </div>

          <div className="bg-white border border-[#C3C4C7] p-6 space-y-4 shadow-xs">
            {loginError && (
              <div className="p-2.5 bg-[#FCF0F1] border-l-4 border-[#D63638] text-xs text-[#8A2424]">
                {loginError}
              </div>
            )}

            {unauthorizedEmail ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#FCF0F1] border-l-4 border-[#D63638] text-[#8A2424] leading-relaxed">
                  Signed in as <strong>{unauthorizedEmail}</strong>, which does not have admin permission on this studio project.
                </div>
                <p className="text-[#50575E] leading-relaxed">
                  Please sign in with the authorized studio Google account (
                  <span className="font-mono">{FIREBASE_PROJECT_INFO.primaryAdminEmail}</span>).
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleGoogleSignIn()}
                    disabled={signingIn}
                    className="flex-1 py-2 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {signingIn ? 'Opening Google...' : 'Switch Google Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="px-3 py-2 bg-white border border-[#C3C4C7] hover:border-[#2271B1] text-xs text-[#50575E] cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#50575E] leading-relaxed">
                  Sign in with Google to manage portfolio projects, upload compressed room photography to Firebase, edit site copy, and view client enquiries from any phone or computer.
                </p>
                <button
                  type="button"
                  onClick={() => void handleGoogleSignIn()}
                  disabled={signingIn}
                  className="w-full py-2.5 px-4 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{signingIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
                <div className="pt-2 border-t border-[#F0F0F1] text-[11px] text-[#646970] font-mono flex items-center justify-between">
                  <span>Project: {FIREBASE_PROJECT_INFO.projectId}</span>
                  <span>Spark Free Tier</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link to="/" className="text-xs text-[#50575E] hover:text-[#2271B1]">
              &larr; Back to Spaces by Muskan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeStore = draftStore || store;
  const projects = activeStore?.projects || [];
  const enquiries = activeStore?.enquiries || [];
  const services = activeStore?.services || [];
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'new').length;

  const filteredProjects = projects.filter((p) => {
    if (projectStatusFilter === 'published' && p.status === 'draft') return false;
    if (projectStatusFilter === 'draft' && p.status !== 'draft') return false;
    if (projectStatusFilter === 'featured' && !p.featured) return false;
    if (
      projectCategoryFilter !== 'all' &&
      p.categorySlug !== projectCategoryFilter &&
      !(p.secondaryCategories || []).includes(projectCategoryFilter as ProjectDetail['categorySlug'])
    ) {
      return false;
    }
    if (projectSearch.trim()) {
      const q = projectSearch.trim().toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredMedia = media.filter((m) => {
    if (mediaFilter !== 'all' && m.source !== mediaFilter) return false;
    if (mediaSearch.trim()) {
      return m.filename.toLowerCase().includes(mediaSearch.trim().toLowerCase());
    }
    return true;
  });

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
    section?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Portfolio / Catalogue', icon: FolderKanban, badge: projects.length },
    { id: 'enquiries', label: 'Enquiries (Orders)', icon: ShoppingBag, badge: newEnquiriesCount },
    { id: 'media', label: 'Media Library', icon: ImageIcon, badge: media.length },
    { id: 'services', label: 'Services & Vastu', icon: Briefcase },
    { id: 'process', label: 'Process & 2D/3D', icon: Layers },
    { id: 'site', label: 'Layout, Style & Copy', icon: FileEdit },
    { id: 'promotions', label: 'Promotions & Popups', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setEditingProject(null);
    setIsCreatingProject(false);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F0F1] text-[#1D2327] font-sans flex flex-col">
      {/* AUTHENTIC WORDPRESS TOP ADMIN BAR (36px) */}
      <header className="h-9 bg-[#1D2327] text-[#F0F0F1] px-3 flex items-center justify-between text-xs sticky top-0 z-40 border-b border-[#2C3338]">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1 text-[#F0F0F1] hover:text-[#72AEE6] cursor-pointer"
            aria-label="Toggle Admin Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#2C3338] hover:text-[#72AEE6] transition-colors whitespace-nowrap"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="font-semibold hidden sm:inline">
              {activeStore?.siteConfig.name || 'Spaces by Muskan'}
            </span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>

          <a
            href="/?preview=1"
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={syncDraftPreviewNow}
            onClick={syncDraftPreviewNow}
            title="Open site in a new tab with current CMS changes applied before publishing live"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2271B1] hover:bg-[#135E96] text-white font-semibold transition-colors whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </a>

          <button
            type="button"
            onClick={() => handleSelectTab('enquiries')}
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 hover:bg-[#2C3338] hover:text-[#72AEE6] transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#B297DB]" />
            <span className="font-mono tabular-nums">{newEnquiriesCount} New</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('projects');
              setEditingProject(null);
              setIsCreatingProject(true);
            }}
            className="hidden lg:flex items-center gap-1 px-2 py-1 hover:bg-[#2C3338] hover:text-[#72AEE6] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {authenticated ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2C3338] text-[11px] font-mono text-[#72AEE6]">
              <Cloud className="w-3 h-3" />
              <span>Firebase Live</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={signingIn}
              title="Sign in with Google to publish changes live to Firebase or lock admin access"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#2C3338] hover:bg-[#2271B1] text-[11px] font-mono text-[#F0C33C] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Unlock className="w-3 h-3" />
              <span>{signingIn ? 'Signing in...' : 'Open Mode · Google Sign-In'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => void loadAdminData(authenticated)}
            title="Refresh Store Data"
            className="p-1 text-[#C3C4C7] hover:text-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="hidden sm:flex items-center gap-2 whitespace-nowrap">
            <span className="text-[#C3C4C7]">
              Howdy,{' '}
              <strong className="text-white font-medium">
                {activeStore?.siteConfig.founder || 'Muskan Agarwal'}
              </strong>
            </span>
            {activeStore?.siteConfig.logoEmblem && (
              <ResolvedImg
                src={activeStore.siteConfig.logoEmblem}
                preferThumb
                alt="Admin Avatar"
                className="w-5 h-5 rounded-full object-cover border border-white/20"
              />
            )}
          </div>

          {authenticated && (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              title="Sign out of Studio Admin"
              className="flex items-center gap-1 px-2 py-1 hover:bg-[#2C3338] text-[#C3C4C7] hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* WORDPRESS DARK SIDEBAR NAVIGATION (220px) */}
        <aside
          className={`${
            mobileNavOpen ? 'fixed inset-y-0 left-0 top-9 z-30 block' : 'hidden'
          } md:block w-[220px] shrink-0 bg-[#1D2327] text-[#F0F0F1] select-none`}
        >
          <div className="py-3 space-y-0.5">
            <div className="px-3 pb-2 mb-2 border-b border-[#2C3338] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#C3C4C7]">Studio CMS</span>
              <span className="text-[10px] font-mono text-[#B297DB]">WooCommerce Ready</span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2271B1] text-white font-semibold'
                      : 'text-[#F0F0F1] hover:bg-[#2C3338] hover:text-[#72AEE6]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono tabular-nums rounded-full ${
                        item.id === 'enquiries' && item.badge > 0
                          ? 'bg-[#7F54B3] text-white'
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#2C3338] text-[#C3C4C7]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-[#2C3338] px-3 space-y-2">
              <a
                href="/?preview=1"
                target="_blank"
                rel="noopener noreferrer"
                onMouseDown={syncDraftPreviewNow}
                onClick={syncDraftPreviewNow}
                className="w-full py-2 px-2.5 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Draft Site</span>
              </a>
              <Link
                to="/"
                className="w-full py-2 px-2.5 bg-[#2C3338] hover:bg-[#3C434A] text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live Website</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN WP WORKSPACE VIEWPORT */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <div className="max-w-6xl mx-auto space-y-5">
            {/* Draft Preview / Open Mode Synchronization Banner */}
            {(hasUnpublishedDraft || !authenticated) && activeStore && (
              <div className="bg-white border border-[#C3C4C7] border-l-4 border-l-[#2271B1] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-[#1D2327] flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-[#2271B1]" />
                    <span>
                      {hasUnpublishedDraft
                        ? 'Unpublished CMS Draft Ready to Preview'
                        : 'Open Client Showcase Mode (No Login Required)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#50575E]">
                    {authenticated
                      ? 'You have edits staged in Draft Preview. Click Preview to inspect them before publishing live to Firebase.'
                      : 'Your client can freely test the entire backend from any phone without signing in. Sign in with Google when ready to publish changes live or enable a login lock.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/?preview=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseDown={syncDraftPreviewNow}
                    onClick={syncDraftPreviewNow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview in New Tab</span>
                  </a>

                  {hasUnpublishedDraft && (
                    <>
                      <button
                        type="button"
                        disabled={publishingDraft}
                        onClick={() => void handlePublishDraftToLive()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00A32A] hover:bg-[#008A20] text-white font-semibold cursor-pointer disabled:opacity-60"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>
                          {authenticated
                            ? publishingDraft
                              ? 'Publishing...'
                              : 'Publish Draft Live'
                            : 'Sign in & Publish Live'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDiscardDraft}
                        className="px-2.5 py-1.5 bg-white border border-[#C3C4C7] hover:border-[#D63638] text-[#50575E] hover:text-[#B32D2E] cursor-pointer"
                      >
                        Discard Draft
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* WordPress Dismissible Screen Notice */}
            {notice && (
              <div
                className={`bg-white border border-[#C3C4C7] border-l-4 px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs ${
                  notice.type === 'success'
                    ? 'border-l-[#00A32A]'
                    : notice.type === 'info'
                    ? 'border-l-[#2271B1]'
                    : 'border-l-[#D63638]'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-[#1D2327] font-medium">
                  <span>{notice.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="text-[#646970] hover:text-[#1D2327] cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {loading || !activeStore ? (
              <div className="bg-white border border-[#C3C4C7] p-12 text-center text-xs text-[#646970]">
                Loading Spaces by Muskan Studio Backend...
              </div>
            ) : (
              <>
                {/* ================= 1. WORDPRESS DASHBOARD ================= */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h1 className="text-xl font-normal text-[#1D2327]">Dashboard</h1>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('projects');
                            setEditingProject(null);
                            setIsCreatingProject(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Portfolio Project</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('site')}
                          className="px-3 py-1.5 bg-white border border-[#C3C4C7] hover:border-[#2271B1] text-xs text-[#2271B1] font-medium cursor-pointer"
                        >
                          Edit Website Copy &amp; Contact
                        </button>
                      </div>
                    </div>

                    {/* Welcome / Quick Actions Metabox */}
                    <div className="bg-white border border-[#C3C4C7] p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      <div className="md:col-span-8 space-y-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#7F54B3] font-semibold">
                          Spaces by Muskan · Mi Interiors Backend
                        </span>
                        <h2 className="text-lg font-medium text-[#1D2327]">
                          Welcome to your WordPress &amp; WooCommerce Studio Manager
                        </h2>
                        <p className="text-xs text-[#50575E] leading-relaxed max-w-2xl">
                          Manage portfolio projects like a WooCommerce catalogue, upload 4K room photos to the Media Library, edit headlines and Vastu service copy, update your phone/WhatsApp/email details, and preview every draft edit before publishing live.
                        </p>
                      </div>
                      <div className="md:col-span-4 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('media')}
                          className="w-full py-2 px-3 bg-[#F6F7F7] hover:bg-[#F0F6FC] border border-[#C3C4C7] hover:border-[#2271B1] text-xs font-medium text-[#2271B1] flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New Portfolio Photos</span>
                        </button>
                        <a
                          href="/?preview=1"
                          target="_blank"
                          rel="noopener noreferrer"
                          onMouseDown={syncDraftPreviewNow}
                          onClick={syncDraftPreviewNow}
                          className="w-full py-2 px-3 bg-[#1D2327] hover:bg-[#2271B1] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview Site with Draft Changes</span>
                        </a>
                      </div>
                    </div>

                    {/* At a Glance + Quick Status Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      <div className="lg:col-span-6 bg-white border border-[#C3C4C7]">
                        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
                          <h3 className="text-xs font-semibold text-[#1D2327]">At a Glance</h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4 text-xs">
                          <button
                            type="button"
                            onClick={() => setActiveTab('projects')}
                            className="p-3 border border-[#DCDCDE] hover:border-[#2271B1] text-left cursor-pointer transition-colors"
                          >
                            <span className="text-xl font-semibold font-mono tabular-nums text-[#2271B1] block">
                              {projects.length}
                            </span>
                            <span className="text-[#50575E] mt-0.5 block">
                              Portfolio Projects ({projects.filter((p) => p.status !== 'draft').length} Published)
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab('enquiries')}
                            className="p-3 border border-[#DCDCDE] hover:border-[#7F54B3] text-left cursor-pointer transition-colors"
                          >
                            <span className="text-xl font-semibold font-mono tabular-nums text-[#7F54B3] block">
                              {enquiries.length}
                            </span>
                            <span className="text-[#50575E] mt-0.5 block">
                              Client Enquiries ({newEnquiriesCount} Unread)
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab('services')}
                            className="p-3 border border-[#DCDCDE] hover:border-[#2271B1] text-left cursor-pointer transition-colors"
                          >
                            <span className="text-xl font-semibold font-mono tabular-nums text-[#1D2327] block">
                              {services.length}
                            </span>
                            <span className="text-[#50575E] mt-0.5 block">
                              Active Services &amp; Vastu
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab('media')}
                            className="p-3 border border-[#DCDCDE] hover:border-[#2271B1] text-left cursor-pointer transition-colors"
                          >
                            <span className="text-xl font-semibold font-mono tabular-nums text-[#1D2327] block">
                              {media.length}
                            </span>
                            <span className="text-[#50575E] mt-0.5 block">
                              Media Library Assets
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-6 bg-white border border-[#C3C4C7]">
                        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-[#1D2327]">
                            WooCommerce Studio Status · Contact Channels
                          </h3>
                          <button
                            type="button"
                            onClick={() => setActiveTab('site')}
                            className="text-[11px] text-[#2271B1] hover:underline cursor-pointer"
                          >
                            Edit Details
                          </button>
                        </div>
                        <div className="p-4 space-y-2.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                            <span className="text-[#646970]">Telephone</span>
                            <span className="font-mono text-[#1D2327]">{activeStore.siteConfig.phone}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                            <span className="text-[#646970]">WhatsApp Line</span>
                            <span className="font-mono text-[#1D2327]">{activeStore.siteConfig.whatsappNumber}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                            <span className="text-[#646970]">Studio Email</span>
                            <span className="font-mono text-[#1D2327]">{activeStore.siteConfig.email}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-[#646970]">Instagram</span>
                            <span className="font-mono text-[#2271B1]">{activeStore.siteConfig.instagramHandle}</span>
                          </div>
                        </div>
                      </div>

                      {storageStats && (
                        <div className="lg:col-span-12 bg-white border border-[#C3C4C7]">
                          <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <HardDrive className="w-4 h-4 text-[#2271B1]" />
                              <h3 className="text-xs font-semibold text-[#1D2327]">
                                Firebase Firestore Cloud Storage (Spark Free Tier · 1 GiB)
                              </h3>
                            </div>
                            <span className="text-[11px] font-mono text-[#1E6B2F]">
                              Auto-WebP Compressed · IndexedDB Visitor Cache Active
                            </span>
                          </div>
                          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div className="p-3 border border-[#DCDCDE] bg-[#FBFBFB]">
                              <span className="text-[10px] uppercase tracking-wider text-[#646970] block">
                                Total Media Assets
                              </span>
                              <span className="text-lg font-mono font-semibold text-[#1D2327] tabular-nums">
                                {storageStats.totalSourceImages} files
                              </span>
                              <span className="text-[11px] text-[#646970] block mt-0.5">
                                {storageStats.archiveCount} 4K Archive · {storageStats.uploadsCount} Firebase Cloud
                              </span>
                            </div>

                            <div className="p-3 border border-[#DCDCDE] bg-[#FBFBFB]">
                              <span className="text-[10px] uppercase tracking-wider text-[#646970] block">
                                Compression Space Saved
                              </span>
                              <span className="text-lg font-mono font-semibold text-[#2271B1] tabular-nums">
                                {((storageStats.originalBytesSaved || 0) / (1024 * 1024)).toFixed(2)} MB
                              </span>
                              <span className="text-[11px] text-[#646970] block mt-0.5">
                                Crisp 1600px WebP + fast 420px thumbs
                              </span>
                            </div>

                            <div className="p-3 border border-[#DCDCDE] bg-[#FBFBFB]">
                              <span className="text-[10px] uppercase tracking-wider text-[#646970] block">
                                Firebase Cloud Used
                              </span>
                              <span className="text-lg font-mono font-semibold text-[#1D2327] tabular-nums">
                                {(storageStats.usedBytes / (1024 * 1024)).toFixed(2)} MB
                              </span>
                              <span className="text-[11px] text-[#646970] block mt-0.5">
                                Out of 1,024 MB Free Tier quota
                              </span>
                            </div>

                            <div className="p-3 border border-[#DCDCDE] bg-[#FBFBFB]">
                              <span className="text-[10px] uppercase tracking-wider text-[#646970] block">
                                Free Quota Remaining
                              </span>
                              <span className="text-lg font-mono font-semibold text-[#1E6B2F] tabular-nums">
                                {(storageStats.freeBytes / (1024 * 1024)).toFixed(1)} MB
                              </span>
                              <span className="text-[11px] text-[#646970] block mt-0.5">
                                Deleting photos reclaims quota instantly
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* REAL-TIME VISUAL BRANDING STUDIO PANEL */}
                    <AdminVisualBrandingPanel
                      siteConfig={activeStore.siteConfig}
                      onSaveSite={handleSaveSite}
                      onDraftChange={handleBrandingDraftChange}
                    />
                  </div>
                )}

                {/* ================= 2. WOOCOMMERCE PORTFOLIO CATALOGUE ================= */}
                {activeTab === 'projects' && (
                  <>
                    {isCreatingProject || editingProject ? (
                      <ProjectEditor
                        project={editingProject}
                        isNew={isCreatingProject}
                        media={media}
                        onSave={handleSaveProject}
                        onUploadFile={handleUploadFile}
                        onDeleteMedia={handleDeleteMediaItem}
                        onDraftChange={handleProjectDraftChange}
                        onCancel={() => {
                          setEditingProject(null);
                          setIsCreatingProject(false);
                        }}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <h1 className="text-xl font-normal text-[#1D2327]">
                              Portfolio Projects (Catalogue)
                            </h1>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProject(null);
                                setIsCreatingProject(true);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#2271B1] hover:text-white text-xs font-medium cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add New</span>
                            </button>
                          </div>

                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-[#646970] absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={projectSearch}
                              onChange={(e) => setProjectSearch(e.target.value)}
                              placeholder="Search projects or SKU..."
                              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none w-56"
                            />
                          </div>
                        </div>

                        {/* Status & Category Filter Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            {(
                              [
                                { id: 'all', label: `All (${projects.length})` },
                                {
                                  id: 'published',
                                  label: `Published (${projects.filter((p) => p.status !== 'draft').length})`,
                                },
                                {
                                  id: 'draft',
                                  label: `Draft (${projects.filter((p) => p.status === 'draft').length})`,
                                },
                                {
                                  id: 'featured',
                                  label: `Featured (${projects.filter((p) => p.featured).length})`,
                                },
                              ] as const
                            ).map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setProjectStatusFilter(item.id)}
                                className={`px-2.5 py-1 border cursor-pointer ${
                                  projectStatusFilter === item.id
                                    ? 'bg-[#2271B1] text-white border-[#2271B1] font-medium'
                                    : 'bg-white text-[#50575E] border-[#C3C4C7] hover:border-[#2271B1]'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>

                          <select
                            value={projectCategoryFilter}
                            onChange={(e) => setProjectCategoryFilter(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-[#8C8F94] text-xs focus:border-[#2271B1] focus:outline-none"
                          >
                            <option value="all">Filter by category (All)</option>
                            <option value="residential">Residential</option>
                            <option value="bedrooms">Bedrooms</option>
                            <option value="kitchens">Kitchens</option>
                            <option value="bathrooms">Bathrooms</option>
                            <option value="commercial">Commercial</option>
                            <option value="detailing">Detailing</option>
                          </select>
                        </div>

                        {/* WooCommerce Product-Style Table */}
                        <div className="bg-white border border-[#C3C4C7] overflow-x-auto">
                          {filteredProjects.length === 0 ? (
                            <div className="py-12 text-center text-xs text-[#646970]">
                              No matching projects found.
                            </div>
                          ) : (
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-[#F6F7F7] border-b border-[#C3C4C7] font-semibold text-[#1D2327]">
                                  <th className="py-2.5 px-2 w-8" title="Drag rows to reorder" />
                                  <th className="py-2.5 px-3 w-12">Photo</th>
                                  <th className="py-2.5 px-3">Project Name</th>
                                  <th className="py-2.5 px-3">SKU</th>
                                  <th className="py-2.5 px-3">Availability</th>
                                  <th className="py-2.5 px-3">Estimate Label</th>
                                  <th className="py-2.5 px-3">Category</th>
                                  <th className="py-2.5 px-3 text-center">Featured</th>
                                  <th className="py-2.5 px-3">Status</th>
                                  <th className="py-2.5 px-3 text-right">Order</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#F0F0F1]">
                                {filteredProjects.map((project, idx) => (
                                  <tr
                                    key={project.id}
                                    draggable
                                    onDragStart={(e) => {
                                      if ((e.target as HTMLElement).closest('button, a, input')) {
                                        e.preventDefault();
                                        return;
                                      }
                                      setDragProjectId(project.id);
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.dataTransfer.setData('text/plain', project.id);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (dragOverProjectId !== project.id) {
                                        setDragOverProjectId(project.id);
                                      }
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      if (dragProjectId && dragProjectId !== project.id) {
                                        void handleDropProject(dragProjectId, project.id);
                                      }
                                      setDragProjectId(null);
                                      setDragOverProjectId(null);
                                    }}
                                    onDragEnd={() => {
                                      setDragProjectId(null);
                                      setDragOverProjectId(null);
                                    }}
                                    className={`transition-colors group ${
                                      dragProjectId === project.id
                                        ? 'opacity-45 bg-[#F0F6FC]'
                                        : dragOverProjectId === project.id
                                        ? 'bg-[#F0F6FC] outline-2 outline-[#2271B1]'
                                        : 'hover:bg-[#F6F7F7]'
                                    }`}
                                  >
                                    <td
                                      className="py-2 px-2 text-[#8C8F94] hover:text-[#2271B1] cursor-grab active:cursor-grabbing"
                                      title="Drag row to reorder"
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </td>
                                    <td className="py-2 px-3">
                                      <ResolvedImg
                                        src={project.heroImage}
                                        preferThumb
                                        alt={project.title}
                                        className="w-11 h-11 object-cover border border-[#DCDCDE] bg-[#F0F0F1]"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIsCreatingProject(false);
                                          setEditingProject(project);
                                        }}
                                        className="font-semibold text-[#2271B1] hover:underline text-left cursor-pointer block"
                                      >
                                        {project.title}
                                      </button>
                                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#646970]">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setIsCreatingProject(false);
                                            setEditingProject(project);
                                          }}
                                          className="text-[#2271B1] hover:underline cursor-pointer"
                                        >
                                          Edit
                                        </button>
                                        <span>|</span>
                                        <button
                                          type="button"
                                          onClick={() => void handleDuplicateProject(project)}
                                          className="text-[#2271B1] hover:underline cursor-pointer"
                                        >
                                          Duplicate
                                        </button>
                                        <span>|</span>
                                        <Link
                                          to={`/projects/${project.id}`}
                                          className="text-[#2271B1] hover:underline"
                                        >
                                          View
                                        </Link>
                                        <span>|</span>
                                        {confirmDeleteProjectId === project.id ? (
                                          <button
                                            type="button"
                                            onClick={() => void handleDeleteProject(project.id)}
                                            className="text-[#D63638] font-semibold cursor-pointer"
                                          >
                                            Confirm Delete
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteProjectId(project.id)}
                                            className="text-[#B32D2E] hover:underline cursor-pointer"
                                          >
                                            Trash
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 font-mono text-[#50575E] tabular-nums">
                                      {project.sku || '—'}
                                    </td>
                                    <td className="py-2 px-3 text-[#1E6B2F] font-medium">
                                      {project.availability || 'Open for Commission'}
                                    </td>
                                    <td className="py-2 px-3 text-[#50575E]">
                                      {project.estimateLabel || 'Bespoke Quote'}
                                    </td>
                                    <td className="py-2 px-3 text-[#2271B1]">
                                      {project.category}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleToggleProjectFlag(project, {
                                            featured: !project.featured,
                                          })
                                        }
                                        title="Toggle Featured on Homepage"
                                        className="p-1 cursor-pointer"
                                      >
                                        <Star
                                          className={`w-4 h-4 ${
                                            project.featured
                                              ? 'fill-[#7F54B3] text-[#7F54B3]'
                                              : 'text-[#C3C4C7] hover:text-[#7F54B3]'
                                          }`}
                                        />
                                      </button>
                                    </td>
                                    <td className="py-2 px-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleToggleProjectFlag(project, {
                                            status:
                                              project.status === 'draft' ? 'published' : 'draft',
                                          })
                                        }
                                        className={`px-2 py-0.5 border text-[11px] font-medium cursor-pointer ${
                                          project.status === 'draft'
                                            ? 'bg-[#F0F0F1] text-[#50575E] border-[#C3C4C7]'
                                            : 'bg-[#EDFAEF] text-[#1E6B2F] border-[#68DE7C]'
                                        }`}
                                      >
                                        {project.status === 'draft' ? 'Draft' : 'Published'}
                                      </button>
                                    </td>
                                    <td className="py-2 px-3 text-right whitespace-nowrap">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => void handleMoveProject(idx, -1)}
                                        className="p-1 border border-[#DCDCDE] disabled:opacity-30 hover:border-[#2271B1] mr-1 cursor-pointer"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === filteredProjects.length - 1}
                                        onClick={() => void handleMoveProject(idx, 1)}
                                        className="p-1 border border-[#DCDCDE] disabled:opacity-30 hover:border-[#2271B1] cursor-pointer"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ================= 3. ENQUIRIES (WOOCOMMERCE ORDERS) ================= */}
                {activeTab === 'enquiries' && (
                  <AdminEnquiriesPanel
                    enquiries={enquiries}
                    onUpdateEnquiry={handleUpdateEnquiry}
                    onDeleteEnquiry={handleDeleteEnquiry}
                  />
                )}

                {/* ================= 4. WORDPRESS MEDIA LIBRARY ================= */}
                {activeTab === 'media' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h1 className="text-xl font-normal text-[#1D2327]">
                          Media Library <span className="text-xs text-[#646970] font-mono">({media.length})</span>
                        </h1>
                        <p className="text-xs text-[#646970] mt-0.5">
                          Upload high-resolution interior photos (JPG, PNG, WebP) and assign them to any project, service, or hero banner.
                        </p>
                      </div>

                      <div>
                        <input
                          ref={mediaInputRef}
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;
                            setUploadingMedia(true);
                            try {
                              for (const file of files) {
                                await handleUploadFile(file);
                              }
                            } catch (err) {
                              showNotice(
                                'error',
                                err instanceof Error ? err.message : 'Upload failed.'
                              );
                            } finally {
                              setUploadingMedia(false);
                              e.target.value = '';
                            }
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploadingMedia}
                          onClick={() => mediaInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingMedia ? 'Uploading...' : 'Add New Media File'}</span>
                        </button>
                      </div>
                    </div>

                    {storageStats && (
                      <div className="bg-white border border-[#C3C4C7] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#50575E]">
                        <span>
                          Synced on <span className="font-mono text-[#1D2327]">Firebase Firestore ({FIREBASE_PROJECT_INFO.projectId})</span>:{' '}
                          <strong className="text-[#1D2327]">
                            {(storageStats.usedBytes / (1024 * 1024)).toFixed(2)} MB
                          </strong>{' '}
                          across {storageStats.uploadsCount} compressed cloud uploads
                          {storageStats.originalBytesSaved
                            ? ` (${(storageStats.originalBytesSaved / (1024 * 1024)).toFixed(1)} MB saved via WebP compression)`
                            : ''}.
                        </span>
                        <span className="font-mono text-[#1E6B2F]">
                          {(storageStats.freeBytes / (1024 * 1024)).toFixed(1)} MB free of 1 GiB Spark tier · Instant delete
                        </span>
                      </div>
                    )}

                    {/* Filter & Search Bar */}
                    <div className="bg-white border border-[#C3C4C7] p-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        {(
                          [
                            { id: 'all', label: `All (${media.length})` },
                            {
                              id: 'uploads',
                              label: `Firebase Cloud (${media.filter((m) => m.source === 'uploads').length})`,
                            },
                            {
                              id: 'muskan',
                              label: `4K Studio Archive (${media.filter((m) => m.source === 'muskan').length})`,
                            },
                          ] as const
                        ).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setMediaFilter(item.id)}
                            className={`px-3 py-1 border cursor-pointer ${
                              mediaFilter === item.id
                                ? 'bg-[#2271B1] text-white border-[#2271B1] font-medium'
                                : 'bg-[#F6F7F7] text-[#50575E] border-[#C3C4C7] hover:border-[#2271B1]'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#646970] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={mediaSearch}
                          onChange={(e) => setMediaSearch(e.target.value)}
                          placeholder="Search media..."
                          className="pl-8 pr-3 py-1.5 text-xs border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none w-56"
                        />
                      </div>
                    </div>

                    {/* Media Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filteredMedia.map((item) => (
                        <div
                          key={item.url}
                          className="bg-white border border-[#C3C4C7] overflow-hidden flex flex-col justify-between"
                        >
                          <div className="aspect-square bg-[#E5E5E5] overflow-hidden">
                            <ResolvedImg
                              src={item.url}
                              preferThumb
                              alt={item.filename}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2.5 space-y-2 border-t border-[#F0F0F1] text-[11px]">
                            <div>
                              <p className="font-medium text-[#1D2327] truncate" title={item.filename}>
                                {item.filename}
                              </p>
                              <p className="text-[10px] font-mono text-[#646970] tabular-nums">
                                {item.source === 'uploads' ? 'Firebase Cloud' : '4K Archive'} · {(item.sizeBytes / 1024).toFixed(0)} KB
                                {item.originalSizeBytes && item.originalSizeBytes > item.sizeBytes
                                  ? ` (from ${(item.originalSizeBytes / 1024).toFixed(0)} KB)`
                                  : ''}
                                {item.optimized ? ' · WebP' : ''}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#F0F0F1]">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.url);
                                  setCopiedUrl(item.url);
                                  setTimeout(() => setCopiedUrl(null), 1600);
                                }}
                                className="inline-flex items-center gap-1 text-[#2271B1] hover:underline cursor-pointer"
                              >
                                {copiedUrl === item.url ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#00A32A]" />
                                    <span className="text-[#00A32A]">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy URL</span>
                                  </>
                                )}
                              </button>

                              {confirmDeleteMediaUrl === item.url ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteMediaItem(item)}
                                    className="text-[#D63638] font-semibold cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteMediaUrl(null)}
                                    className="text-[#646970] hover:text-[#1D2327] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteMediaUrl(item.url)}
                                  className="text-[#B32D2E] hover:underline cursor-pointer inline-flex items-center gap-0.5"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ================= 5. SERVICES EDITOR ================= */}
                {activeTab === 'services' && (
                  <AdminServicesEditor
                    services={services}
                    media={media}
                    onSaveServices={handleSaveServices}
                    onUploadFile={handleUploadFile}
                    onDeleteMedia={handleDeleteMediaItem}
                    onDraftChange={handleServicesDraftChange}
                  />
                )}

                {/* ================= 6. PAGES, LAYOUT ORDER, STYLE & SITE COPY EDITOR ================= */}
                {activeTab === 'site' && (
                  <AdminSiteEditor
                    siteConfig={activeStore.siteConfig}
                    media={media}
                    onSaveSite={handleSaveSite}
                    onUploadFile={handleUploadFile}
                    onDeleteMedia={handleDeleteMediaItem}
                    onDraftChange={handleSiteDraftChange}
                  />
                )}

                {/* ================= 7. DESIGN PROCESS & 2D/3D COMPARISON EDITOR ================= */}
                {activeTab === 'process' && (
                  <AdminProcessEditor
                    processSteps={activeStore.processSteps}
                    comparisonCases={activeStore.comparisonCases}
                    media={media}
                    onSaveProcess={handleSaveProcess}
                    onUploadFile={handleUploadFile}
                    onDeleteMedia={handleDeleteMediaItem}
                    onDraftChange={handleProcessDraftChange}
                  />
                )}

                {/* ================= 8. PROMOTIONS, POPUP ADS & MOVING TICKER ================= */}
                {activeTab === 'promotions' && (
                  <AdminPromotionsEditor
                    siteConfig={activeStore.siteConfig}
                    services={services}
                    media={media}
                    onSaveSite={handleSaveSite}
                    onUploadFile={handleUploadFile}
                    onDeleteMedia={handleDeleteMediaItem}
                    onDraftChange={handlePromotionsDraftChange}
                  />
                )}

                {/* ================= 9. SETTINGS, ACCESS LOCK & PORTABILITY ================= */}
                {activeTab === 'settings' && (
                  <div className="space-y-5 max-w-3xl">
                    <h1 className="text-xl font-normal text-[#1D2327]">
                      Access Lock, Firebase Cloud &amp; Transfer Settings
                    </h1>

                    {/* Admin Login Credentials & Showcase Lock Card */}
                    <div className="bg-white border border-[#C3C4C7]">
                      <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#2271B1]" />
                          <h2 className="text-xs font-semibold text-[#1D2327]">
                            Admin Login Protection (Open Showcase vs Locked)
                          </h2>
                        </div>
                        <span
                          className={`text-[11px] font-mono font-medium ${
                            loginRequired ? 'text-[#1E6B2F]' : 'text-[#996800]'
                          }`}
                        >
                          {loginRequired ? 'Google Login Required' : 'Open Client Showcase'}
                        </span>
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <p className="text-[#50575E] leading-relaxed">
                          {loginRequired
                            ? 'Login protection is ON. Visitors opening /wp-admin must sign in with your authorized Google account before viewing the studio dashboard.'
                            : 'Open Showcase is ON so your client can explore the entire backend from her phone without your login credentials and test edits with the Preview button. Your real Firebase database and real customer enquiries stay protected until you sign in.'}
                        </p>

                        {authenticated ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {loginRequired ? (
                              <button
                                type="button"
                                onClick={() => void handleToggleLoginLock(false)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#C3C4C7] hover:border-[#2271B1] text-[#1D2327] font-medium cursor-pointer"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Re-Open for Client Showcase (No Login)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleToggleLoginLock(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white font-semibold cursor-pointer"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Enable Google Login Lock Now</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleGoogleSignIn()}
                            disabled={signingIn}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white font-semibold cursor-pointer disabled:opacity-60"
                          >
                            <Cloud className="w-3.5 h-3.5" />
                            <span>
                              {signingIn
                                ? 'Opening Google...'
                                : 'Sign in with Google to Enable Lock or Publish Live'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Firebase Project & Portability Card */}
                    <div className="bg-white border border-[#C3C4C7]">
                      <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex items-center justify-between">
                        <h2 className="text-xs font-semibold text-[#1D2327]">
                          Dedicated Firebase Project &amp; Admin Session
                        </h2>
                        <span className="text-[11px] font-mono text-[#1E6B2F]">
                          Spark Free Tier · Cross-Device Sync
                        </span>
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FBFBFB] border border-[#DCDCDE] p-3 font-mono text-[11px]">
                          <div>
                            <span className="text-[#646970] block text-[10px] uppercase">
                              Firebase Project ID
                            </span>
                            <span className="text-[#1D2327] font-semibold">
                              {FIREBASE_PROJECT_INFO.projectId}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#646970] block text-[10px] uppercase">
                              Session Status
                            </span>
                            <span className="text-[#1D2327] font-semibold">
                              {authenticated
                                ? authUser?.email || FIREBASE_PROJECT_INFO.primaryAdminEmail
                                : 'Open Client Preview (Not Signed In)'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[#50575E] leading-relaxed">
                          Published portfolio edits, compressed cloud photos, and client enquiries are stored in your standalone Firebase Firestore project so updates sync across all devices and can be exported anytime.
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleExportJsonBackup}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white font-semibold cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Full CMS JSON Backup</span>
                          </button>

                          {authenticated && (
                            <button
                              type="button"
                              onClick={() => void handleSignOut()}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#C3C4C7] hover:border-[#2271B1] text-[#1D2327] font-medium cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Sign Out / Switch Google Account</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Restore Default Seed */}
                    <div className="bg-white border border-[#C3C4C7]">
                      <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
                        <h2 className="text-xs font-semibold text-[#1D2327]">
                          Restore Original Portfolio Defaults
                        </h2>
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <p className="text-[#50575E] leading-relaxed">
                          Reset all text copy, services, process stages, and default 6 portfolio projects back to the initial Spaces by Muskan release state. Client enquiries and uploaded Firebase images remain intact.
                        </p>
                        {confirmResetModal ? (
                          <div className="p-3 bg-[#FCF0F1] border border-[#D63638] flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[#8A2424] font-medium">
                              Confirm restoring default website copy and portfolio?
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setConfirmResetModal(false)}
                                className="px-3 py-1 bg-white border border-[#C3C4C7] text-[#1D2327] cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleResetDefaults()}
                                className="px-3 py-1 bg-[#D63638] text-white font-semibold cursor-pointer"
                              >
                                Yes, Restore Defaults
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmResetModal(true)}
                            className="px-3.5 py-1.5 border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] font-medium cursor-pointer"
                          >
                            Reset CMS to Defaults
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
