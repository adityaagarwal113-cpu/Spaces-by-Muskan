import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  LayoutList,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import {
  DEFAULT_BRAND_ASSETS,
  DEFAULT_COMPARISON_CASES,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_SITE_CONFIG,
} from '../../data/defaultCmsData';
import {
  AccentThemePreset,
  DrawingComparisonCase,
  HomepageSectionConfig,
  MediaItem,
  ProcessStep,
  ServiceItem,
  StudioSiteConfig,
} from '../../types';
import { MediaPickerModal } from './MediaPickerModal';

interface AdminSiteEditorProps {
  siteConfig: StudioSiteConfig;
  media: MediaItem[];
  onSaveSite: (nextConfig: StudioSiteConfig) => Promise<void>;
  onUploadFile: (file: File) => Promise<MediaItem | null>;
  onDeleteMedia?: (item: MediaItem) => Promise<void>;
}

type ImageFieldKey =
  | 'logoEmblem'
  | 'heroPrimaryImage'
  | 'heroSecondaryImage'
  | 'heroTertiaryImage'
  | 'studioIntroImage'
  | 'founderPortrait'
  | 'founderStudioLaptop'
  | 'founderSiteVisit'
  | 'awardPlaque'
  | 'finalCtaImage';

type SitePickerTarget =
  | { kind: 'site'; key: ImageFieldKey }
  | { kind: 'customSection'; sectionId: string };

const ACCENT_THEME_OPTIONS: {
  id: AccentThemePreset;
  label: string;
  swatch: string;
  hint: string;
}[] = [
  {
    id: 'terracotta',
    label: 'Burnt Terracotta',
    swatch: '#8E4A36',
    hint: 'Signature warm architectural clay',
  },
  {
    id: 'brass',
    label: 'Aged Brass',
    swatch: '#9A7B4F',
    hint: 'Muted luxury bronze & champagne',
  },
  {
    id: 'sage',
    label: 'Botanical Sage',
    swatch: '#4E6655',
    hint: 'Calm Vastu botanical olive',
  },
  {
    id: 'espresso',
    label: 'Deep Espresso',
    swatch: '#2E2622',
    hint: 'Monochrome editorial charcoal',
  },
];

