import {
  AccentThemePreset,
  CustomAccentColors,
  LayoutSpacingTheme,
  TypographyPreset,
} from '../types';

export interface TypographyOption {
  id: TypographyPreset;
  name: string;
  pairingLabel: string;
  description: string;
  serifFont: string;
  sansFont: string;
  serifCss: string;
  sansCss: string;
}

export const TYPOGRAPHY_PRESETS: TypographyOption[] = [
  {
    id: 'editorial_classic',
    name: 'Editorial Classic',
    pairingLabel: 'Cormorant Garamond × Plus Jakarta Sans',
    description: 'Poetic architectural serif paired with crisp geometric warmth.',
    serifFont: '"Cormorant Garamond", Garamond, Georgia, serif',
    sansFont: '"Plus Jakarta Sans", system-ui, sans-serif',
    serifCss: 'Cormorant Garamond',
    sansCss: 'Plus Jakarta Sans',
  },
  {
    id: 'modern_architect',
    name: 'Modern Architect',
    pairingLabel: 'Bodoni Moda × Inter',
    description: 'High-contrast Milanese fashion-house proportions with Swiss clarity.',
    serifFont: '"Bodoni Moda", Georgia, serif',
    sansFont: '"Inter", system-ui, sans-serif',
    serifCss: 'Bodoni Moda',
    sansCss: 'Inter',
  },
  {
    id: 'warm_atelier',
    name: 'Warm Atelier',
    pairingLabel: 'Playfair Display × DM Sans',
    description: 'Timeless residential luxury with approachable contemporary humanist type.',
    serifFont: '"Playfair Display", Georgia, serif',
    sansFont: '"DM Sans", system-ui, sans-serif',
    serifCss: 'Playfair Display',
    sansCss: 'DM Sans',
  },
  {
    id: 'minimal_gallery',
    name: 'Minimal Gallery',
    pairingLabel: 'Instrument Serif × Outfit',
    description: 'Condensed sculptural display titles balanced by clean spatial proportions.',
    serifFont: '"Instrument Serif", Georgia, serif',
    sansFont: '"Outfit", system-ui, sans-serif',
    serifCss: 'Instrument Serif',
    sansCss: 'Outfit',
  },
];

export interface AccentSchemeOption {
  id: AccentThemePreset;
  label: string;
  hint: string;
  colors: CustomAccentColors;
}

export const ACCENT_COLOR_PRESETS: AccentSchemeOption[] = [
  {
    id: 'terracotta',
    label: 'Burnt Terracotta',
    hint: 'Warm Indian architectural clay & natural linen',
    colors: {
      brand: '#8E4A36',
      dark: '#733928',
      soft: '#D5A38C',
      canvas: '#F6F3EE',
    },
  },
  {
    id: 'brass',
    label: 'Aged Brass & Stone',
    hint: 'Champagne bronze highlights on sun-warmed stone',
    colors: {
      brand: '#9A7B4F',
      dark: '#7A603B',
      soft: '#DFC59A',
      canvas: '#F7F4ED',
    },
  },
  {
    id: 'sage',
    label: 'Vastu Botanical Sage',
    hint: 'Calm forest sage & pale plaster harmony',
    colors: {
      brand: '#4E6655',
      dark: '#394D3F',
      soft: '#B8CEBF',
      canvas: '#F3F5F2',
    },
  },
  {
    id: 'espresso',
    label: 'Espresso Monochrome',
    hint: 'Gallery charcoal contrast with warm bone canvas',
    colors: {
      brand: '#2E2622',
      dark: '#181615',
      soft: '#C8BFB5',
      canvas: '#F4F2EF',
    },
  },
];

export interface LayoutSpacingOption {
  id: LayoutSpacingTheme;
  label: string;
  badge: string;
  description: string;
  sectionPaddingClass: string;
  rhythmNote: string;
}

export const LAYOUT_SPACING_PRESETS: LayoutSpacingOption[] = [
  {
    id: 'compact',
    label: 'Gallery Compact',
    badge: 'Dense & Crisp',
    description: 'Tighter vertical cadence ideal for showcasing more projects per scroll.',
    sectionPaddingClass: 'py-4',
    rhythmNote: '0.72× section padding · tighter grid gaps',
  },
  {
    id: 'balanced',
    label: 'Architectural Standard',
    badge: 'Balanced',
    description: 'Studio baseline proportions with measured breathing space around photography.',
    sectionPaddingClass: 'py-6',
    rhythmNote: '1.0× default studio rhythm',
  },
  {
    id: 'expansive',
    label: 'Luxury Editorial',
    badge: 'Generous Air',
    description: 'Heightened museum-like whitespace between architectural narratives and plates.',
    sectionPaddingClass: 'py-9',
    rhythmNote: '1.35× section padding · wider showcase margins',
  },
];

export function resolveAccentColors(
  preset: AccentThemePreset | undefined,
  custom?: CustomAccentColors
): CustomAccentColors {
  if (preset === 'custom' && custom?.brand) {
    return {
      brand: custom.brand || '#8E4A36',
      dark: custom.dark || '#733928',
      soft: custom.soft || '#D5A38C',
      canvas: custom.canvas || '#F6F3EE',
    };
  }
  const found = ACCENT_COLOR_PRESETS.find((p) => p.id === preset);
  return found ? found.colors : ACCENT_COLOR_PRESETS[0].colors;
}

export function resolveTypographyPreset(preset?: TypographyPreset): TypographyOption {
  return TYPOGRAPHY_PRESETS.find((p) => p.id === preset) || TYPOGRAPHY_PRESETS[0];
}
