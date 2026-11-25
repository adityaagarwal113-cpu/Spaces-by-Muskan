import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Image as ImageIcon,
  Megaphone,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  DEFAULT_ANNOUNCEMENT_TICKER,
  DEFAULT_PROMO_POPUP,
} from '../../data/defaultCmsData';
import {
  AnnouncementTickerConfig,
  MediaItem,
  PromoPopupConfig,
  ServiceItem,
  StudioSiteConfig,
} from '../../types';
import { MediaPickerModal } from './MediaPickerModal';
import { PromoPopupBanner } from '../PromoPopupBanner';
import { ResolvedImg } from '../OptimizedImage';

interface AdminPromotionsEditorProps {
  siteConfig: StudioSiteConfig;
  services: ServiceItem[];
  media: MediaItem[];
  onSaveSite: (nextConfig: StudioSiteConfig) => Promise<void>;
  onUploadFile: (file: File) => Promise<MediaItem | null>;
  onDeleteMedia?: (item: MediaItem) => Promise<void>;
  onDraftChange?: (patch: {
    promoPopup: PromoPopupConfig;
    announcementTicker: AnnouncementTickerConfig;
  }) => void;
}

export const AdminPromotionsEditor: React.FC<AdminPromotionsEditorProps> = ({
  siteConfig,
  services,
  media,
  onSaveSite,
  onUploadFile,
  onDeleteMedia,
  onDraftChange,
}) => {
  const [promo, setPromo] = useState<PromoPopupConfig>(
    siteConfig.promoPopup || DEFAULT_PROMO_POPUP
  );
  const [ticker, setTicker] = useState<AnnouncementTickerConfig>(
    siteConfig.announcementTicker || DEFAULT_ANNOUNCEMENT_TICKER
  );
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewPopupOpen, setPreviewPopupOpen] = useState(false);
  const [newTickerLine, setNewTickerLine] = useState('');
  const baselineRef = useRef<string>(
    JSON.stringify({
      promoPopup: siteConfig.promoPopup || DEFAULT_PROMO_POPUP,
      announcementTicker: siteConfig.announcementTicker || DEFAULT_ANNOUNCEMENT_TICKER,
    })
  );

  useEffect(() => {
    const nextPromo = siteConfig.promoPopup || DEFAULT_PROMO_POPUP;
    const nextTicker = siteConfig.announcementTicker || DEFAULT_ANNOUNCEMENT_TICKER;
    baselineRef.current = JSON.stringify({
      promoPopup: nextPromo,
      announcementTicker: nextTicker,
    });
    if (siteConfig.promoPopup) {
      setPromo(siteConfig.promoPopup);
    }
    if (siteConfig.announcementTicker) {
      setTicker(siteConfig.announcementTicker);
    }
  }, [siteConfig]);

  useEffect(() => {
    if (!onDraftChange) return;
    const payload = { promoPopup: promo, announcementTicker: ticker };
    if (JSON.stringify(payload) === baselineRef.current) return;
    onDraftChange(payload);
  }, [promo, ticker, onDraftChange]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSite({
        ...siteConfig,
        promoPopup: promo,
        announcementTicker: ticker,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMoveTicker = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= ticker.items.length) return;
    const next = [...ticker.items];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setTicker({ ...ticker, items: next });
  };

  const handleAddTickerItem = () => {
    const text = newTickerLine.trim();
    if (!text) return;
    setTicker({ ...ticker, items: [...ticker.items, text] });
    setNewTickerLine('');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-normal text-[#1D2327]">
            Promotions, Popup Banner &amp; Dynamic Moving Ribbon
          </h1>
          <p className="text-xs text-[#646970] mt-0.5">
            Configure your timed promotional offer popup, discount highlights, and smooth architectural marquee ribbon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewPopupOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] text-xs font-medium cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Popup</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Promotions & Ads'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: POPUP AD BANNER & CONTROL SETTINGS */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#7F54B3]" />
            <h2 className="text-xs font-semibold text-[#1D2327]">
              01. Popup Ad / Studio Offer Banner Settings
            </h2>
          </div>

          <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={promo.enabled}
              onChange={(e) => setPromo({ ...promo, enabled: e.target.checked })}
              className="accent-[#2271B1] w-3.5 h-3.5"
            />
            <span className={promo.enabled ? 'text-[#1E6B2F] font-semibold' : 'text-[#646970]'}>
              {promo.enabled ? 'Popup Active on Storefront' : 'Popup Disabled (Off)'}
            </span>
          </label>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
          <div className="lg:col-span-4 space-y-3">
            <label className="block font-medium text-[#1D2327]">
              Popup Visual Photo (Optional)
            </label>
            <div className="aspect-[4/3] bg-[#F0F0F1] border border-[#C3C4C7] overflow-hidden flex items-center justify-center">
              {promo.image ? (
                <ResolvedImg
                  src={promo.image}
                  alt="Popup preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[11px] text-[#646970] px-4 text-center">
                  No image (renders compact text-only card)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex-1 py-1.5 px-3 bg-white border border-[#2271B1] text-[#2271B1] hover:bg-[#F0F6FC] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{promo.image ? 'Change Image' : 'Select Image'}</span>
              </button>
              {promo.image && (
                <button
                  type="button"
                  onClick={() => setPromo({ ...promo, image: '' })}
                  className="px-2.5 py-1.5 bg-white border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] cursor-pointer"
                  title="Remove image from popup"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Eyebrow Label</label>
              <input
                type="text"
                value={promo.eyebrow}
                onChange={(e) => setPromo({ ...promo, eyebrow: e.target.value })}
                placeholder="Studio Consultation Window"
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1D2327] mb-1">
                Discount / Offer Highlight Badge
              </label>
              <input
                type="text"
                value={promo.offerBadge}
                onChange={(e) => setPromo({ ...promo, offerBadge: e.target.value })}
                placeholder="e.g. 15% Off Turnkey Booking · Free Vastu Audit"
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-[#1D2327] mb-1">Popup Headline</label>
              <input
                type="text"
                value={promo.headline}
                onChange={(e) => setPromo({ ...promo, headline: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-[#1D2327] mb-1">
                Offer Details / Body Copy
              </label>
              <textarea
                rows={3}
                value={promo.body}
                onChange={(e) => setPromo({ ...promo, body: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1D2327] mb-1">CTA Button Text</label>
              <input
                type="text"
                value={promo.ctaText}
                onChange={(e) => setPromo({ ...promo, ctaText: e.target.value })}
                placeholder="Claim Offer"
                className="w-full px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Button Click Action</label>
              <select
                value={promo.ctaAction}
                onChange={(e) =>
                  setPromo({ ...promo, ctaAction: e.target.value as 'enquiry' | 'link' })
                }
                className="w-full px-3 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
              >
                <option value="enquiry">Open Project Enquiry Popup</option>
                <option value="link">Navigate to Page / External URL</option>
              </select>
            </div>

            {promo.ctaAction === 'enquiry' ? (
              <div>
                <label className="block font-medium text-[#1D2327] mb-1">
                  Pre-select Enquiry Service
                </label>
                <select
                  value={promo.ctaServiceName}
                  onChange={(e) => setPromo({ ...promo, ctaServiceName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id || s.number} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  <option value="Residential Interiors">Residential Interiors</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-medium text-[#1D2327] mb-1">
                  Destination URL (e.g. /contact or /projects)
                </label>
                <input
                  type="text"
                  value={promo.ctaLink}
                  onChange={(e) => setPromo({ ...promo, ctaLink: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#8C8F94] font-mono focus:border-[#2271B1] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Popup Visual Theme</label>
              <select
                value={promo.style}
                onChange={(e) =>
                  setPromo({
                    ...promo,
                    style: e.target.value as PromoPopupConfig['style'],
                  })
                }
                className="w-full px-3 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
              >
                <option value="terracotta_split">Terracotta &amp; Warm Limestone</option>
                <option value="editorial_light">Minimal Ivory Editorial</option>
                <option value="charcoal_brass">Dark Charcoal &amp; Aged Brass</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#1D2327] mb-1">
                Show Delay After Page Open (Seconds)
              </label>
              <select
                value={promo.delaySeconds}
                onChange={(e) =>
                  setPromo({ ...promo, delaySeconds: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
              >
                <option value={0}>Immediate (0s)</option>
                <option value={2}>2 seconds</option>
                <option value={4}>4 seconds (Recommended)</option>
                <option value={8}>8 seconds</option>
                <option value={12}>12 seconds</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Display Frequency</label>
              <select
                value={promo.frequency}
                onChange={(e) =>
                  setPromo({
                    ...promo,
                    frequency: e.target.value as PromoPopupConfig['frequency'],
                  })
                }
                className="w-full px-3 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
              >
                <option value="once_per_session">Once per browser session</option>
                <option value="once_per_day">Once every 24 hours</option>
                <option value="always">Every time visitor loads site</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DYNAMIC MOVING MARQUEE / DISCOUNT RIBBON */}
      <div className="bg-white border border-[#C3C4C7]">
        <div className="px-4 py-2.5 border-b border-[#C3C4C7] bg-[#F6F7F7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2271B1]" />
            <h2 className="text-xs font-semibold text-[#1D2327]">
              02. Dynamic Moving Marquee Ribbon (Discounts, Booking Windows &amp; Studio Highlights)
            </h2>
          </div>

          <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={ticker.enabled}
              onChange={(e) => setTicker({ ...ticker, enabled: e.target.checked })}
              className="accent-[#2271B1] w-3.5 h-3.5"
            />
            <span className={ticker.enabled ? 'text-[#1E6B2F] font-semibold' : 'text-[#646970]'}>
              {ticker.enabled ? 'Moving Ribbon Active' : 'Ribbon Disabled'}
            </span>
          </label>
        </div>

        <div className="p-4 space-y-5 text-xs">
          {/* Live Strip Preview */}
          <div className="border border-[#DCDCDE] overflow-hidden">
            <div className="px-3 py-1 bg-[#F6F7F7] border-b border-[#DCDCDE] text-[10px] font-mono uppercase tracking-wider text-[#646970]">
              Live Aesthetic Preview
            </div>
            <div
              className={`py-2.5 px-4 flex items-center gap-6 overflow-x-auto text-[11px] uppercase tracking-[0.2em] ${
                ticker.theme === 'terracotta_ivory'
                  ? 'bg-[#8E4A36] text-[#FBF9F6]'
                  : ticker.theme === 'stone_minimal'
                  ? 'bg-[#EDE8DF] text-[#181615]'
                  : 'bg-[#181615] text-[#F6F3EE]'
              }`}
            >
              {ticker.items.length === 0 ? (
                <span className="opacity-60">Add items below to display in moving ribbon...</span>
              ) : (
                ticker.items.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-3 whitespace-nowrap">
                    <Sparkles className="w-3 h-3 text-[#D5A38C] shrink-0" />
                    <span>{item}</span>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Ribbon Placement</label>
              <select
                value={ticker.placement}
                onChange={(e) =>
                  setTicker({
                    ...ticker,
                    placement: e.target.value as AnnouncementTickerConfig['placement'],
                  })
                }
                className="w-full px-3 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
              >
                <option value="below_hero">Below Hero Section (Editorial)</option>
                <option value="top_bar">Topmost Announcement Bar</option>
                <option value="both">Both Top &amp; Below Hero</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Ribbon Theme</label>
              <select
                value={ticker.theme}
                onChange={(e) =>
                  setTicker({
                    ...ticker,
                    theme: e.target.value as AnnouncementTickerConfig['theme'],
                  })
                }
                className="w-full px-3 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
              >
                <option value="charcoal_brass">Charcoal &amp; Warm Gold</option>
                <option value="terracotta_ivory">Terracotta &amp; Ivory</option>
                <option value="stone_minimal">Warm Limestone Minimal</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Movement Speed</label>
              <select
                value={ticker.speed}
                onChange={(e) =>
                  setTicker({
                    ...ticker,
                    speed: e.target.value as AnnouncementTickerConfig['speed'],
                  })
                }
                className="w-full px-3 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
              >
                <option value="slow">Slow &amp; Calm (42s)</option>
                <option value="medium">Smooth Medium (28s)</option>
                <option value="fast">Brisk (18s)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#1D2327] mb-1">Click Action</label>
              <select
                value={ticker.clickableAction}
                onChange={(e) =>
                  setTicker({
                    ...ticker,
                    clickableAction: e.target.value as AnnouncementTickerConfig['clickableAction'],
                  })
                }
                className="w-full px-3 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
              >
                <option value="enquiry">Opens Project Enquiry Form</option>
                <option value="link">Navigates to Link URL</option>
                <option value="none">Display Only (Not Clickable)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ticker.pauseOnHover}
                onChange={(e) => setTicker({ ...ticker, pauseOnHover: e.target.checked })}
                className="accent-[#2271B1]"
              />
              <span>Pause movement smoothly when visitor hovers</span>
            </label>

            {ticker.clickableAction === 'link' && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#1D2327]">Link Target:</span>
                <input
                  type="text"
                  value={ticker.actionLink}
                  onChange={(e) => setTicker({ ...ticker, actionLink: e.target.value })}
                  placeholder="/contact"
                  className="px-2.5 py-1 border border-[#8C8F94] font-mono w-48"
                />
              </div>
            )}
          </div>

          {/* Rotating Items List */}
          <div className="space-y-2 border-t border-[#F0F0F1] pt-4">
            <label className="block font-medium text-[#1D2327]">
              Rotating Phrases / Discount Announcements ({ticker.items.length})
            </label>

            <div className="space-y-2">
              {ticker.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#646970] w-6 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const next = [...ticker.items];
                      next[idx] = e.target.value;
                      setTicker({ ...ticker, items: next });
                    }}
                    className="flex-1 px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveTicker(idx, -1)}
                    className="p-1.5 border border-[#C3C4C7] disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === ticker.items.length - 1}
                    onClick={() => handleMoveTicker(idx, 1)}
                    className="p-1.5 border border-[#C3C4C7] disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTicker({
                        ...ticker,
                        items: ticker.items.filter((_, i) => i !== idx),
                      })
                    }
                    className="p-1.5 border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] cursor-pointer"
                    title="Remove Phrase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newTickerLine}
                onChange={(e) => setNewTickerLine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTickerItem();
                  }
                }}
                placeholder="Type a new promo or studio update (e.g. Festive 15% Off 3D Packages)..."
                className="flex-1 px-3 py-1.5 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTickerItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F6F7F7] border border-[#2271B1] text-[#2271B1] hover:bg-[#2271B1] hover:text-white font-medium cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Phrase</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        media={media}
        selectedUrl={promo.image}
        onUploadFile={onUploadFile}
        onDeleteMedia={onDeleteMedia}
        onClearSelection={() => setPromo((prev) => ({ ...prev, image: '' }))}
        onSelect={(url) => setPromo((prev) => ({ ...prev, image: url }))}
      />

      {previewPopupOpen && (
        <PromoPopupBanner
          forceOpen={previewPopupOpen}
          onForceClose={() => setPreviewPopupOpen(false)}
        />
      )}
    </form>
  );
};