export const AdminSiteEditor: React.FC<AdminSiteEditorProps> = ({
  siteConfig,
  media,
  onSaveSite,
  onUploadFile,
  onDeleteMedia,
}) => {
  const [form, setForm] = useState<StudioSiteConfig>(siteConfig);
  const [saving, setSaving] = useState(false);
  const [activePicker, setActivePicker] = useState<SitePickerTarget | null>(null);
  const [dragSecIdx, setDragSecIdx] = useState<number | null>(null);
  const [dragOverSecIdx, setDragOverSecIdx] = useState<number | null>(null);

  useEffect(() => {
    setForm({
      ...DEFAULT_SITE_CONFIG,
      ...siteConfig,
      navLabels: {
        ...DEFAULT_SITE_CONFIG.navLabels!,
        ...(siteConfig.navLabels || {}),
      },
      homepageSections:
        Array.isArray(siteConfig.homepageSections) && siteConfig.homepageSections.length > 0
          ? siteConfig.homepageSections
          : DEFAULT_HOMEPAGE_SECTIONS,
    });
  }, [siteConfig]);

  const sections =
    Array.isArray(form.homepageSections) && form.homepageSections.length > 0
      ? form.homepageSections
      : DEFAULT_HOMEPAGE_SECTIONS;

  const navLabels = form.navLabels || DEFAULT_SITE_CONFIG.navLabels!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSite({
        ...form,
        homepageSections: sections,
        navLabels,
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSections = (updater: (prev: HomepageSectionConfig[]) => HomepageSectionConfig[]) => {
    setForm((prev) => {
      const current =
        Array.isArray(prev.homepageSections) && prev.homepageSections.length > 0
          ? prev.homepageSections
          : DEFAULT_HOMEPAGE_SECTIONS;
      return { ...prev, homepageSections: updater(current) };
    });
  };

  const handleMoveSection = (idx: number, dir: -1 | 1) => {
    updateSections((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const handleAddCustomSection = () => {
    const newSec: HomepageSectionConfig = {
      id: `sec-custom-${Date.now()}`,
      type: 'custom',
      label: 'Custom Editorial Block',
      visible: true,
      customEyebrow: 'Studio Feature',
      customHeadline: 'Crafted Detail & Bespoke Execution',
      customBody:
        'Describe a seasonal interior highlight, turnkey package, Vastu room note, or custom architectural callout here.',
      customCtaLabel: 'Request Details',
      customCtaOpensEnquiry: true,
      customCtaLink: '/contact',
      customImage: media[0]?.url || DEFAULT_BRAND_ASSETS.livingEclipse,
      customTheme: 'linen',
    };
    updateSections((prev) => [...prev, newSec]);
  };

  const renderImageSlot = (label: string, key: ImageFieldKey) => {
    const currentVal = form[key];
    return (
      <div className="border border-[#DCDCDE] p-3 bg-[#F6F7F7] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#1D2327]">{label}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActivePicker({ kind: 'site', key })}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] text-[11px] font-medium cursor-pointer"
            >
              <ImageIcon className="w-3 h-3" />
              <span>{currentVal ? 'Change' : 'Select'}</span>
            </button>
            {currentVal && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, [key]: '' }))}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] text-[11px] font-medium cursor-pointer"
                title={`Remove ${label}`}
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentVal ? (
            <img
              src={currentVal}
              alt={label}
              className="w-16 h-16 object-cover border border-[#C3C4C7] bg-white shrink-0"
            />
          ) : (
            <div className="w-16 h-16 border border-dashed border-[#8C8F94] bg-white flex items-center justify-center text-[10px] text-[#646970] shrink-0 text-center px-1">
              Removed
            </div>
          )}
          <span className="text-[11px] font-mono text-[#646970] break-all">
            {currentVal || 'No image assigned (hidden cleanly on site)'}
          </span>
        </div>
      </div>
    );
  };

  const pickerSelectedUrl =
    activePicker?.kind === 'site'
      ? form[activePicker.key]
      : activePicker?.kind === 'customSection'
      ? sections.find((s) => s.id === activePicker.sectionId)?.customImage
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-normal text-[#1D2327]">
            Pages, Layout Builder, Style &amp; Studio Images
          </h1>
          <p className="text-xs text-[#646970] mt-0.5">
            Rearrange homepage sections, add custom blocks, switch site accent palette, and edit every headline, photo, and contact link.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving Changes...' : 'Save All Text, Layout & Style'}</span>
        </button>
      </div>

      {/* 00. HOMEPAGE SECTION ORDER, VISIBILITY & CUSTOM SECTIONS */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutList className="w-4 h-4 text-[#2271B1]" />
            <h2 className="text-xs font-semibold text-[#1D2327]">
              00. Homepage Layout Order, Show/Hide &amp; Custom Editorial Sections
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateSections(() => DEFAULT_HOMEPAGE_SECTIONS)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#C3C4C7] hover:border-[#2271B1] text-[#50575E] text-[11px] cursor-pointer"
              title="Restore default section order"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Order</span>
            </button>
            <button
              type="button"
              onClick={handleAddCustomSection}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#2271B1] hover:text-white text-[11px] font-medium cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Custom Section</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <p className="text-[#646970]">
            Drag and drop any section row using its grip handle (or use Up / Down arrows) to rearrange the live homepage order, toggle visibility, or add bespoke custom blocks.
          </p>

          <div className="space-y-2.5">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                draggable
                onDragStart={(e) => {
                  if ((e.target as HTMLElement).closest('input, textarea, select, button, a')) {
                    e.preventDefault();
                    return;
                  }
                  setDragSecIdx(idx);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', String(idx));
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverSecIdx !== idx) setDragOverSecIdx(idx);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragSecIdx !== null && dragSecIdx !== idx) {
                    updateSections((prev) => {
                      const next = [...prev];
                      const [moved] = next.splice(dragSecIdx, 1);
                      next.splice(idx, 0, moved);
                      return next;
                    });
                  }
                  setDragSecIdx(null);
                  setDragOverSecIdx(null);
                }}
                onDragEnd={() => {
                  setDragSecIdx(null);
                  setDragOverSecIdx(null);
                }}
                className={`border transition-all ${
                  dragSecIdx === idx
                    ? 'opacity-45 border-[#2271B1]'
                    : dragOverSecIdx === idx
                    ? 'border-[#2271B1] bg-[#F0F6FC] ring-2 ring-[#2271B1]/25'
                    : sec.visible
                    ? 'border-[#C3C4C7] bg-white'
                    : 'border-[#DCDCDE] bg-[#F6F7F7] opacity-75'
                }`}
              >
                <div className="p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-[220px]">
                    <span
                      className="text-[#8C8F94] hover:text-[#2271B1] cursor-grab active:cursor-grabbing p-1 -ml-1 shrink-0"
                      title="Drag to reorder section"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
                    <span className="font-mono text-[11px] text-[#646970] w-6 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <input
                      type="text"
                      value={sec.label}
                      onChange={(e) =>
                        updateSections((prev) =>
                          prev.map((s) =>
                            s.id === sec.id ? { ...s, label: e.target.value } : s
                          )
                        )
                      }
                      className="px-2.5 py-1 border border-[#DCDCDE] focus:border-[#2271B1] focus:outline-none font-medium text-[#1D2327] flex-1 max-w-xs"
                    />
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#F0F0F1] text-[#50575E] border border-[#DCDCDE]">
                      {sec.type === 'custom' ? 'Custom Block' : sec.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSections((prev) =>
                          prev.map((s) =>
                            s.id === sec.id ? { ...s, visible: !s.visible } : s
                          )
                        )
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 border text-[11px] font-medium cursor-pointer ${
                        sec.visible
                          ? 'bg-[#EDFAEF] border-[#68DE7C] text-[#1E6B2F]'
                          : 'bg-white border-[#C3C4C7] text-[#646970]'
                      }`}
                    >
                      {sec.visible ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSection(idx, -1)}
                      className="p-1.5 border border-[#C3C4C7] disabled:opacity-30 hover:border-[#2271B1] cursor-pointer"
                      title="Move Section Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => handleMoveSection(idx, 1)}
                      className="p-1.5 border border-[#C3C4C7] disabled:opacity-30 hover:border-[#2271B1] cursor-pointer"
                      title="Move Section Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {sec.type === 'custom' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateSections((prev) => prev.filter((s) => s.id !== sec.id))
                        }
                        className="p-1.5 border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] cursor-pointer"
                        title="Delete Custom Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Editorial Section Inline Builder */}
                {sec.type === 'custom' && (
                  <div className="p-4 border-t border-[#DCDCDE] bg-[#F9F9F9] grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-4 space-y-2">
                      <label className="block font-medium text-[#1D2327]">
                        Section Photo (Optional)
                      </label>
                      <div className="aspect-[4/3] bg-white border border-[#C3C4C7] overflow-hidden flex items-center justify-center">
                        {sec.customImage ? (
                          <img
                            src={sec.customImage}
                            alt={sec.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[11px] text-[#646970]">No image</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setActivePicker({ kind: 'customSection', sectionId: sec.id })
                          }
                          className="flex-1 py-1 px-2.5 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] font-medium cursor-pointer"
                        >
                          {sec.customImage ? 'Change Photo' : 'Select Photo'}
                        </button>
                        {sec.customImage && (
                          <button
                            type="button"
                            onClick={() =>
                              updateSections((prev) =>
                                prev.map((s) =>
                                  s.id === sec.id ? { ...s, customImage: '' } : s
                                )
                              )
                            }
                            className="px-2 py-1 bg-white border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-[#1D2327] mb-1">Eyebrow</label>
                        <input
                          type="text"
                          value={sec.customEyebrow || ''}
                          onChange={(e) =>
                            updateSections((prev) =>
                              prev.map((s) =>
                                s.id === sec.id ? { ...s, customEyebrow: e.target.value } : s
                              )
                            )
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#1D2327] mb-1">Surface Theme</label>
                        <select
                          value={sec.customTheme || 'linen'}
                          onChange={(e) =>
                            updateSections((prev) =>
                              prev.map((s) =>
                                s.id === sec.id
                                  ? {
                                      ...s,
                                      customTheme: e.target.value as HomepageSectionConfig['customTheme'],
                                    }
                                  : s
                              )
                            )
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                        >
                          <option value="light">Crisp Limestone Paper (#FBF9F6)</option>
                          <option value="linen">Warm Canvas Linen (#F6F3EE)</option>
                          <option value="dark">Deep Charcoal Editorial (#181615)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-medium text-[#1D2327] mb-1">Headline</label>
                        <input
                          type="text"
                          value={sec.customHeadline || ''}
                          onChange={(e) =>
                            updateSections((prev) =>
                              prev.map((s) =>
                                s.id === sec.id ? { ...s, customHeadline: e.target.value } : s
                              )
                            )
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-medium text-[#1D2327] mb-1">Body Copy</label>
                        <textarea
                          rows={2}
                          value={sec.customBody || ''}
                          onChange={(e) =>
                            updateSections((prev) =>
                              prev.map((s) =>
                                s.id === sec.id ? { ...s, customBody: e.target.value } : s
                              )
                            )
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#1D2327] mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={sec.customCtaLabel || ''}
                          onChange={(e) =>
                            updateSections((prev) =>
                              prev.map((s) =>
                                s.id === sec.id ? { ...s, customCtaLabel: e.target.value } : s
                              )
                            )
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#1D2327] mb-1">Button Action</label>
                        <select
                          value={sec.customCtaOpensEnquiry === false ? 'link' : 'enquiry'}
                          onChange={(e) =>
                            updateSections((prev) =>
                              prev.map((s) =>
                                s.id === sec.id
                                  ? { ...s, customCtaOpensEnquiry: e.target.value === 'enquiry' }
                                  : s
                              )
                            )
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                        >
                          <option value="enquiry">Opens Project Enquiry Popup</option>
                          <option value="link">Navigates to URL</option>
                        </select>
                      </div>

                      {sec.customCtaOpensEnquiry === false && (
                        <div className="sm:col-span-2">
                          <label className="block font-medium text-[#1D2327] mb-1">
                            Destination Link
                          </label>
                          <input
                            type="text"
                            value={sec.customCtaLink || '/contact'}
                            onChange={(e) =>
                              updateSections((prev) =>
                                prev.map((s) =>
                                  s.id === sec.id ? { ...s, customCtaLink: e.target.value } : s
                                )
                              )
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] font-mono focus:border-[#2271B1] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 00B. BRAND ACCENT THEME & NAVIGATION LABELS */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#7F54B3]" />
          <h2 className="text-xs font-semibold text-[#1D2327]">
            00B. Visual Style Palette, Header Navigation Labels &amp; Brand Name
          </h2>
        </div>
        <div className="p-4 space-y-5 text-xs">
          <div>
            <label className="block font-medium text-[#1D2327] mb-2">
              Studio Accent Color Style Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ACCENT_THEME_OPTIONS.map((opt) => {
                const selected = (form.accentTheme || 'terracotta') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm({ ...form, accentTheme: opt.id })}
                    className={`p-3 border text-left flex items-start gap-3 cursor-pointer transition-colors ${
                      selected
                        ? 'border-[#2271B1] bg-[#F0F6FC] ring-1 ring-[#2271B1]'
                        : 'border-[#DCDCDE] bg-white hover:border-[#8C8F94]'
                    }`}
                  >
                    <span
                      className="w-6 h-6 shrink-0 border border-black/15 mt-0.5"
                      style={{ backgroundColor: opt.swatch }}
                    />
                    <span>
                      <strong className="block text-[#1D2327]">{opt.label}</strong>
                      <span className="text-[11px] text-[#646970]">{opt.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-[#F0F0F1]">
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Nav: Work</label>
              <input
                type="text"
                value={navLabels.work}
                onChange={(e) =>
                  setForm({ ...form, navLabels: { ...navLabels, work: e.target.value } })
                }
                className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Nav: Services</label>
              <input
                type="text"
                value={navLabels.services}
                onChange={(e) =>
                  setForm({ ...form, navLabels: { ...navLabels, services: e.target.value } })
                }
                className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Nav: About</label>
              <input
                type="text"
                value={navLabels.about}
                onChange={(e) =>
                  setForm({ ...form, navLabels: { ...navLabels, about: e.target.value } })
                }
                className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Nav: Process</label>
              <input
                type="text"
                value={navLabels.process}
                onChange={(e) =>
                  setForm({ ...form, navLabels: { ...navLabels, process: e.target.value } })
                }
                className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Nav: Contact</label>
              <input
                type="text"
                value={navLabels.contact}
                onChange={(e) =>
                  setForm({ ...form, navLabels: { ...navLabels, contact: e.target.value } })
                }
                className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Header CTA</label>
              <input
                type="text"
                value={form.headerCtaLabel || ''}
                onChange={(e) => setForm({ ...form, headerCtaLabel: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F0F0F1]">
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Brand Display Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, shortName: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Secondary Signature Mark</label>
              <input
                type="text"
                value={form.secondaryMark}
                onChange={(e) => setForm({ ...form, secondaryMark: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Studio Discipline Line</label>
              <input
                type="text"
                value={form.discipline}
                onChange={(e) => setForm({ ...form, discipline: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1. Contact & Social Channels Metabox */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
          <h2 className="text-xs font-semibold text-[#1D2327]">
            01. Contact Details, WhatsApp &amp; Social Handles
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98XXXXXXXX"
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">
              WhatsApp Number (with country code)
            </label>
            <input
              type="text"
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              placeholder="9198XXXXXXXX"
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Direct Email</label>
            <input
              type="text"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="hello@spacesbymuskan.com"
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none font-mono"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-medium text-[#1D2327] mb-1">Studio Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Instagram Handle</label>
            <input
              type="text"
              value={form.instagramHandle}
              onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Instagram URL</label>
            <input
              type="text"
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">YouTube URL</label>
            <input
              type="text"
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Hero Text & Layered Photos Metabox */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
          <h2 className="text-xs font-semibold text-[#1D2327]">
            02. Homepage Hero Section — Headlines &amp; Layered Photos
          </h2>
        </div>
        <div className="p-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Hero Eyebrow</label>
              <input
                type="text"
                value={form.heroEyebrow}
                onChange={(e) => setForm({ ...form, heroEyebrow: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Headline Line 1</label>
              <input
                type="text"
                value={form.heroHeadlineLine1}
                onChange={(e) => setForm({ ...form, heroHeadlineLine1: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Headline Line 2 (Italic)</label>
              <input
                type="text"
                value={form.heroHeadlineLine2}
                onChange={(e) => setForm({ ...form, heroHeadlineLine2: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Primary CTA Button</label>
              <input
                type="text"
                value={form.heroPrimaryCta}
                onChange={(e) => setForm({ ...form, heroPrimaryCta: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Secondary CTA Button</label>
              <input
                type="text"
                value={form.heroSecondaryCta}
                onChange={(e) => setForm({ ...form, heroSecondaryCta: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Hero Tagline / Disciplines</label>
              <input
                type="text"
                value={form.heroSubtitle}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Top-Right Card Label</label>
              <input
                type="text"
                value={form.heroSecondaryLabel}
                onChange={(e) => setForm({ ...form, heroSecondaryLabel: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Top-Right Card Title</label>
              <input
                type="text"
                value={form.heroSecondaryTitle}
                onChange={(e) => setForm({ ...form, heroSecondaryTitle: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Bottom-Left Card Title</label>
              <input
                type="text"
                value={form.heroTertiaryTitle}
                onChange={(e) => setForm({ ...form, heroTertiaryTitle: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {renderImageSlot('Primary Hero Photo', 'heroPrimaryImage')}
            {renderImageSlot('Top-Right Overlap Photo', 'heroSecondaryImage')}
            {renderImageSlot('Bottom-Left Overlap Photo', 'heroTertiaryImage')}
          </div>
        </div>
      </div>

      {/* 3. Portfolio, Services, 2D/3D Comparison & Process Section Headings */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
          <h2 className="text-xs font-semibold text-[#1D2327]">
            03. Homepage Section Titles (Work, Services, 2D/3D Comparison &amp; Process)
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Selected Work Eyebrow</label>
            <input
              type="text"
              value={form.workEyebrow || ''}
              onChange={(e) => setForm({ ...form, workEyebrow: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Selected Work Headline</label>
            <input
              type="text"
              value={form.workHeadline || ''}
              onChange={(e) => setForm({ ...form, workHeadline: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Selected Work Subtitle</label>
            <input
              type="text"
              value={form.workSubtitle || ''}
              onChange={(e) => setForm({ ...form, workSubtitle: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Services Eyebrow</label>
            <input
              type="text"
              value={form.servicesEyebrow || ''}
              onChange={(e) => setForm({ ...form, servicesEyebrow: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Services Headline</label>
            <input
              type="text"
              value={form.servicesHeadline || ''}
              onChange={(e) => setForm({ ...form, servicesHeadline: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Services Subtitle</label>
            <input
              type="text"
              value={form.servicesSubtitle || ''}
              onChange={(e) => setForm({ ...form, servicesSubtitle: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[#1D2327] mb-1">2D/3D Comparison Eyebrow</label>
            <input
              type="text"
              value={form.comparisonEyebrow || ''}
              onChange={(e) => setForm({ ...form, comparisonEyebrow: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Comparison Headline Line 1</label>
            <input
              type="text"
              value={form.comparisonHeadline1 || ''}
              onChange={(e) => setForm({ ...form, comparisonHeadline1: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Comparison Headline Line 2</label>
            <input
              type="text"
              value={form.comparisonHeadline2 || ''}
              onChange={(e) => setForm({ ...form, comparisonHeadline2: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Process Eyebrow</label>
            <input
              type="text"
              value={form.processEyebrow || ''}
              onChange={(e) => setForm({ ...form, processEyebrow: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-medium text-[#1D2327] mb-1">Process Section Headline</label>
            <input
              type="text"
              value={form.processHeadline || ''}
              onChange={(e) => setForm({ ...form, processHeadline: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Studio Intro & Founder Story Metabox */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
          <h2 className="text-xs font-semibold text-[#1D2327]">
            04. Studio Introduction &amp; Founder Story
          </h2>
        </div>
        <div className="p-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Studio Intro Headline 1</label>
              <input
                type="text"
                value={form.studioIntroHeadline1}
                onChange={(e) => setForm({ ...form, studioIntroHeadline1: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Studio Intro Headline 2</label>
              <input
                type="text"
                value={form.studioIntroHeadline2}
                onChange={(e) => setForm({ ...form, studioIntroHeadline2: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#1D2327] mb-1">Studio Intro Paragraph 1</label>
              <textarea
                rows={2}
                value={form.studioIntroParagraph1}
                onChange={(e) => setForm({ ...form, studioIntroParagraph1: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#1D2327] mb-1">Studio Intro Paragraph 2</label>
              <textarea
                rows={2}
                value={form.studioIntroParagraph2}
                onChange={(e) => setForm({ ...form, studioIntroParagraph2: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#1D2327] mb-1">Founder Section Headline</label>
              <input
                type="text"
                value={form.founderSectionHeadline}
                onChange={(e) => setForm({ ...form, founderSectionHeadline: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#1D2327] mb-1">Founder Section Bio (Paragraph 1)</label>
              <textarea
                rows={2}
                value={form.founderBioP1}
                onChange={(e) => setForm({ ...form, founderBioP1: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#1D2327] mb-1">Founder Section Bio (Paragraph 2)</label>
              <textarea
                rows={2}
                value={form.founderBioP2}
                onChange={(e) => setForm({ ...form, founderBioP2: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {renderImageSlot('Studio Intro Photo', 'studioIntroImage')}
            {renderImageSlot('Founder Portrait', 'founderPortrait')}
            {renderImageSlot('Founder Studio Laptop Photo', 'founderStudioLaptop')}
            {renderImageSlot('Site Supervision Photo', 'founderSiteVisit')}
            {renderImageSlot('Award Plaque Photo', 'awardPlaque')}
            {renderImageSlot('Brand Logo Emblem', 'logoEmblem')}
            {renderImageSlot('Final CTA Backdrop', 'finalCtaImage')}
          </div>
        </div>
      </div>

      {/* 5. Final CTA & Footer Text Metabox */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7]">
          <h2 className="text-xs font-semibold text-[#1D2327]">
            05. Closing Callout &amp; Footer Copy
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Closing Callout Line 1</label>
            <input
              type="text"
              value={form.finalCtaHeadline1}
              onChange={(e) => setForm({ ...form, finalCtaHeadline1: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1D2327] mb-1">Closing Callout Line 2</label>
            <input
              type="text"
              value={form.finalCtaHeadline2}
              onChange={(e) => setForm({ ...form, finalCtaHeadline2: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-medium text-[#1D2327] mb-1">Closing Callout Description</label>
            <textarea
              rows={2}
              value={form.finalCtaDescription}
              onChange={(e) => setForm({ ...form, finalCtaDescription: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-medium text-[#1D2327] mb-1">Footer Studio Summary</label>
            <textarea
              rows={2}
              value={form.footerDescription}
              onChange={(e) => setForm({ ...form, footerDescription: e.target.value })}
              className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={activePicker !== null}
        onClose={() => setActivePicker(null)}
        media={media}
        selectedUrl={pickerSelectedUrl}
        onUploadFile={onUploadFile}
        onDeleteMedia={onDeleteMedia}
        onClearSelection={
          activePicker?.kind === 'site'
            ? () => setForm((prev) => ({ ...prev, [activePicker.key]: '' }))
            : activePicker?.kind === 'customSection'
            ? () =>
                updateSections((prev) =>
                  prev.map((s) =>
                    s.id === activePicker.sectionId ? { ...s, customImage: '' } : s
                  )
                )
            : undefined
        }
        onSelect={(url) => {
          if (activePicker?.kind === 'site') {
            setForm((prev) => ({ ...prev, [activePicker.key]: url }));
          } else if (activePicker?.kind === 'customSection') {
            updateSections((prev) =>
              prev.map((s) =>
                s.id === activePicker.sectionId ? { ...s, customImage: url } : s
              )
            );
          }
        }}
      />
    </form>
  );
};

interface AdminServicesEditorProps {
  services: ServiceItem[];
  media: MediaItem[];
  onSaveServices: (next: ServiceItem[]) => Promise<void>;
  onUploadFile: (file: File) => Promise<MediaItem | null>;
  onDeleteMedia?: (item: MediaItem) => Promise<void>;
}

export const AdminServicesEditor: React.FC<AdminServicesEditorProps> = ({
  services,
  media,
  onSaveServices,
  onUploadFile,
  onDeleteMedia,
}) => {
  const [list, setList] = useState<ServiceItem[]>(services);
  const [saving, setSaving] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [dragServiceIdx, setDragServiceIdx] = useState<number | null>(null);
  const [dragOverServiceIdx, setDragOverServiceIdx] = useState<number | null>(null);

  useEffect(() => {
    setList(services);
  }, [services]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = list.map((s, i) => ({
        ...s,
        number: s.number?.trim() || String(i + 1).padStart(2, '0'),
      }));
      await onSaveServices(normalized);
    } finally {
      setSaving(false);
    }
  };

  const handleMove = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setList(next);
  };

  const handleAddService = () => {
    const nextNum = String(list.length + 1).padStart(2, '0');
    setList([
      ...list,
      {
        id: `srv-${Date.now()}`,
        number: nextNum,
        title: 'New Studio Service',
        tagline: 'Short service subtitle',
        description: 'Describe the interior design scope and deliverables.',
        deliverables: ['Concept Layout', '3D Renderings'],
        image: media[0]?.url || '/assets/muskan/bedroom-butterfly.jpg',
        vastuIncluded: false,
        status: 'published',
      },
    ]);
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-normal text-[#1D2327]">Studio Services &amp; Vastu Offerings</h1>
          <p className="text-xs text-[#646970] mt-0.5">
            Drag and drop service highlight cards using the top grip bar to reorder, edit numbering, toggle Vastu badges, or assign photography.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddService}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Services'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {list.map((srv, idx) => (
          <div
            key={srv.id || idx}
            draggable
            onDragStart={(e) => {
              if ((e.target as HTMLElement).closest('input, textarea, select, button, a')) {
                e.preventDefault();
                return;
              }
              setDragServiceIdx(idx);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(idx));
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverServiceIdx !== idx) setDragOverServiceIdx(idx);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragServiceIdx !== null && dragServiceIdx !== idx) {
                const next = [...list];
                const [moved] = next.splice(dragServiceIdx, 1);
                next.splice(idx, 0, moved);
                setList(next);
              }
              setDragServiceIdx(null);
              setDragOverServiceIdx(null);
            }}
            onDragEnd={() => {
              setDragServiceIdx(null);
              setDragOverServiceIdx(null);
            }}
            className={`bg-white border transition-all text-xs ${
              dragServiceIdx === idx
                ? 'opacity-45 border-[#2271B1]'
                : dragOverServiceIdx === idx
                ? 'border-[#2271B1] ring-2 ring-[#2271B1]/25 bg-[#F0F6FC]'
                : 'border-[#C3C4C7]'
            }`}
          >
            <div className="px-4 py-1.5 bg-[#F6F7F7] border-b border-[#DCDCDE] flex items-center justify-between cursor-grab active:cursor-grabbing">
              <span className="inline-flex items-center gap-2 text-[11px] font-medium text-[#50575E]">
                <GripVertical className="w-3.5 h-3.5 text-[#8C8F94]" />
                <span>Drag to reorder Service #{String(idx + 1).padStart(2, '0')}</span>
              </span>
              <span className="font-mono text-[10px] text-[#646970]">
                {srv.status === 'draft' ? 'DRAFT' : 'PUBLISHED'}
              </span>
            </div>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-3 space-y-2">
                <div className="aspect-[4/3] bg-[#F0F0F1] border border-[#DCDCDE] overflow-hidden flex items-center justify-center">
                {srv.image ? (
                  <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] text-[#646970]">No image assigned</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPickerIndex(idx)}
                  className="flex-1 py-1.5 border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] font-medium cursor-pointer"
                >
                  {srv.image ? 'Change Image' : 'Select Image'}
                </button>
                {srv.image && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...list];
                      next[idx] = { ...srv, image: '' };
                      setList(next);
                    }}
                    className="px-2.5 py-1.5 border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] cursor-pointer"
                    title="Delete image from service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-[#1D2327] mb-1">Number</label>
                <input
                  type="text"
                  value={srv.number}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...srv, number: e.target.value };
                    setList(next);
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] font-mono focus:border-[#2271B1] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block font-medium text-[#1D2327] mb-1">Service Title</label>
                <input
                  type="text"
                  value={srv.title}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...srv, title: e.target.value };
                    setList(next);
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block font-medium text-[#1D2327] mb-1">Tagline</label>
                <input
                  type="text"
                  value={srv.tagline}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...srv, tagline: e.target.value };
                    setList(next);
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-12">
                <label className="block font-medium text-[#1D2327] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={srv.description}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...srv, description: e.target.value };
                    setList(next);
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-12">
                <label className="block font-medium text-[#1D2327] mb-1">
                  Deliverables (Comma separated)
                </label>
                <input
                  type="text"
                  value={srv.deliverables.join(', ')}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = {
                      ...srv,
                      deliverables: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    };
                    setList(next);
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-12 flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(srv.vastuIncluded)}
                      onChange={(e) => {
                        const next = [...list];
                        next[idx] = { ...srv, vastuIncluded: e.target.checked };
                        setList(next);
                      }}
                      className="accent-[#2271B1]"
                    />
                    <span>Show &ldquo;Vastu Aligned&rdquo; marker</span>
                  </label>

                  <select
                    value={srv.status === 'draft' ? 'draft' : 'published'}
                    onChange={(e) => {
                      const next = [...list];
                      next[idx] = { ...srv, status: e.target.value as 'published' | 'draft' };
                      setList(next);
                    }}
                    className="px-2 py-1 border border-[#8C8F94] bg-white text-[11px]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    className="p-1 border border-[#C3C4C7] disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === list.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1 border border-[#C3C4C7] disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setList(list.filter((_, i) => i !== idx))}
                    className="inline-flex items-center gap-1 text-[#B32D2E] hover:underline cursor-pointer ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Service</span>
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        ))}
      </div>

      <MediaPickerModal
        isOpen={pickerIndex !== null}
        onClose={() => setPickerIndex(null)}
        media={media}
        selectedUrl={pickerIndex !== null ? list[pickerIndex]?.image : undefined}
        onUploadFile={onUploadFile}
        onDeleteMedia={onDeleteMedia}
        onClearSelection={
          pickerIndex !== null
            ? () => {
                const next = [...list];
                next[pickerIndex] = { ...next[pickerIndex], image: '' };
                setList(next);
              }
            : undefined
        }
        onSelect={(url) => {
          if (pickerIndex !== null) {
            const next = [...list];
            next[pickerIndex] = { ...next[pickerIndex], image: url };
            setList(next);
          }
        }}
      />
    </div>
  );
};

interface AdminProcessEditorProps {
  processSteps: ProcessStep[];
  comparisonCases?: DrawingComparisonCase[];
  media: MediaItem[];
  onSaveProcess: (
    nextSteps: ProcessStep[],
    nextComparisons?: DrawingComparisonCase[]
  ) => Promise<void>;
  onUploadFile: (file: File) => Promise<MediaItem | null>;
  onDeleteMedia?: (item: MediaItem) => Promise<void>;
}

type ProcessPickerTarget =
  | { kind: 'step'; index: number }
  | { kind: 'comparison'; index: number; field: 'planImage' | 'finishedImage' };

export const AdminProcessEditor: React.FC<AdminProcessEditorProps> = ({
  processSteps,
  comparisonCases,
  media,
  onSaveProcess,
  onUploadFile,
  onDeleteMedia,
}) => {
  const [steps, setSteps] = useState<ProcessStep[]>(processSteps);
  const [comparisons, setComparisons] = useState<DrawingComparisonCase[]>(
    comparisonCases && comparisonCases.length > 0 ? comparisonCases : DEFAULT_COMPARISON_CASES
  );
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<ProcessPickerTarget | null>(null);
  const [dragStepIdx, setDragStepIdx] = useState<number | null>(null);
  const [dragOverStepIdx, setDragOverStepIdx] = useState<number | null>(null);

  useEffect(() => {
    setSteps(processSteps);
  }, [processSteps]);

  useEffect(() => {
    if (comparisonCases && comparisonCases.length > 0) {
      setComparisons(comparisonCases);
    }
  }, [comparisonCases]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanedSteps = steps.map((s, i) => ({
        ...s,
        id: s.id || `step-${i + 1}-${Date.now()}`,
        number: s.number?.trim() || String(i + 1).padStart(2, '0'),
        status: s.status || 'published',
      }));
      await onSaveProcess(cleanedSteps, comparisons);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveStep = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setSteps(next);
  };

  const handleDuplicateStep = (idx: number) => {
    const src = steps[idx];
    const copy: ProcessStep = {
      ...src,
      id: `step-${Date.now()}`,
      number: String(steps.length + 1).padStart(2, '0'),
      title: `${src.title} (Copy)`,
    };
    const next = [...steps];
    next.splice(idx + 1, 0, copy);
    setSteps(next);
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        id: `step-${Date.now()}`,
        number: String(steps.length + 1).padStart(2, '0'),
        title: 'New Stage',
        subtitle: 'Phase subtitle',
        description: 'Describe this architectural stage.',
        focus: 'Key deliverable',
        image: media[0]?.url || DEFAULT_BRAND_ASSETS.plan2dSalon,
        imagePosition: 'center',
        actionHeadline: 'Phase Scope & Actions',
        activities: ['Consultation & site review', 'Documentation sign-off'],
        stageOutput: 'Stage deliverables approved for next step.',
        status: 'published',
      },
    ]);
  };

  const handleMoveComparison = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= comparisons.length) return;
    const next = [...comparisons];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setComparisons(next);
  };

  const handleAddComparison = () => {
    setComparisons([
      ...comparisons,
      {
        id: `cmp-${Date.now()}`,
        name: 'New 2D / 3D Study',
        code: `DWG: SM-${String(comparisons.length + 1).padStart(2, '0')}`,
        category: 'Spatial Planning',
        planImage: DEFAULT_BRAND_ASSETS.plan2dSalon,
        planLabel: '2D AutoCAD / 3D Plan',
        finishedImage: media[0]?.url || DEFAULT_BRAND_ASSETS.livingEclipse,
        datum: 'Vastu Aligned Layout',
        software: 'AutoCAD · SketchUp & V-Ray',
        title: 'From Spatial Plan to Finished Room',
        description:
          'How scaled layout geometry translates into built surfaces, lighting, and custom furniture.',
        cadSpecs: [
          'Exact room circulation & furniture clearances',
          'Concealed lighting & ceiling cove coordination',
        ],
        annotations: [],
      },
    ]);
  };

  const selectedModalUrl =
    pickerTarget?.kind === 'step'
      ? steps[pickerTarget.index]?.image
      : pickerTarget?.kind === 'comparison'
      ? comparisons[pickerTarget.index]?.[pickerTarget.field]
      : undefined;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-normal text-[#1D2327]">
            Design Process Stages &amp; 2D/3D Drawing Studies
          </h1>
          <p className="text-xs text-[#646970] mt-0.5">
            Edit stage numbers, reorder timeline sequence, customize stage photos &amp; framing, edit checklists, and manage 2D/3D comparison case studies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Process Stage</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Process & Drawings'}</span>
          </button>
        </div>
      </div>

      {/* DESIGN PROCESS STAGES */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.id || `${step.number}-${idx}`}
            draggable
            onDragStart={(e) => {
              if ((e.target as HTMLElement).closest('input, textarea, select, button, a')) {
                e.preventDefault();
                return;
              }
              setDragStepIdx(idx);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(idx));
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverStepIdx !== idx) setDragOverStepIdx(idx);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragStepIdx !== null && dragStepIdx !== idx) {
                const next = [...steps];
                const [moved] = next.splice(dragStepIdx, 1);
                next.splice(idx, 0, moved);
                setSteps(next);
              }
              setDragStepIdx(null);
              setDragOverStepIdx(null);
            }}
            onDragEnd={() => {
              setDragStepIdx(null);
              setDragOverStepIdx(null);
            }}
            className={`bg-white border transition-all text-xs ${
              dragStepIdx === idx
                ? 'opacity-45 border-[#2271B1]'
                : dragOverStepIdx === idx
                ? 'border-[#2271B1] ring-2 ring-[#2271B1]/25 bg-[#F0F6FC]'
                : step.status === 'draft'
                ? 'border-[#DCDCDE] opacity-80'
                : 'border-[#C3C4C7]'
            }`}
          >
            <div className="px-4 py-1.5 bg-[#F6F7F7] border-b border-[#DCDCDE] flex items-center justify-between cursor-grab active:cursor-grabbing">
              <span className="inline-flex items-center gap-2 text-[11px] font-medium text-[#50575E]">
                <GripVertical className="w-3.5 h-3.5 text-[#8C8F94]" />
                <span>Drag to reorder Stage {step.number}</span>
              </span>
              <span className="font-mono text-[10px] text-[#646970]">
                {step.status === 'draft' ? 'DRAFT' : 'PUBLISHED'}
              </span>
            </div>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Stage Visual & Controls */}
              <div className="lg:col-span-3 space-y-2.5">
              <div className="aspect-[4/3] bg-[#F0F0F1] border border-[#DCDCDE] overflow-hidden flex items-center justify-center">
                {step.image ? (
                  <img
                    src={step.image}
                    alt={step.title}
                    className={`w-full h-full object-cover ${
                      step.imagePosition === 'top'
                        ? 'object-top'
                        : step.imagePosition === 'bottom'
                        ? 'object-bottom'
                        : 'object-center'
                    }`}
                  />
                ) : (
                  <span className="text-[11px] text-[#646970]">No stage photo</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPickerTarget({ kind: 'step', index: idx })}
                  className="flex-1 py-1.5 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] font-medium cursor-pointer"
                >
                  {step.image ? 'Change Photo' : 'Select Photo'}
                </button>
                {step.image && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...steps];
                      next[idx] = { ...step, image: '' };
                      setSteps(next);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] cursor-pointer"
                    title="Delete stage photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <label className="block font-medium text-[#1D2327] mb-1">Photo Framing</label>
                <select
                  value={step.imagePosition || 'center'}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = {
                      ...step,
                      imagePosition: e.target.value as ProcessStep['imagePosition'],
                    };
                    setSteps(next);
                  }}
                  className="w-full px-2 py-1 border border-[#8C8F94] bg-white text-[11px]"
                >
                  <option value="center">Center Crop</option>
                  <option value="top">Align Top (Portraits / Ceilings)</option>
                  <option value="bottom">Align Bottom</option>
                </select>
              </div>
            </div>

            {/* Granular Stage Fields */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-[#1D2327] mb-1">Stage No.</label>
                <input
                  type="text"
                  value={step.number}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = { ...step, number: e.target.value };
                    setSteps(next);
                  }}
                  placeholder="01"
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] font-mono focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block font-medium text-[#1D2327] mb-1">Stage Title</label>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = { ...step, title: e.target.value };
                    setSteps(next);
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block font-medium text-[#1D2327] mb-1">Subtitle</label>
                <input
                  type="text"
                  value={step.subtitle}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = { ...step, subtitle: e.target.value };
                    setSteps(next);
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block font-medium text-[#1D2327] mb-1">
                  Homepage Summary Description
                </label>
                <textarea
                  rows={2}
                  value={step.description}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = { ...step, description: e.target.value };
                    setSteps(next);
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block font-medium text-[#1D2327] mb-1">
                  Detailed Action Headline (Process Page)
                </label>
                <input
                  type="text"
                  value={step.actionHeadline || ''}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = { ...step, actionHeadline: e.target.value };
                    setSteps(next);
                  }}
                  placeholder="Client Brief, Site Audit & Vastu Orientation"
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block font-medium text-[#1D2327] mb-1">Focus Note</label>
                <input
                  type="text"
                  value={step.focus}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = { ...step, focus: e.target.value };
                    setSteps(next);
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-8">
                <label className="block font-medium text-[#1D2327] mb-1">
                  Core Phase Activities (One bullet per line)
                </label>
                <textarea
                  rows={3}
                  value={(step.activities || []).join('\n')}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = {
                      ...step,
                      activities: e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    };
                    setSteps(next);
                  }}
                  placeholder="One activity per line..."
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block font-medium text-[#1D2327] mb-1">
                  Stage Output Callout
                </label>
                <textarea
                  rows={3}
                  value={step.stageOutput || ''}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = { ...step, stageOutput: e.target.value };
                    setSteps(next);
                  }}
                  placeholder="Deliverable handed over at completion of this stage..."
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
              </div>

              {/* Footer Actions: Status, Reorder, Duplicate, Delete */}
              <div className="sm:col-span-12 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F0F0F1]">
                <div className="flex items-center gap-3">
                  <select
                    value={step.status === 'draft' ? 'draft' : 'published'}
                    onChange={(e) => {
                      const next = [...steps];
                      next[idx] = { ...step, status: e.target.value as 'published' | 'draft' };
                      setSteps(next);
                    }}
                    className="px-2.5 py-1 border border-[#8C8F94] bg-white text-[11px]"
                  >
                    <option value="published">Published (Visible on Site)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDuplicateStep(idx)}
                    className="inline-flex items-center gap-1 text-[#2271B1] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Duplicate</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveStep(idx, -1)}
                    className="p-1.5 border border-[#C3C4C7] disabled:opacity-30 hover:border-[#2271B1] cursor-pointer"
                    title="Move Stage Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === steps.length - 1}
                    onClick={() => handleMoveStep(idx, 1)}
                    className="p-1.5 border border-[#C3C4C7] disabled:opacity-30 hover:border-[#2271B1] cursor-pointer"
                    title="Move Stage Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                      className="inline-flex items-center gap-1 text-[#B32D2E] hover:underline cursor-pointer ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Stage</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2D CAD & 3D COMPARISON STUDIES */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold text-[#1D2327]">
              2D CAD &amp; 3D Comparison Case Studies (&ldquo;From Drawing to Realized Space&rdquo;)
            </h2>
            <p className="text-[11px] text-[#646970]">
              Manage the interactive Before (2D CAD / 3D Plan) vs After (Completed Room) comparison tabs on the homepage.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddComparison}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#2271B1] hover:text-white text-[11px] font-medium cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Drawing Case Study</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {comparisons.map((cmp, idx) => (
            <div
              key={cmp.id}
              className="border border-[#DCDCDE] bg-[#F9F9F9] p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs"
            >
              {/* Dual Plan & Finished Image Pickers */}
              <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <span className="block font-medium text-[#1D2327]">2D / 3D Plan Photo</span>
                  <div className="aspect-[16/10] bg-white border border-[#C3C4C7] overflow-hidden flex items-center justify-center">
                    {cmp.planImage ? (
                      <img
                        src={cmp.planImage}
                        alt={cmp.planLabel}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-[#646970]">No plan image</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPickerTarget({ kind: 'comparison', index: idx, field: 'planImage' })
                      }
                      className="flex-1 py-1 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] text-[11px] font-medium cursor-pointer"
                    >
                      {cmp.planImage ? 'Change Plan' : 'Select Plan'}
                    </button>
                    {cmp.planImage && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...comparisons];
                          next[idx] = { ...cmp, planImage: '' };
                          setComparisons(next);
                        }}
                        className="px-2 py-1 bg-white border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block font-medium text-[#1D2327]">Realized / Executed Photo</span>
                  <div className="aspect-[16/10] bg-white border border-[#C3C4C7] overflow-hidden flex items-center justify-center">
                    {cmp.finishedImage ? (
                      <img
                        src={cmp.finishedImage}
                        alt={cmp.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-[#646970]">No finished photo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPickerTarget({ kind: 'comparison', index: idx, field: 'finishedImage' })
                      }
                      className="flex-1 py-1 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] text-[11px] font-medium cursor-pointer"
                    >
                      {cmp.finishedImage ? 'Change Room' : 'Select Room'}
                    </button>
                    {cmp.finishedImage && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...comparisons];
                          next[idx] = { ...cmp, finishedImage: '' };
                          setComparisons(next);
                        }}
                        className="px-2 py-1 bg-white border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Comparison Copy Fields */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#1D2327] mb-1">Tab Label (Short)</label>
                  <input
                    type="text"
                    value={cmp.name}
                    onChange={(e) => {
                      const next = [...comparisons];
                      next[idx] = { ...cmp, name: e.target.value };
                      setComparisons(next);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D2327] mb-1">Drawing Code</label>
                  <input
                    type="text"
                    value={cmp.code}
                    onChange={(e) => {
                      const next = [...comparisons];
                      next[idx] = { ...cmp, code: e.target.value };
                      setComparisons(next);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] font-mono focus:border-[#2271B1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D2327] mb-1">Plan Overlay Badge</label>
                  <input
                    type="text"
                    value={cmp.planLabel}
                    onChange={(e) => {
                      const next = [...comparisons];
                      next[idx] = { ...cmp, planLabel: e.target.value };
                      setComparisons(next);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D2327] mb-1">Software &amp; Alignment</label>
                  <input
                    type="text"
                    value={cmp.software}
                    onChange={(e) => {
                      const next = [...comparisons];
                      next[idx] = { ...cmp, software: e.target.value };
                      setComparisons(next);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#1D2327] mb-1">Case Study Title</label>
                  <input
                    type="text"
                    value={cmp.title}
                    onChange={(e) => {
                      const next = [...comparisons];
                      next[idx] = { ...cmp, title: e.target.value };
                      setComparisons(next);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#1D2327] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={cmp.description}
                    onChange={(e) => {
                      const next = [...comparisons];
                      next[idx] = { ...cmp, description: e.target.value };
                      setComparisons(next);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#1D2327] mb-1">
                    Technical Notes (One spec per line)
                  </label>
                  <textarea
                    rows={2}
                    value={cmp.cadSpecs.join('\n')}
                    onChange={(e) => {
                      const next = [...comparisons];
                      next[idx] = {
                        ...cmp,
                        cadSpecs: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      };
                      setComparisons(next);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveComparison(idx, -1)}
                    className="p-1 border border-[#C3C4C7] disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === comparisons.length - 1}
                    onClick={() => handleMoveComparison(idx, 1)}
                    className="p-1 border border-[#C3C4C7] disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  {comparisons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setComparisons(comparisons.filter((_, i) => i !== idx))}
                      className="inline-flex items-center gap-1 text-[#B32D2E] hover:underline cursor-pointer ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Case Study</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MediaPickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        media={media}
        selectedUrl={selectedModalUrl}
        onUploadFile={onUploadFile}
        onDeleteMedia={onDeleteMedia}
        onClearSelection={
          pickerTarget?.kind === 'step'
            ? () => {
                const next = [...steps];
                next[pickerTarget.index] = { ...next[pickerTarget.index], image: '' };
                setSteps(next);
              }
            : pickerTarget?.kind === 'comparison'
            ? () => {
                const next = [...comparisons];
                next[pickerTarget.index] = {
                  ...next[pickerTarget.index],
                  [pickerTarget.field]: '',
                };
                setComparisons(next);
              }
            : undefined
        }
        onSelect={(url) => {
          if (pickerTarget?.kind === 'step') {
            const next = [...steps];
            next[pickerTarget.index] = { ...next[pickerTarget.index], image: url };
            setSteps(next);
          } else if (pickerTarget?.kind === 'comparison') {
            const next = [...comparisons];
            next[pickerTarget.index] = {
              ...next[pickerTarget.index],
              [pickerTarget.field]: url,
            };
            setComparisons(next);
          }
        }}
      />
    </div>
  );
};
