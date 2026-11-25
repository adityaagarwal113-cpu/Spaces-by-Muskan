import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Plus,
  Save,
  Star,
  Trash2,
} from 'lucide-react';
import { MediaItem, ProjectCategory, ProjectDetail } from '../../types';
import { MediaPickerModal } from './MediaPickerModal';
import { ResolvedImg } from '../OptimizedImage';

interface ProjectEditorProps {
  project: ProjectDetail | null;
  isNew: boolean;
  media: MediaItem[];
  onSave: (data: ProjectDetail, isNew: boolean) => Promise<void>;
  onCancel: () => void;
  onUploadFile: (file: File) => Promise<MediaItem | null>;
  onDeleteMedia?: (item: MediaItem) => Promise<void>;
  onDraftChange?: (draft: ProjectDetail, isNew: boolean) => void;
}

const CATEGORY_OPTIONS: { value: ProjectCategory; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'bedrooms', label: 'Bedrooms' },
  { value: 'kitchens', label: 'Kitchens' },
  { value: 'bathrooms', label: 'Bathrooms' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'detailing', label: 'Detailing & Joinery' },
];

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  isNew,
  media,
  onSave,
  onCancel,
  onUploadFile,
  onDeleteMedia,
  onDraftChange,
}) => {
  const [form, setForm] = useState<ProjectDetail>(
    project || {
      id: '',
      sku: `SM-PRJ-${Math.floor(100 + Math.random() * 899)}`,
      title: '',
      category: 'Residential Interior',
      categorySlug: 'residential',
      secondaryCategories: [],
      location: 'Residential Commission',
      heroImage: media[0]?.url || '/assets/muskan/bedroom-butterfly.jpg',
      galleryImages: [media[0]?.url || '/assets/muskan/bedroom-butterfly.jpg'],
      scope: ['3D Concept & V-Ray Rendering', 'Bespoke Joinery'],
      materials: ['Fluted Veneer', 'Warm 3000K LED Cove'],
      dimensions: '',
      description: '',
      architecturalNotes: '',
      hasTechnicalDrawing: true,
      status: 'published',
      featured: false,
      availability: 'Open for Commission',
      estimateLabel: 'Bespoke Quote',
    }
  );

  const [scopeInput, setScopeInput] = useState(form.scope.join(', '));
  const [materialsInput, setMaterialsInput] = useState(form.materials.join(', '));
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'hero' | 'gallery' | null>(null);
  const [dragGalleryIdx, setDragGalleryIdx] = useState<number | null>(null);
  const [dragOverGalleryIdx, setDragOverGalleryIdx] = useState<number | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!onDraftChange) return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onDraftChange(
      {
        ...form,
        scope: scopeInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        materials: materialsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      },
      isNew
    );
  }, [form, scopeInput, materialsInput, isNew, onDraftChange]);

  const toggleSecondaryCategory = (slug: ProjectCategory) => {
    const current = form.secondaryCategories || [];
    const next = current.includes(slug)
      ? current.filter((c) => c !== slug)
      : [...current, slug];
    setForm((prev) => ({ ...prev, secondaryCategories: next }));
  };

  const handleRemoveGalleryImg = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== idx),
    }));
  };

  const handleReorderGallery = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || toIdx < 0 || toIdx >= form.galleryImages.length) return;
    setForm((prev) => {
      const next = [...prev.galleryImages];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return { ...prev, galleryImages: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: ProjectDetail = {
        ...form,
        scope: scopeInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        materials: materialsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await onSave(payload, isNew);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C3C4C7] hover:border-[#2271B1] text-xs font-medium text-[#2271B1] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Projects</span>
          </button>
          <h1 className="text-xl font-normal text-[#1D2327]">
            {isNew ? 'Add New Portfolio Project' : `Edit Project: ${form.title}`}
          </h1>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : isNew ? 'Publish Project' : 'Update Project'}</span>
        </button>
      </div>

      {/* WordPress / WooCommerce 2-Column Metabox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Left Column (Title, Description, Architectural Notes, Gallery) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Title Box */}
          <div className="bg-white border border-[#C3C4C7] p-4 space-y-3">
            <label className="block text-xs font-semibold text-[#1D2327]">
              Project Name / Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Butterfly Sculpted Master Suite"
              className="w-full px-3 py-2 text-lg border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none text-[#1D2327]"
            />
            {!isNew && (
              <p className="text-[11px] text-[#646970]">
                Permalink:{' '}
                <span className="font-mono text-[#2271B1]">/projects/{form.id}</span>
              </p>
            )}
          </div>

          {/* Description & Editorial Copy Metabox */}
          <div className="bg-white border border-[#C3C4C7]">
            <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
              <h2 className="text-xs font-semibold text-[#1D2327]">
                Project Narrative &amp; Design Concept
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1D2327] mb-1">
                  Primary Description (Displayed on Portfolio Cards &amp; Case Study)
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the interior layout, focal elements, lighting layers, and bespoke joinery..."
                  className="w-full px-3 py-2 text-xs border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none text-[#1D2327]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D2327] mb-1">
                  Architectural &amp; Vastu Notes (Optional Technical Insight)
                </label>
                <textarea
                  rows={3}
                  value={form.architecturalNotes || ''}
                  onChange={(e) => setForm({ ...form, architecturalNotes: e.target.value })}
                  placeholder="Notes on Vastu alignment, concealed lighting channels, or carpentry specs..."
                  className="w-full px-3 py-2 text-xs border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none text-[#1D2327]"
                />
              </div>
            </div>
          </div>

          {/* WooCommerce-Style Project Specifications Metabox */}
          <div className="bg-white border border-[#C3C4C7]">
            <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#7F54B3]" />
                <h2 className="text-xs font-semibold text-[#1D2327]">
                  Project Data — Studio Specifications &amp; Catalogue Meta
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#646970]">SKU: {form.sku || 'Auto'}</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#1D2327] mb-1">
                  Project Reference / SKU
                </label>
                <input
                  type="text"
                  value={form.sku || ''}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="SM-RES-001"
                  className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1D2327] mb-1">
                  Display Category Label
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Residential Interior"
                  className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1D2327] mb-1">
                  Location / Commission Subtitle
                </label>
                <input
                  type="text"
                  value={form.location || ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Residential Commission"
                  className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1D2327] mb-1">
                  Room Dimensions (Optional)
                </label>
                <input
                  type="text"
                  value={form.dimensions || ''}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  placeholder={`16' 0" × 14' 6"`}
                  className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1D2327] mb-1">
                  Package / Estimate Label
                </label>
                <input
                  type="text"
                  value={form.estimateLabel || ''}
                  onChange={(e) => setForm({ ...form, estimateLabel: e.target.value })}
                  placeholder="Custom Bespoke Suite"
                  className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1D2327] mb-1">
                  Booking / Commission Availability
                </label>
                <select
                  value={form.availability || 'Open for Commission'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      availability: e.target.value as ProjectDetail['availability'],
                    })
                  }
                  className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none bg-white"
                >
                  <option value="Open for Commission">Open for Commission</option>
                  <option value="Turnkey Available">Turnkey Available</option>
                  <option value="Design Package">Design Package</option>
                  <option value="Archive Reference">Archive Reference</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-[#1D2327] mb-1">
                  Materials Palette (Comma separated)
                </label>
                <input
                  type="text"
                  value={materialsInput}
                  onChange={(e) => setMaterialsInput(e.target.value)}
                  placeholder="Chevron Walnut Veneer, Vertical Fluted Fabric, Brushed Brass Inlays"
                  className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-[#1D2327] mb-1">
                  Deliverables / Scope Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={scopeInput}
                  onChange={(e) => setScopeInput(e.target.value)}
                  placeholder="3D Concept & V-Ray Rendering, Custom Bedhead Wall, Tray Cove Lighting"
                  className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.hasTechnicalDrawing)}
                    onChange={(e) =>
                      setForm({ ...form, hasTechnicalDrawing: e.target.checked })
                    }
                    className="accent-[#2271B1]"
                  />
                  <span className="text-xs text-[#1D2327]">
                    Show &ldquo;2D CAD &amp; 3D Visualization Notes&rdquo; section on Case Study page
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Metaboxes (Publish, Categories, Hero Image, Product Gallery) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Publish Metabox */}
          <div className="bg-white border border-[#C3C4C7]">
            <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
              <h2 className="text-xs font-semibold text-[#1D2327]">Publish</h2>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[#50575E] mb-1">Visibility Status:</label>
                <select
                  value={form.status || 'published'}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as 'published' | 'draft' })
                  }
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
                >
                  <option value="published">Published (Visible on Site)</option>
                  <option value="draft">Draft (Hidden from Public)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="accent-[#7F54B3]"
                />
                <Star className="w-3.5 h-3.5 text-[#7F54B3]" />
                <span className="text-[#1D2327]">Featured in Homepage Signature Showcase</span>
              </label>
            </div>
            <div className="px-4 py-3 bg-[#F6F7F7] border-t border-[#C3C4C7] flex items-center justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-[#B32D2E] hover:underline cursor-pointer"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving...' : isNew ? 'Publish' : 'Update'}
              </button>
            </div>
          </div>

          {/* Project Categories Metabox */}
          <div className="bg-white border border-[#C3C4C7]">
            <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
              <h2 className="text-xs font-semibold text-[#1D2327]">Portfolio Categories</h2>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#1D2327] mb-1">
                  Primary Filter Category
                </label>
                <select
                  value={form.categorySlug}
                  onChange={(e) =>
                    setForm({ ...form, categorySlug: e.target.value as ProjectCategory })
                  }
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block font-medium text-[#1D2327] mb-1.5">
                  Additional Filter Tags
                </span>
                <div className="space-y-1.5">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const checked = (form.secondaryCategories || []).includes(cat.value);
                    return (
                      <label
                        key={cat.value}
                        className="flex items-center gap-2 text-[#50575E] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSecondaryCategory(cat.value)}
                          className="accent-[#2271B1]"
                        />
                        <span>{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Featured / Hero Image Metabox */}
          <div className="bg-white border border-[#C3C4C7]">
            <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
              <h2 className="text-xs font-semibold text-[#1D2327]">
                Project Main Image (Featured)
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="aspect-[4/3] bg-[#F0F0F1] border border-[#DCDCDE] overflow-hidden">
                {form.heroImage ? (
                  <ResolvedImg
                    src={form.heroImage}
                    alt={form.title || 'Project Preview'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#646970]">
                    No image chosen
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerTarget('hero')}
                  className="flex-1 py-1.5 border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{form.heroImage ? 'Change Image' : 'Set Featured Image'}</span>
                </button>
                {form.heroImage && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, heroImage: '' }))}
                    className="px-2.5 py-1.5 border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] text-xs font-medium flex items-center gap-1 cursor-pointer"
                    title="Remove featured image from project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* WooCommerce-Style Product Gallery Metabox */}
          <div className="bg-white border border-[#C3C4C7]">
            <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold text-[#1D2327]">
                Project Gallery Images ({form.galleryImages.length})
              </h2>
              <span className="text-[10px] font-mono text-[#646970]">Drag to reorder</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {form.galleryImages.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    draggable
                    onDragStart={(e) => {
                      if ((e.target as HTMLElement).closest('button')) {
                        e.preventDefault();
                        return;
                      }
                      setDragGalleryIdx(idx);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(idx));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverGalleryIdx !== idx) setDragOverGalleryIdx(idx);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragGalleryIdx !== null && dragGalleryIdx !== idx) {
                        handleReorderGallery(dragGalleryIdx, idx);
                      }
                      setDragGalleryIdx(null);
                      setDragOverGalleryIdx(null);
                    }}
                    onDragEnd={() => {
                      setDragGalleryIdx(null);
                      setDragOverGalleryIdx(null);
                    }}
                    className={`relative aspect-square border bg-[#F0F0F1] group overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                      dragGalleryIdx === idx
                        ? 'opacity-40 border-[#2271B1]'
                        : dragOverGalleryIdx === idx
                        ? 'border-[#2271B1] ring-2 ring-[#2271B1] scale-[1.03]'
                        : 'border-[#DCDCDE]'
                    }`}
                  >
                    <ResolvedImg
                      src={imgUrl}
                      preferThumb
                      alt=""
                      className="w-full h-full object-cover pointer-events-none"
                    />

                    {/* Top-left Drag Handle + Slot Number */}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#1D2327]/80 text-white text-[10px] font-mono flex items-center gap-0.5">
                      <GripVertical className="w-2.5 h-2.5" />
                      <span>#{idx + 1}</span>
                    </div>

                    {/* Top-right Actions */}
                    <div className="absolute top-1 right-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, heroImage: imgUrl }))}
                        className={`w-5 h-5 flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
                          form.heroImage === imgUrl
                            ? 'bg-[#7F54B3] text-white'
                            : 'bg-white/90 text-[#50575E] hover:text-[#7F54B3]'
                        }`}
                        title={
                          form.heroImage === imgUrl
                            ? 'Current Main Hero Image'
                            : 'Set as Main Hero Image'
                        }
                      >
                        <Star className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImg(idx)}
                        className="w-5 h-5 bg-[#D63638]/90 hover:bg-[#D63638] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                        aria-label="Remove gallery image"
                        title="Delete gallery image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom Left/Right Nudge Controls */}
                    {form.galleryImages.length > 1 && (
                      <div className="absolute bottom-1 inset-x-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleReorderGallery(idx, idx - 1)}
                          className="w-5 h-5 bg-white/90 text-[#1D2327] disabled:opacity-30 flex items-center justify-center shadow-xs cursor-pointer"
                          title="Move Earlier"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === form.galleryImages.length - 1}
                          onClick={() => handleReorderGallery(idx, idx + 1)}
                          className="w-5 h-5 bg-white/90 text-[#1D2327] disabled:opacity-30 flex items-center justify-center shadow-xs cursor-pointer"
                          title="Move Later"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPickerTarget('gallery')}
                className="inline-flex items-center gap-1.5 text-xs text-[#2271B1] hover:underline font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add project gallery image</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        media={media}
        selectedUrl={pickerTarget === 'hero' ? form.heroImage : undefined}
        title={
          pickerTarget === 'hero'
            ? 'Select Project Main Image'
            : 'Add Image to Project Gallery'
        }
        onUploadFile={onUploadFile}
        onDeleteMedia={onDeleteMedia}
        onClearSelection={
          pickerTarget === 'hero'
            ? () => setForm((prev) => ({ ...prev, heroImage: '' }))
            : undefined
        }
        onSelect={(url) => {
          if (pickerTarget === 'hero') {
            setForm((prev) => ({
              ...prev,
              heroImage: url,
              galleryImages: prev.galleryImages.includes(url)
                ? prev.galleryImages
                : [url, ...prev.galleryImages],
            }));
          } else if (pickerTarget === 'gallery') {
            setForm((prev) => ({
              ...prev,
              galleryImages: [...prev.galleryImages, url],
            }));
          }
        }}
      />
    </form>
  );
};
