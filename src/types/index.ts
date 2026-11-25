export type ProjectCategory =
  | 'all'
  | 'residential'
  | 'commercial'
  | 'bedrooms'
  | 'kitchens'
  | 'bathrooms'
  | 'detailing';

export type PublishStatus = 'published' | 'draft';

export interface ProjectDetail {
  id: string;
  sku?: string;
  title: string;
  category: string;
  categorySlug: ProjectCategory;
  secondaryCategories?: ProjectCategory[];
  location?: string;
  heroImage: string;
  galleryImages: string[];
  scope: string[];
  materials: string[];
  dimensions?: string;
  description: string;
  architecturalNotes?: string;
  hasTechnicalDrawing?: boolean;
  status?: PublishStatus;
  featured?: boolean;
  availability?: 'Open for Commission' | 'Turnkey Available' | 'Design Package' | 'Archive Reference';
  estimateLabel?: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id?: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  image: string;
  vastuIncluded?: boolean;
  status?: PublishStatus;
}

export interface ProcessStep {
  id?: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  focus: string;
  image?: string;
  imagePosition?: 'center' | 'top' | 'bottom';
  actionHeadline?: string;
  activities?: string[];
  stageOutput?: string;
  status?: PublishStatus;
}

export interface CraftDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  specifications: string;
  image: string;
}

export interface StoryHighlight {
  title: string;
  label: string;
  image: string;
}

export type HomepageSectionType =
  | 'hero'
  | 'work'
  | 'studio'
  | 'services'
  | 'comparison'
  | 'process'
  | 'founder'
  | 'closingCta'
  | 'custom';

export interface HomepageSectionConfig {
  id: string;
  type: HomepageSectionType;
  label: string;
  visible: boolean;
  customEyebrow?: string;
  customHeadline?: string;
  customBody?: string;
  customCtaLabel?: string;
  customCtaLink?: string;
  customCtaOpensEnquiry?: boolean;
  customImage?: string;
  customTheme?: 'light' | 'linen' | 'dark';
}

export interface PromoPopupConfig {
  enabled: boolean;
  eyebrow: string;
  offerBadge: string;
  headline: string;
  body: string;
  image: string;
  ctaText: string;
  ctaAction: 'enquiry' | 'link';
  ctaServiceName: string;
  ctaLink: string;
  delaySeconds: number;
  frequency: 'once_per_session' | 'once_per_day' | 'always';
  style: 'editorial_light' | 'charcoal_brass' | 'terracotta_split';
}

export interface AnnouncementTickerConfig {
  enabled: boolean;
  items: string[];
  placement: 'top_bar' | 'below_hero' | 'both';
  speed: 'slow' | 'medium' | 'fast';
  pauseOnHover: boolean;
  theme: 'charcoal_brass' | 'terracotta_ivory' | 'stone_minimal';
  clickableAction: 'none' | 'enquiry' | 'link';
  actionLink: string;
}

export type AccentThemePreset = 'terracotta' | 'brass' | 'sage' | 'espresso' | 'custom';

export type TypographyPreset =
  | 'editorial_classic'
  | 'modern_architect'
  | 'warm_atelier'
  | 'minimal_gallery';

export type LayoutSpacingTheme = 'compact' | 'balanced' | 'expansive';

export interface CustomAccentColors {
  brand: string;
  dark: string;
  soft: string;
  canvas: string;
}

export interface StudioSiteConfig {
  name: string;
  shortName: string;
  secondaryMark: string;
  founder: string;
  monogram: string;
  discipline: string;
  tagline: string;
  heroSubtitle: string;
  instagramHandle: string;
  instagramUrl: string;
  youtubeHandle: string;
  youtubeUrl: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  googleMapsLink: string;
  responseCommitmentText: string;

  // Brand Visual Style & Navigation Controls
  accentTheme?: AccentThemePreset;
  customAccentColors?: CustomAccentColors;
  typographyPreset?: TypographyPreset;
  layoutSpacing?: LayoutSpacingTheme;
  headerCtaLabel?: string;
  navLabels?: {
    work: string;
    services: string;
    about: string;
    process: string;
    contact: string;
  };

  // Editable Homepage & Brand Visual Copy & Imagery
  logoEmblem: string;
  heroEyebrow: string;
  heroHeadlineLine1: string;
  heroHeadlineLine2: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroPrimaryImage: string;
  heroSecondaryImage: string;
  heroSecondaryLabel: string;
  heroSecondaryTitle: string;
  heroTertiaryImage: string;
  heroTertiaryLabel: string;
  heroTertiaryTitle: string;

  studioIntroEyebrow: string;
  studioIntroHeadline1: string;
  studioIntroHeadline2: string;
  studioIntroParagraph1: string;
  studioIntroParagraph2: string;
  studioIntroImage: string;

  workEyebrow?: string;
  workHeadline?: string;
  workSubtitle?: string;

  servicesEyebrow?: string;
  servicesHeadline?: string;
  servicesSubtitle?: string;

  comparisonEyebrow?: string;
  comparisonHeadline1?: string;
  comparisonHeadline2?: string;

  processEyebrow?: string;
  processHeadline?: string;

  founderPortrait: string;
  founderStudioLaptop: string;
  founderSiteVisit: string;
  awardPlaque: string;
  founderSectionHeadline: string;
  founderBioP1: string;
  founderBioP2: string;

  finalCtaHeadline1: string;
  finalCtaHeadline2: string;
  finalCtaDescription: string;
  finalCtaImage: string;

  footerStatementLine1: string;
  footerStatementLine2: string;
  footerDescription: string;

  storyHighlights: StoryHighlight[];

  homepageSections?: HomepageSectionConfig[];
  promoPopup?: PromoPopupConfig;
  announcementTicker?: AnnouncementTickerConfig;
}

export interface DrawingComparisonCase {
  id: string;
  name: string;
  code: string;
  category: string;
  planImage: string;
  planLabel: string;
  finishedImage: string;
  datum: string;
  software: string;
  title: string;
  description: string;
  cadSpecs: string[];
  annotations: { x: number; y: number; title: string; note: string }[];
}

export type EnquiryStatus = 'new' | 'reviewed' | 'consultation' | 'completed' | 'archived';

export interface EnquiryOrder {
  id: string;
  orderNumber: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  location: string;
  approxArea?: string;
  budget?: string;
  timeline?: string;
  brief: string;
  status: EnquiryStatus;
  internalNote?: string;
  createdAt: string;
}

export interface MediaItem {
  filename: string;
  url: string;
  webpUrl?: string;
  optimized?: boolean;
  source: 'muskan' | 'uploads';
  sizeBytes: number;
  updatedAt: string;
}

export interface StorageStats {
  totalSourceImages: number;
  totalWebpVariants: number;
  uploadsCount: number;
  archiveCount: number;
  usedBytes: number;
  freeBytes: number;
  totalDiskBytes: number;
  maxUploadMb: number;
  storageMode: 'local-server-disk';
}

export interface CmsStoreData {
  siteConfig: StudioSiteConfig;
  projects: ProjectDetail[];
  services: ServiceItem[];
  processSteps: ProcessStep[];
  craftDetails: CraftDetail[];
  comparisonCases?: DrawingComparisonCase[];
  enquiries: EnquiryOrder[];
  updatedAt: string;
}
