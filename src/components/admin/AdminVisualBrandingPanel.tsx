import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Palette, RotateCcw, Save, SlidersHorizontal, Type } from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import {
  ACCENT_COLOR_PRESETS,
  LAYOUT_SPACING_PRESETS,
  TYPOGRAPHY_PRESETS,
  resolveAccentColors,
  resolveTypographyPreset,
} from '../../data/visualBrandingPresets';
import {
  AccentThemePreset,
  CustomAccentColors,
  LayoutSpacingTheme,
  StudioSiteConfig,
  TypographyPreset,
} from '../../types';

interface AdminVisualBrandingPanelProps {
  siteConfig: StudioSiteConfig;
  onSaveSite: (nextConfig: StudioSiteConfig) => Promise<void>;
}

export const AdminVisualBrandingPanel: React.FC<AdminVisualBrandingPanelProps> = ({
  siteConfig,
  onSaveSite,
}) => {
  const { updateSiteConfigLocal } = useCms();

  const [accentTheme, setAccentTheme] = useState<AccentThemePreset>(
    siteConfig.accentTheme || 'terracotta'
  );
  const [customColors, setCustomColors] = useState<CustomAccentColors>(
    siteConfig.customAccentColors || ACCENT_COLOR_PRESETS[0].colors
  );
  const [typographyPreset, setTypographyPreset] = useState<TypographyPreset>(
    siteConfig.typographyPreset || 'editorial_classic'
  );
  const [layoutSpacing, setLayoutSpacing] = useState<LayoutSpacingTheme>(
    siteConfig.layoutSpacing || 'balanced'
  );
  const [saving, setSaving] = useState(false);
  const [dirtyCustom, setDirtyCustom] = useState(false);

  useEffect(() => {
    setAccentTheme(siteConfig.accentTheme || 'terracotta');
    if (siteConfig.customAccentColors) {
      setCustomColors(siteConfig.customAccentColors);
    }
    setTypographyPreset(siteConfig.typographyPreset || 'editorial_classic');
    setLayoutSpacing(siteConfig.layoutSpacing || 'balanced');
    setDirtyCustom(false);
  }, [siteConfig]);

  const activeColors = resolveAccentColors(accentTheme, customColors);
  const activeTypography = resolveTypographyPreset(typographyPreset);
  const activeSpacing =
    LAYOUT_SPACING_PRESETS.find((s) => s.id === layoutSpacing) || LAYOUT_SPACING_PRESETS[1];

  const applyAndSave = async (patch: Partial<StudioSiteConfig>) => {
    updateSiteConfigLocal(patch);
    setSaving(true);
    try {
      await onSaveSite({
        ...siteConfig,
        accentTheme,
        customAccentColors: customColors,
        typographyPreset,
        layoutSpacing,
        ...patch,
      });
      setDirtyCustom(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTypography = async (presetId: TypographyPreset) => {
    setTypographyPreset(presetId);
    await applyAndSave({ typographyPreset: presetId });
  };

  const handleSelectAccent = async (presetId: AccentThemePreset) => {
    setAccentTheme(presetId);
    if (presetId === 'custom') {
      updateSiteConfigLocal({ accentTheme: 'custom', customAccentColors: customColors });
      setDirtyCustom(true);
      return;
    }
    const found = ACCENT_COLOR_PRESETS.find((p) => p.id === presetId);
    const nextCustom = found ? found.colors : customColors;
    setCustomColors(nextCustom);
    await applyAndSave({ accentTheme: presetId, customAccentColors: nextCustom });
  };

  const handleCustomColorChange = (key: keyof CustomAccentColors, value: string) => {
    const nextColors = { ...customColors, [key]: value };
    setAccentTheme('custom');
    setCustomColors(nextColors);
    setDirtyCustom(true);
    updateSiteConfigLocal({ accentTheme: 'custom', customAccentColors: nextColors });
  };

  const handleSelectSpacing = async (spacingId: LayoutSpacingTheme) => {
    setLayoutSpacing(spacingId);
    await applyAndSave({ layoutSpacing: spacingId });
  };

  const handleResetBranding = async () => {
    const defaults: Partial<StudioSiteConfig> = {
      accentTheme: 'terracotta',
      customAccentColors: ACCENT_COLOR_PRESETS[0].colors,
      typographyPreset: 'editorial_classic',
      layoutSpacing: 'balanced',
    };
    setAccentTheme('terracotta');
    setCustomColors(ACCENT_COLOR_PRESETS[0].colors);
    setTypographyPreset('editorial_classic');
    setLayoutSpacing('balanced');
    await applyAndSave(defaults);
  };

  return (
    <div className="bg-white border border-[#C3C4C7]">
      {/* Metabox Header */}
      <div className="px-4 py-3 border-b border-[#C3C4C7] bg-[#F6F7F7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Palette className="w-4 h-4 text-[#7F54B3]" />
          <div>
            <h2 className="text-xs font-semibold text-[#1D2327]">
              Visual Branding Studio — Real-Time Typography, Accent &amp; Spacing Controls
            </h2>
            <p className="text-[11px] text-[#646970]">
              Toggle curated font pairings, bespoke color schemes, and section breathing room with instant live storefront updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`px-2 py-0.5 font-mono text-[10px] border ${
              saving
                ? 'bg-[#F0F6FC] border-[#72AEE6] text-[#2271B1]'
                : dirtyCustom
                ? 'bg-[#FCF9E8] border-[#DBA617] text-[#8A6100]'
                : 'bg-[#EDFAEF] border-[#68DE7C] text-[#1E6B2F]'
            }`}
          >
            {saving ? 'Syncing Live...' : dirtyCustom ? 'Previewing Custom Colors' : 'Synced Live'}
          </span>

          <button
            type="button"
            onClick={() => void handleResetBranding()}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#C3C4C7] hover:border-[#2271B1] text-[11px] text-[#50575E] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Default</span>
          </button>

          {dirtyCustom && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void applyAndSave({ accentTheme: 'custom', customAccentColors: customColors })}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#2271B1] hover:bg-[#135E96] text-white text-[11px] font-semibold cursor-pointer"
            >
              <Save className="w-3 h-3" />
              <span>Save Custom Scheme</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Workspace: Controls (Left) + Real-Time Live Architectural Preview (Right) */}
      <div className="p-4 grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT: CONTROLS */}
        <div className="xl:col-span-7 space-y-5">
          {/* 1. TYPOGRAPHY PAIRINGS */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D2327]">
              <Type className="w-3.5 h-3.5 text-[#2271B1]" />
              <span>01. Editorial Typography Pairing</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TYPOGRAPHY_PRESETS.map((pair) => {
                const isSelected = typographyPreset === pair.id;
                return (
                  <button
                    key={pair.id}
                    type="button"
                    onClick={() => void handleSelectTypography(pair.id)}
                    className={`p-3 border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#2271B1] bg-[#F0F6FC] ring-1 ring-[#2271B1]'
                        : 'border-[#DCDCDE] bg-white hover:border-[#8C8F94]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-[#2271B1] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span
                      className="block text-lg text-[#181615] leading-tight pr-5"
                      style={{ fontFamily: pair.serifFont }}
                    >
                      {pair.name}
                    </span>
                    <span
                      className="block text-[11px] text-[#50575E] mt-1 font-medium"
                      style={{ fontFamily: pair.sansFont }}
                    >
                      {pair.pairingLabel}
                    </span>
                    <span className="block text-[10px] text-[#646970] mt-1 leading-snug">
                      {pair.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ACCENT COLOR SCHEMES + CUSTOM PICKERS */}
          <div className="space-y-2.5 pt-3 border-t border-[#F0F0F1]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D2327]">
                <Palette className="w-3.5 h-3.5 text-[#7F54B3]" />
                <span>02. Accent Color Scheme &amp; Custom Palette</span>
              </div>
              <button
                type="button"
                onClick={() => void handleSelectAccent('custom')}
                className={`px-2.5 py-0.5 text-[11px] border cursor-pointer ${
                  accentTheme === 'custom'
                    ? 'bg-[#7F54B3] text-white border-[#7F54B3] font-medium'
                    : 'bg-white text-[#50575E] border-[#C3C4C7] hover:border-[#7F54B3]'
                }`}
              >
                + Custom Colors
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ACCENT_COLOR_PRESETS.map((scheme) => {
                const isSelected = accentTheme === scheme.id;
                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => void handleSelectAccent(scheme.id)}
                    className={`p-2.5 border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2271B1] bg-[#F0F6FC] ring-1 ring-[#2271B1]'
                        : 'border-[#DCDCDE] bg-white hover:border-[#8C8F94]'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      <span
                        className="w-5 h-5 border border-black/15"
                        style={{ backgroundColor: scheme.colors.brand }}
                        title="Brand"
                      />
                      <span
                        className="w-4 h-5 border border-black/15"
                        style={{ backgroundColor: scheme.colors.dark }}
                        title="Hover Dark"
                      />
                      <span
                        className="w-4 h-5 border border-black/15"
                        style={{ backgroundColor: scheme.colors.soft }}
                        title="Soft"
                      />
                      <span
                        className="w-4 h-5 border border-black/15"
                        style={{ backgroundColor: scheme.colors.canvas }}
                        title="Canvas"
                      />
                    </div>
                    <span className="block text-[11px] font-semibold text-[#1D2327]">
                      {scheme.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Pickers Row */}
            <div className="p-3 bg-[#F6F7F7] border border-[#DCDCDE] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              {(
                [
                  { key: 'brand', label: 'Primary Brand' },
                  { key: 'dark', label: 'Deep / Hover' },
                  { key: 'soft', label: 'Soft Highlight' },
                  { key: 'canvas', label: 'Page Canvas' },
                ] as const
              ).map((item) => (
                <label key={item.key} className="block space-y-1 cursor-pointer">
                  <span className="font-medium text-[#1D2327] block">{item.label}</span>
                  <div className="flex items-center gap-1.5 bg-white border border-[#8C8F94] px-1.5 py-1">
                    <input
                      type="color"
                      value={customColors[item.key]}
                      onChange={(e) => handleCustomColorChange(item.key, e.target.value)}
                      className="w-5 h-5 border-0 p-0 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className="font-mono text-[10px] text-[#50575E] uppercase">
                      {customColors[item.key]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 3. LAYOUT SPACING THEMES */}
          <div className="space-y-2.5 pt-3 border-t border-[#F0F0F1]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D2327]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#2271B1]" />
              <span>03. Layout Spacing &amp; Editorial Breathing Room</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {LAYOUT_SPACING_PRESETS.map((sp) => {
                const isSelected = layoutSpacing === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => void handleSelectSpacing(sp.id)}
                    className={`p-3 border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2271B1] bg-[#F0F6FC] ring-1 ring-[#2271B1]'
                        : 'border-[#DCDCDE] bg-white hover:border-[#8C8F94]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#1D2327]">{sp.label}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-white border border-[#C3C4C7] text-[#50575E]">
                        {sp.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#646970] leading-snug">{sp.description}</p>
                    <span className="block text-[10px] font-mono text-[#2271B1] mt-1.5">
                      {sp.rhythmNote}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: REAL-TIME STOREFRONT LIVE SPECIMEN PREVIEW */}
        <div className="xl:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#646970]">
            <span>Real-Time Storefront Preview</span>
            <span>{activeSpacing.label}</span>
          </div>

          <div
            className="border border-[#C3C4C7] overflow-hidden shadow-xs transition-all duration-300"
            style={{
              backgroundColor: activeColors.canvas,
              fontFamily: activeTypography.sansFont,
            }}
          >
            {/* Mini Header Strip */}
            <div className="px-4 py-2.5 bg-white/85 border-b border-[#DFD8CE] flex items-center justify-between">
              <span
                className="text-sm font-medium text-[#181615]"
                style={{ fontFamily: activeTypography.serifFont }}
              >
                {siteConfig.name}
              </span>
              <span
                className="px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-white"
                style={{ backgroundColor: activeColors.brand }}
              >
                {siteConfig.headerCtaLabel || 'Start a Project'}
              </span>
            </div>

            {/* Dynamic Spacing Specimen Body */}
            <div
              className={`px-5 ${activeSpacing.sectionPaddingClass} transition-all duration-300 space-y-4`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-[1px]" style={{ backgroundColor: activeColors.brand }} />
                <span
                  className="text-[10px] uppercase tracking-[0.22em] font-medium"
                  style={{ color: activeColors.brand }}
                >
                  {siteConfig.heroEyebrow}
                </span>
              </div>

              <h3
                className="text-2xl sm:text-3xl font-light text-[#181615] leading-[1.1]"
                style={{ fontFamily: activeTypography.serifFont }}
              >
                {siteConfig.heroHeadlineLine1}{' '}
                <span className="italic font-normal" style={{ color: activeColors.brand }}>
                  {siteConfig.heroHeadlineLine2}
                </span>
              </h3>

              <p className="text-[12px] text-[#4A4540] leading-relaxed">
                Previewing live <strong className="font-medium">{activeTypography.name}</strong> typography on{' '}
                <span className="font-mono text-[10px]">{activeColors.canvas}</span> with{' '}
                <span className="font-mono text-[10px]">{activeSpacing.label}</span> vertical cadence.
              </p>

              {/* Mini Portfolio Tiles */}
              <div
                className={`grid grid-cols-2 ${
                  layoutSpacing === 'compact'
                    ? 'gap-2'
                    : layoutSpacing === 'expansive'
                    ? 'gap-4'
                    : 'gap-3'
                } pt-1`}
              >
                <div className="bg-white border border-[#DFD8CE] p-2">
                  <div className="aspect-[16/10] bg-[#E8E2D9] overflow-hidden mb-1.5">
                    {siteConfig.heroPrimaryImage && (
                      <img
                        src={siteConfig.heroPrimaryImage}
                        alt="Sample"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span
                    className="text-[9px] font-mono uppercase tracking-wider block"
                    style={{ color: activeColors.brand }}
                  >
                    01 · Residential
                  </span>
                  <span
                    className="text-xs text-[#181615] block truncate"
                    style={{ fontFamily: activeTypography.serifFont }}
                  >
                    Sculpted Suite
                  </span>
                </div>

                <div className="bg-white border border-[#DFD8CE] p-2">
                  <div className="aspect-[16/10] bg-[#E8E2D9] overflow-hidden mb-1.5">
                    {siteConfig.heroSecondaryImage && (
                      <img
                        src={siteConfig.heroSecondaryImage}
                        alt="Sample"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span
                    className="text-[9px] font-mono uppercase tracking-wider block"
                    style={{ color: activeColors.brand }}
                  >
                    02 · Vastu Living
                  </span>
                  <span
                    className="text-xs text-[#181615] block truncate"
                    style={{ fontFamily: activeTypography.serifFont }}
                  >
                    Curved Eclipse
                  </span>
                </div>
              </div>

              {/* Action Strip */}
              <div className="pt-1 flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white font-medium"
                  style={{ backgroundColor: activeColors.brand }}
                >
                  <span>{siteConfig.heroPrimaryCta}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.18em] border-b pb-0.5"
                  style={{ color: activeColors.dark, borderColor: activeColors.soft }}
                >
                  {siteConfig.heroSecondaryCta}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
