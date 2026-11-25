import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Check,
  Copy,
  ExternalLink,
  FileEdit,
  FolderKanban,
  GripVertical,
  HardDrive,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Lock,
  Megaphone,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { AdminEnquiriesPanel } from '../components/admin/AdminEnquiriesPanel';
import { AdminPromotionsEditor } from '../components/admin/AdminPromotionsEditor';
import { AdminVisualBrandingPanel } from '../components/admin/AdminVisualBrandingPanel';
import {
  AdminProcessEditor,
  AdminServicesEditor,
  AdminSiteEditor,
} from '../components/admin/AdminSiteEditor';
import { ProjectEditor } from '../components/admin/ProjectEditor';
import {
  CmsStoreData,
  DrawingComparisonCase,
  EnquiryOrder,
  EnquiryStatus,
  MediaItem,
  ProcessStep,
  ProjectDetail,
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

const TOKEN_STORAGE_KEY = 'sbm_wp_admin_token';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read selected file.'));
    reader.readAsDataURL(file);
  });
}

export const AdminPage: React.FC = () => {
  const { refreshCms } = useCms();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Auth state (optional studio passcode)
  const [authChecked, setAuthChecked] = useState(false);
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState<string>(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || ''
  );
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Store state
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<CmsStoreData | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);

  // Feedback Notice
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

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
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  const showNotice = useCallback((type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
  }, []);

  const authHeaders = useCallback(
    (extra?: Record<string, string>) => {
      const h: Record<string, string> = { ...(extra || {}) };
      if (adminToken) h['x-admin-token'] = adminToken;
      return h;
    },
    [adminToken]
  );

  const loadAdminData = useCallback(
    async (tokenOverride?: string) => {
      setLoading(true);
      try {
        const headers: Record<string, string> = {};
        const tk = tokenOverride ?? adminToken;
        if (tk) headers['x-admin-token'] = tk;

        const statusRes = await fetch('/api/admin/auth/status', { headers });
        const statusData = await statusRes.json();
        setPasscodeEnabled(Boolean(statusData.passcodeEnabled));
        setAuthenticated(Boolean(statusData.authenticated));
        setAuthChecked(true);

        if (!statusData.authenticated) {
          setLoading(false);
          return;
        }

        const cmsRes = await fetch('/api/admin/cms', { headers, cache: 'no-store' });
        if (!cmsRes.ok) {
          if (cmsRes.status === 401) {
            setAuthenticated(false);
          }
          setLoading(false);
          return;
        }
        const data = await cmsRes.json();
        setStore({
          siteConfig: data.siteConfig,
          projects: data.projects || [],
          services: data.services || [],
          processSteps: data.processSteps || [],
          craftDetails: data.craftDetails || [],
          comparisonCases: data.comparisonCases || [],
          enquiries: data.enquiries || [],
          updatedAt: data.updatedAt,
        });
        setMedia(data.media || []);
        if (data.storageStats) {
          setStorageStats(data.storageStats);
        }
      } catch {
        showNotice('error', 'Unable to connect to the backend API.');
      } finally {
        setLoading(false);
      }
    },
    [adminToken, showNotice]
  );

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: loginPasscode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Incorrect passcode.');
        return;
      }
      if (data.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setAdminToken(data.token);
        setLoginPasscode('');
        await loadAdminData(data.token);
      }
    } catch {
      setLoginError('Network error while verifying passcode.');
    }
  };

  const handleUploadFile = async (file: File): Promise<MediaItem | null> => {
    const dataBase64 = await readFileAsBase64(file);
    const res = await fetch('/api/admin/media/upload', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        dataBase64,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Upload failed.');
    }
    setMedia(data.media || []);
    if (data.storageStats) {
      setStorageStats(data.storageStats);
    }
    showNotice('success', `Uploaded "${data.mediaItem.filename}" to Media Library.`);
    return data.mediaItem as MediaItem;
  };

  const handleSaveSite = async (nextConfig: StudioSiteConfig) => {
    const res = await fetch('/api/admin/site', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(nextConfig),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.error || 'Failed to save site settings.');
      return;
    }
    setStore((prev) => (prev ? { ...prev, siteConfig: data.siteConfig } : prev));
    await refreshCms();
    showNotice('success', 'Site copy, images, and contact channels updated live.');
  };

  const handleSaveProject = async (payload: ProjectDetail, isNew: boolean) => {
    const endpoint = isNew
      ? '/api/admin/projects'
      : `/api/admin/projects/${encodeURIComponent(payload.id)}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(endpoint, {
      method,
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.error || 'Failed to save project.');
      return;
    }
    setStore((prev) => (prev ? { ...prev, projects: data.projects } : prev));
    setEditingProject(null);
    setIsCreatingProject(false);
    await refreshCms();
    showNotice(
      'success',
      isNew
        ? `Project "${data.project.title}" published to portfolio.`
        : `Project "${data.project.title}" updated.`
    );
  };

  const handleToggleProjectFlag = async (
    project: ProjectDetail,
    patch: Partial<ProjectDetail>
  ) => {
    const res = await fetch(`/api/admin/projects/${encodeURIComponent(project.id)}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) return;
    setStore((prev) => (prev ? { ...prev, projects: data.projects } : prev));
    await refreshCms();
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
    if (!store) return;
    const target = index + direction;
    if (target < 0 || target >= store.projects.length) return;
    const nextList = [...store.projects];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(target, 0, moved);

    setStore({ ...store, projects: nextList });
    await fetch('/api/admin/projects-reorder', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ orderedIds: nextList.map((p) => p.id) }),
    });
    await refreshCms();
    showNotice('success', 'Portfolio display order updated.');
  };

  const handleDropProject = async (fromId: string, toId: string) => {
    if (!store || fromId === toId) return;
    const fromIdx = store.projects.findIndex((p) => p.id === fromId);
    const toIdx = store.projects.findIndex((p) => p.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    const nextList = [...store.projects];
    const [moved] = nextList.splice(fromIdx, 1);
    nextList.splice(toIdx, 0, moved);

    setStore({ ...store, projects: nextList });
    await fetch('/api/admin/projects-reorder', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ orderedIds: nextList.map((p) => p.id) }),
    });
    await refreshCms();
    showNotice('success', 'Portfolio display order updated via drag & drop.');
  };

  const handleDeleteProject = async (id: string) => {
    const res = await fetch(`/api/admin/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.error || 'Could not delete project.');
      return;
    }
    setStore((prev) => (prev ? { ...prev, projects: data.projects } : prev));
    setConfirmDeleteProjectId(null);
    await refreshCms();
    showNotice('success', 'Project removed from portfolio.');
  };

  const handleSaveServices = async (services: ServiceItem[]) => {
    const res = await fetch('/api/admin/services', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ services }),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.error || 'Failed to save services.');
      return;
    }
    setStore((prev) => (prev ? { ...prev, services: data.services } : prev));
    await refreshCms();
    showNotice('success', 'Studio services updated.');
  };

  const handleSaveProcess = async (
    processSteps: ProcessStep[],
    comparisonCases?: DrawingComparisonCase[]
  ) => {
    const res = await fetch('/api/admin/process', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ processSteps, comparisonCases }),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.error || 'Failed to update process stages.');
      return;
    }
    setStore((prev) =>
      prev
        ? {
            ...prev,
            processSteps: data.processSteps,
            comparisonCases: data.comparisonCases || prev.comparisonCases,
          }
        : prev
    );
    await refreshCms();
    showNotice('success', 'Design process stages & 2D/3D comparison studies saved.');
  };

  const handleUpdateEnquiry = async (
    id: string,
    payload: { status?: EnquiryStatus; internalNote?: string }
  ) => {
    const res = await fetch(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.error || 'Failed to update enquiry.');
      return;
    }
    setStore((prev) => (prev ? { ...prev, enquiries: data.enquiries } : prev));
    showNotice('success', 'Enquiry status saved.');
  };

  const handleDeleteEnquiry = async (id: string) => {
    const res = await fetch(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return;
    setStore((prev) => (prev ? { ...prev, enquiries: data.enquiries } : prev));
    showNotice('success', 'Enquiry deleted.');
  };

  const handleDeleteMediaItem = async (item: MediaItem) => {
    const res = await fetch(
      `/api/admin/media/${encodeURIComponent(item.filename)}?source=${encodeURIComponent(item.source)}`,
      {
        method: 'DELETE',
        headers: authHeaders(),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.error || 'Cannot delete media file.');
      throw new Error(data.error || 'Cannot delete media file.');
    }
    setMedia(data.media || []);
    if (data.storageStats) {
      setStorageStats(data.storageStats);
    }
    if (data.store) {
      setStore(data.store);
    }
    setConfirmDeleteMediaUrl(null);
    await refreshCms();
    showNotice('success', `Deleted "${item.filename}" and scrubbed stale image references.`);
  };

  const handlePasscodeConfig = async (enable: boolean) => {
    const res = await fetch('/api/admin/auth/passcode', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ enable, passcode: newPasscode }),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.error || 'Could not update passcode settings.');
      return;
    }
    setPasscodeEnabled(Boolean(data.passcodeEnabled));
    if (data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setAdminToken(data.token);
    }
    setNewPasscode('');
    showNotice(
      'success',
      data.passcodeEnabled
        ? 'Studio Admin passcode protection enabled.'
        : 'Passcode protection disabled.'
    );
  };

  const handleResetDefaults = async () => {
    const res = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', 'Failed to reset CMS store.');
      return;
    }
    setStore(data.store);
    setConfirmResetModal(false);
    await refreshCms();
    showNotice('success', 'Restored default Spaces by Muskan portfolio & copy.');
  };

  // Passcode Lock Screen
  if (authChecked && passcodeEnabled && !authenticated) {
    return (
      <div className="min-h-screen bg-[#F0F0F1] flex items-center justify-center p-4 font-sans text-[#1D2327]">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#1D2327] text-white flex items-center justify-center shadow-sm">
              <Lock className="w-6 h-6 text-[#72AEE6]" />
            </div>
            <h1 className="text-lg font-medium">Spaces by Muskan · Studio Admin</h1>
          </div>

          <form
            onSubmit={handleLoginSubmit}
            className="bg-white border border-[#C3C4C7] p-6 space-y-4 shadow-xs"
          >
            {loginError && (
              <div className="p-2.5 bg-[#FCF0F1] border-l-4 border-[#D63638] text-xs text-[#8A2424]">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[#1D2327] mb-1">
                Studio Admin Passcode
              </label>
              <input
                type="password"
                required
                value={loginPasscode}
                onChange={(e) => setLoginPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full px-3 py-2 text-sm border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer"
            >
              Log In to Studio Backend
            </button>
          </form>

          <div className="text-center">
            <Link to="/" className="text-xs text-[#50575E] hover:text-[#2271B1]">
              &larr; Back to Spaces by Muskan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const projects = store?.projects || [];
  const enquiries = store?.enquiries || [];
  const services = store?.services || [];
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
        <div className="flex items-center gap-3">
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
            <span className="font-semibold">{store?.siteConfig.name || 'Spaces by Muskan'}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>

          <button
            type="button"
            onClick={() => handleSelectTab('enquiries')}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 hover:bg-[#2C3338] hover:text-[#72AEE6] transition-colors cursor-pointer whitespace-nowrap"
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
            className="hidden sm:flex items-center gap-1 px-2 py-1 hover:bg-[#2C3338] hover:text-[#72AEE6] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void loadAdminData()}
            title="Refresh Store Data"
            className="p-1 text-[#C3C4C7] hover:text-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="hidden sm:inline text-[#C3C4C7]">
              Howdy, <strong className="text-white font-medium">{store?.siteConfig.founder || 'Muskan Agarwal'}</strong>
            </span>
            {store?.siteConfig.logoEmblem && (
              <img
                src={store.siteConfig.logoEmblem}
                alt="Admin Avatar"
                className="w-5 h-5 rounded-full object-cover border border-white/20"
              />
            )}
          </div>
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

            <div className="pt-4 mt-4 border-t border-[#2C3338] px-3">
              <Link
                to="/"
                className="w-full py-2 px-2.5 bg-[#2C3338] hover:bg-[#2271B1] text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
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
            {/* WordPress Dismissible Screen Notice */}
            {notice && (
              <div
                className={`bg-white border border-[#C3C4C7] border-l-4 px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs ${
                  notice.type === 'success' ? 'border-l-[#00A32A]' : 'border-l-[#D63638]'
                }`}
              >
                <span className="text-[#1D2327] font-medium">{notice.text}</span>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="text-[#646970] hover:text-[#1D2327] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {loading || !store ? (
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
                          Manage portfolio projects like a WooCommerce catalogue, upload 4K room photos to the Media Library, edit headlines and Vastu service copy, update your phone/WhatsApp/email details, and review incoming client enquiries.
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
                        <Link
                          to="/"
                          className="w-full py-2 px-3 bg-[#1D2327] hover:bg-[#2271B1] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview Public Storefront</span>
                        </Link>
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
                            <span className="font-mono text-[#1D2327]">{store.siteConfig.phone}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                            <span className="text-[#646970]">WhatsApp Line</span>
                            <span className="font-mono text-[#1D2327]">{store.siteConfig.whatsappNumber}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                            <span className="text-[#646970]">Studio Email</span>
                            <span className="font-mono text-[#1D2327]">{store.siteConfig.email}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-[#646970]">Instagram</span>
                            <span className="font-mono text-[#2271B1]">{store.siteConfig.instagramHandle}</span>
                          </div>
                        </div>
                      </div>

                      {storageStats && (
                        <div className="lg:col-span-12 bg-white border border-[#C3C4C7]">
                          <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <HardDrive className="w-4 h-4 text-[#2271B1]" />
                              <h3 className="text-xs font-semibold text-[#1D2327]">
                                Local Media Storage &amp; 4K WebP Pipeline Capacity
                              </h3>
                            </div>
                            <span className="text-[11px] font-mono text-[#1E6B2F]">
                              Local Disk Active (No External Image Host Required)
                            </span>
                          </div>
                          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div className="p-3 border border-[#DCDCDE] bg-[#FBFBFB]">
                              <span className="text-[10px] uppercase tracking-wider text-[#646970] block">
                                Stored Originals
                              </span>
                              <span className="text-lg font-mono font-semibold text-[#1D2327] tabular-nums">
                                {storageStats.totalSourceImages} files
                              </span>
                              <span className="text-[11px] text-[#646970] block mt-0.5">
                                {storageStats.archiveCount} Archive · {storageStats.uploadsCount} Uploaded
                              </span>
                            </div>

                            <div className="p-3 border border-[#DCDCDE] bg-[#FBFBFB]">
                              <span className="text-[10px] uppercase tracking-wider text-[#646970] block">
                                Multi-Size WebP Variants
                              </span>
                              <span className="text-lg font-mono font-semibold text-[#2271B1] tabular-nums">
                                {storageStats.totalWebpVariants} WebPs
                              </span>
                              <span className="text-[11px] text-[#646970] block mt-0.5">
                                480w · 960w · 1440w · 2160w (4K)
                              </span>
                            </div>

                            <div className="p-3 border border-[#DCDCDE] bg-[#FBFBFB]">
                              <span className="text-[10px] uppercase tracking-wider text-[#646970] block">
                                Space Used
                              </span>
                              <span className="text-lg font-mono font-semibold text-[#1D2327] tabular-nums">
                                {(storageStats.usedBytes / (1024 * 1024)).toFixed(1)} MB
                              </span>
                              <span className="text-[11px] text-[#646970] block mt-0.5">
                                Up to {storageStats.maxUploadMb} MB per photo upload
                              </span>
                            </div>

                            <div className="p-3 border border-[#DCDCDE] bg-[#FBFBFB]">
                              <span className="text-[10px] uppercase tracking-wider text-[#646970] block">
                                Server Disk Available
                              </span>
                              <span className="text-lg font-mono font-semibold text-[#1E6B2F] tabular-nums">
                                {(storageStats.freeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB
                              </span>
                              <span className="text-[11px] text-[#646970] block mt-0.5">
                                Local <span className="font-mono">public/uploads/</span> disk
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* REAL-TIME VISUAL BRANDING STUDIO PANEL */}
                    <AdminVisualBrandingPanel
                      siteConfig={store.siteConfig}
                      onSaveSite={handleSaveSite}
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
                                      <img
                                        src={project.heroImage}
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
                          Stored locally in <span className="font-mono text-[#1D2327]">public/assets/muskan/</span> &amp;{' '}
                          <span className="font-mono text-[#1D2327]">public/uploads/</span>:{' '}
                          <strong className="text-[#1D2327]">
                            {(storageStats.usedBytes / (1024 * 1024)).toFixed(1)} MB
                          </strong>{' '}
                          across {storageStats.totalSourceImages} source photos &amp; {storageStats.totalWebpVariants} WebP sizes.
                        </span>
                        <span className="font-mono text-[#1E6B2F]">
                          {(storageStats.freeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB free · Max {storageStats.maxUploadMb} MB/photo
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
                              label: `Uploaded (${media.filter((m) => m.source === 'uploads').length})`,
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
                            <img
                              src={item.url}
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
                                {item.source === 'uploads' ? 'Uploaded' : '4K Archive'} · {(item.sizeBytes / 1024).toFixed(0)} KB
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
                  />
                )}

                {/* ================= 6. PAGES, LAYOUT ORDER, STYLE & SITE COPY EDITOR ================= */}
                {activeTab === 'site' && (
                  <AdminSiteEditor
                    siteConfig={store.siteConfig}
                    media={media}
                    onSaveSite={handleSaveSite}
                    onUploadFile={handleUploadFile}
                    onDeleteMedia={handleDeleteMediaItem}
                  />
                )}

                {/* ================= 7. DESIGN PROCESS & 2D/3D COMPARISON EDITOR ================= */}
                {activeTab === 'process' && (
                  <AdminProcessEditor
                    processSteps={store.processSteps}
                    comparisonCases={store.comparisonCases}
                    media={media}
                    onSaveProcess={handleSaveProcess}
                    onUploadFile={handleUploadFile}
                    onDeleteMedia={handleDeleteMediaItem}
                  />
                )}

                {/* ================= 8. PROMOTIONS, POPUP ADS & MOVING TICKER ================= */}
                {activeTab === 'promotions' && (
                  <AdminPromotionsEditor
                    siteConfig={store.siteConfig}
                    services={services}
                    media={media}
                    onSaveSite={handleSaveSite}
                    onUploadFile={handleUploadFile}
                    onDeleteMedia={handleDeleteMediaItem}
                  />
                )}

                {/* ================= 8. SETTINGS & PASSCODE ================= */}
                {activeTab === 'settings' && (
                  <div className="space-y-5 max-w-3xl">
                    <h1 className="text-xl font-normal text-[#1D2327]">General &amp; Security Settings</h1>

                    {/* Security Lock Card */}
                    <div className="bg-white border border-[#C3C4C7]">
                      <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex items-center justify-between">
                        <h2 className="text-xs font-semibold text-[#1D2327]">
                          Admin Access Protection
                        </h2>
                        <span
                          className={`text-[11px] font-mono ${
                            passcodeEnabled ? 'text-[#1E6B2F]' : 'text-[#646970]'
                          }`}
                        >
                          {passcodeEnabled ? 'Passcode Enabled' : 'Open Studio Workspace'}
                        </span>
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <p className="text-[#50575E] leading-relaxed">
                          Add an optional Studio Passcode so only authorized team members can open <span className="font-mono">/wp-admin</span> and edit portfolio items or view client enquiries.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="password"
                            value={newPasscode}
                            onChange={(e) => setNewPasscode(e.target.value)}
                            placeholder="New passcode (min 4 characters)"
                            className="px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none w-64"
                          />
                          <button
                            type="button"
                            onClick={() => void handlePasscodeConfig(true)}
                            className="px-3.5 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white font-semibold cursor-pointer"
                          >
                            {passcodeEnabled ? 'Update Passcode' : 'Enable Passcode Lock'}
                          </button>
                          {passcodeEnabled && (
                            <button
                              type="button"
                              onClick={() => void handlePasscodeConfig(false)}
                              className="px-3 py-1.5 bg-white border border-[#C3C4C7] hover:border-[#D63638] text-[#B32D2E] cursor-pointer"
                            >
                              Disable Lock
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
                          Reset all text copy, services, process stages, and default 6 portfolio projects back to the initial Spaces by Muskan release state. Client enquiries and uploaded images remain intact.
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
