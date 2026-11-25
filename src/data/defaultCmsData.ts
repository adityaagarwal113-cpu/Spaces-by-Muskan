import {
  AnnouncementTickerConfig,
  CmsStoreData,
  CraftDetail,
  DrawingComparisonCase,
  EnquiryOrder,
  HomepageSectionConfig,
  ProcessStep,
  ProjectDetail,
  PromoPopupConfig,
  ServiceItem,
  StudioSiteConfig,
} from '../types';

export const DEFAULT_BRAND_ASSETS = {
  logoEmblem: '/assets/muskan/logo-emblem.jpg',
  founderPortrait: '/assets/muskan/founder-portrait.jpg',
  founderSiteVisit: '/assets/muskan/founder-site-visit.jpg',
  founderStudioLaptop: '/assets/muskan/founder-studio-laptop.jpg',
  awardPlaque: '/assets/muskan/award-plaque.jpg',
  plan3dIsometric: '/assets/muskan/plan-3d-isometric.jpg',
  plan2dSalon: '/assets/muskan/plan-2d-salon.jpg',

  bedroomButterfly: '/assets/muskan/bedroom-butterfly.jpg',
  bedroomBotanical: '/assets/muskan/bedroom-botanical-scalloped.jpg',
  bedroomSage: '/assets/muskan/bedroom-sage-wardrobe.jpg',
  bedroomSunburst: '/assets/muskan/bedroom-sunburst.jpg',
  bedroomPalmRelief: '/assets/muskan/bedroom-palm-relief.jpg',
  bedroomClassicNavy: '/assets/muskan/bedroom-classic-navy.jpg',
  bedroomOakVitrine: '/assets/muskan/bedroom-oak-vitrine.jpg',
  kidsPlayroom: '/assets/muskan/kids-playroom.jpg',

  livingEclipse: '/assets/muskan/living-eclipse-curved.jpg',
  livingSlattedDivider: '/assets/muskan/living-slatted-divider.jpg',
  kitchenVitrineDining: '/assets/muskan/kitchen-vitrine-dining.jpg',
  bathroomStoneNiche: '/assets/muskan/bathroom-stone-niche.jpg',

  commercialAviation: '/assets/muskan/commercial-aviation.jpg',
  commercialOffice: '/assets/muskan/commercial-office-workstation.jpg',
  studyExecutive: '/assets/muskan/study-executive.jpg',

  detailRippleDoor: '/assets/muskan/detail-ripple-door.jpg',
  detailWalnutPartition: '/assets/muskan/detail-walnut-partition.jpg',
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: 'sec-hero', type: 'hero', label: 'Hero Composition (3-Image Layered Frame)', visible: true },
  { id: 'sec-work', type: 'work', label: 'Selected Work Portfolio', visible: true },
  { id: 'sec-studio', type: 'studio', label: 'Studio Introduction', visible: true },
  { id: 'sec-services', type: 'services', label: 'Capabilities & Services', visible: true },
  { id: 'sec-comparison', type: 'comparison', label: 'From Drawing to Realized Space', visible: true },
  { id: 'sec-process', type: 'process', label: 'Studio Methodology & Process', visible: true },
  { id: 'sec-founder', type: 'founder', label: 'Founder Profile (Muskan Agarwal)', visible: true },
  { id: 'sec-closing', type: 'closingCta', label: 'Closing Project Invitation', visible: true },
];

export const DEFAULT_PROMO_POPUP: PromoPopupConfig = {
  enabled: false,
  eyebrow: 'Studio Consultation Window',
  offerBadge: 'Complimentary Vastu Zoning Audit',
  headline: 'Planning a Home or Commercial Space?',
  body: 'Book a 2D AutoCAD & SketchUp 3D concept consultation with Muskan Agarwal and receive a complimentary directional Vastu review with your residential brief.',
  image: DEFAULT_BRAND_ASSETS.livingEclipse,
  ctaText: 'Claim Consultation Brief',
  ctaAction: 'enquiry',
  ctaServiceName: 'Vastu Consultation & Zoning',
  ctaLink: '/contact',
  delaySeconds: 4,
  frequency: 'once_per_session',
  style: 'terracotta_split',
};

export const DEFAULT_ANNOUNCEMENT_TICKER: AnnouncementTickerConfig = {
  enabled: true,
  items: [
    '2026 Residential & Commercial Commissions Open',
    'AutoCAD 2D Working Plans + SketchUp V-Ray 3D Renders',
    'Vastu-Aligned Interior Architecture by Muskan Agarwal',
    'Turnkey Design & Direct On-Site Supervision',
  ],
  placement: 'below_hero',
  speed: 'medium',
  pauseOnHover: true,
  theme: 'charcoal_brass',
  clickableAction: 'enquiry',
  actionLink: '/contact',
};

export const DEFAULT_SITE_CONFIG: StudioSiteConfig = {
  name: 'Spaces by Muskan',
  shortName: 'Spaces by Muskan',
  secondaryMark: 'Mi Interiors',
  founder: 'Muskan Agarwal',
  monogram: 'SM',
  discipline: 'Interior Design Studio & Vastu Consultancy',
  tagline: 'Interior Designer & Vastu Consultant · 2D & 3D Spatial Architecture',
  heroSubtitle: 'Residential · Commercial · Vastu · 2D & 3D Design',
  instagramHandle: '@spaces_by_muskan',
  instagramUrl: 'https://www.instagram.com/spaces_by_muskan/',
  youtubeHandle: '@MuskanAgarwal-z5w',
  youtubeUrl: 'https://www.youtube.com/@MuskanAgarwal-z5w',

  phone: '[ADD PHONE]',
  whatsappNumber: '[ADD NUMBER]',
  email: '[ADD EMAIL]',
  address: '[ADD STUDIO ADDRESS]',
  googleMapsLink: '#',
  responseCommitmentText: 'Every project brief is personally reviewed by Muskan Agarwal.',

  accentTheme: 'terracotta',
  customAccentColors: {
    brand: '#8E4A36',
    dark: '#733928',
    soft: '#D5A38C',
    canvas: '#F6F3EE',
  },
  typographyPreset: 'editorial_classic',
  layoutSpacing: 'balanced',
  headerCtaLabel: 'Start a Project',
  navLabels: {
    work: 'Work',
    services: 'Services',
    about: 'About',
    process: 'Process',
    contact: 'Contact',
  },

  logoEmblem: DEFAULT_BRAND_ASSETS.logoEmblem,
  heroEyebrow: 'Interior Design & Vastu Studio',
  heroHeadlineLine1: 'Crafting spaces with',
  heroHeadlineLine2: 'purpose & harmony.',
  heroPrimaryCta: 'Start a Project',
  heroSecondaryCta: 'Explore Works',
  heroPrimaryImage: DEFAULT_BRAND_ASSETS.bedroomButterfly,
  heroSecondaryImage: DEFAULT_BRAND_ASSETS.livingEclipse,
  heroSecondaryLabel: '02 · LIVING LOUNGE',
  heroSecondaryTitle: 'Curved Eclipse Wall',
  heroTertiaryImage: DEFAULT_BRAND_ASSETS.bedroomBotanical,
  heroTertiaryLabel: '03 · BEDROOM SUITE',
  heroTertiaryTitle: 'Botanical & Scalloped',

  studioIntroEyebrow: 'The Studio',
  studioIntroHeadline1: 'Designed with heart,',
  studioIntroHeadline2: 'anchored in Vastu.',
  studioIntroParagraph1:
    'Spaces by Muskan crafts distinctive residential and commercial spaces—from signature bedrooms and kitchens to salon, office, and theme environments.',
  studioIntroParagraph2:
    'Led by Interior Designer & Vastu Consultant Muskan Agarwal, every commission pairs AutoCAD 2D working plans and photorealistic SketchUp & V-Ray 3D visualization with hands-on site supervision.',
  studioIntroImage: DEFAULT_BRAND_ASSETS.founderStudioLaptop,

  workEyebrow: 'Selected Work',
  workHeadline: 'Signature Interiors.',
  workSubtitle:
    'A curated study of bespoke residences, commercial spaces, and sculptural joinery crafted by our studio.',

  servicesEyebrow: 'Capabilities & Consultancy',
  servicesHeadline: '2D Plans, 3D Design & Vastu.',
  servicesSubtitle:
    'End-to-end residential and commercial interior architecture—from AutoCAD layouts and Vastu alignment through SketchUp/V-Ray renders and site execution.',

  comparisonEyebrow: '2D CAD · 3D Render · Reality',
  comparisonHeadline1: 'From Drawing',
  comparisonHeadline2: 'to Realized Space.',

  processEyebrow: 'Studio Methodology',
  processHeadline: 'From 2D Plan to Realized Space.',

  founderPortrait: DEFAULT_BRAND_ASSETS.founderPortrait,
  founderStudioLaptop: DEFAULT_BRAND_ASSETS.founderStudioLaptop,
  founderSiteVisit: DEFAULT_BRAND_ASSETS.founderSiteVisit,
  awardPlaque: DEFAULT_BRAND_ASSETS.awardPlaque,
  founderSectionHeadline: 'Creativity grounded in craft.',
  founderBioP1:
    'Founded by Muskan Agarwal, Spaces by Muskan (also recognized from her atelier mark Mi Interiors) creates expressive, livable interiors across both residential and commercial scales.',
  founderBioP2:
    'Combining Vastu Shastra orientation with AutoCAD working documentation and photorealistic SketchUp & V-Ray visualization, Muskan personally oversees work-in-progress site stages to translate bold ideas into timeless reality.',

  finalCtaHeadline1: 'Have a space',
  finalCtaHeadline2: 'to transform?',
  finalCtaDescription:
    'We partner on residential homes, signature bedrooms, modular kitchens, Vastu consultations, commercial offices, and turnkey interiors.',
  finalCtaImage: DEFAULT_BRAND_ASSETS.livingEclipse,

  footerStatementLine1: 'Thoughtful spaces, 2D & 3D clarity.',
  footerStatementLine2: 'Designed with Vastu harmony.',
  footerDescription:
    'Residential and commercial interior design studio integrating AutoCAD spatial planning, SketchUp & V-Ray 3D visualization, Vastu consultation, and site supervision.',

  storyHighlights: [
    { title: 'Work in Progress', label: 'Site Supervision & Execution', image: DEFAULT_BRAND_ASSETS.founderSiteVisit },
    { title: '2D & 3D Design', label: 'AutoCAD, SketchUp & V-Ray', image: DEFAULT_BRAND_ASSETS.plan3dIsometric },
    { title: 'Residential', label: 'Bespoke Bedrooms & Living', image: DEFAULT_BRAND_ASSETS.bedroomButterfly },
    { title: 'Commercial', label: 'Thematic & Office Spaces', image: DEFAULT_BRAND_ASSETS.commercialAviation },
  ],

  homepageSections: DEFAULT_HOMEPAGE_SECTIONS,
  promoPopup: DEFAULT_PROMO_POPUP,
  announcementTicker: DEFAULT_ANNOUNCEMENT_TICKER,
};

export const DEFAULT_PROJECTS: ProjectDetail[] = [
  {
    id: 'butterfly-statement-suite',
    sku: 'SM-RES-001',
    title: 'Butterfly Sculpted Master Suite',
    category: 'Residential Interior',
    categorySlug: 'bedrooms',
    secondaryCategories: ['residential'],
    location: 'Residential Commission',
    heroImage: DEFAULT_BRAND_ASSETS.bedroomButterfly,
    galleryImages: [
      DEFAULT_BRAND_ASSETS.bedroomButterfly,
      DEFAULT_BRAND_ASSETS.bedroomPalmRelief,
      DEFAULT_BRAND_ASSETS.bedroomOakVitrine,
    ],
    scope: ['3D Concept & V-Ray Rendering', 'Sculptural Bedhead Wall', 'Fluted Timber Joinery', 'Tray Cove Lighting'],
    materials: ['Chevron Walnut Veneer', 'Vertical Fluted Fabric', 'Brushed Brass Inlays', 'Arched Mirror Panel'],
    dimensions: '16\' 0" × 14\' 6"',
    description:
      'A signature master bedroom anchored by a custom 3D butterfly sculptural relief, warm walnut chevron flanking panels, vertical fluted upholstery, and recessed brass illumination.',
    architecturalNotes:
      'Symmetric backlit mirror recess balanced against dark fluted wardrobe glass shutters and warm 3000K perimeter ceiling trays.',
    hasTechnicalDrawing: true,
    status: 'published',
    featured: true,
    availability: 'Open for Commission',
    estimateLabel: 'Custom Bespoke Suite',
  },
  {
    id: 'botanical-scalloped-suite',
    sku: 'SM-RES-002',
    title: 'Botanical & Scalloped Suite',
    category: 'Residential Interior',
    categorySlug: 'bedrooms',
    secondaryCategories: ['residential'],
    location: 'Bespoke Residence',
    heroImage: DEFAULT_BRAND_ASSETS.bedroomBotanical,
    galleryImages: [
      DEFAULT_BRAND_ASSETS.bedroomBotanical,
      DEFAULT_BRAND_ASSETS.bedroomSage,
      DEFAULT_BRAND_ASSETS.kidsPlayroom,
    ],
    scope: ['Custom Twin Headboard', 'Botanical Wall Mural', 'Pendant Task Lighting', 'Vastu-Aligned Layout'],
    materials: ['Upholstered Velvet Pillars', 'Botanical Linen Wallpaper', 'Matte White Trim', 'Warm Brass Sconces'],
    dimensions: '15\' 6" × 13\' 0"',
    description:
      'An expressive dual-bed residence combining custom multi-height scalloped velvet bedheads with a serene botanical mural and warm indirect tray ceiling illumination.',
    architecturalNotes:
      'Custom modular headboard ribs upholstered on-site with curved white piping to echo the botanical foliage silhouette.',
    hasTechnicalDrawing: true,
    status: 'published',
    featured: true,
    availability: 'Open for Commission',
    estimateLabel: 'Design + Turnkey',
  },
  {
    id: 'eclipse-curved-living',
    sku: 'SM-LIV-003',
    title: 'Curved Eclipse Living Lounge',
    category: 'Living & Spatial Design',
    categorySlug: 'residential',
    secondaryCategories: ['detailing'],
    location: 'Residential Living',
    heroImage: DEFAULT_BRAND_ASSETS.livingEclipse,
    galleryImages: [
      DEFAULT_BRAND_ASSETS.livingEclipse,
      DEFAULT_BRAND_ASSETS.livingSlattedDivider,
      DEFAULT_BRAND_ASSETS.detailWalnutPartition,
    ],
    scope: ['Feature Wall Geometry', 'Concealed Cove Curve', 'Bespoke Sectional Sofa', 'Partition Detailing'],
    materials: ['Veined Statuario Cladding', 'Fluted Acoustic Louvers', 'Slate Eclipse Relief', 'Tan & Taupe Upholstery'],
    description:
      'A refined contemporary living lounge defined by a continuous curved LED cove sweeping across fluted acoustic panels and a focal eclipse wall installation.',
    architecturalNotes:
      'Curved drywall transition houses an uninterrupted 3000K flexible aluminum light channel separating textured stone and ribbed timber.',
    hasTechnicalDrawing: true,
    status: 'published',
    featured: true,
    availability: 'Open for Commission',
    estimateLabel: 'Full Living Concept',
  },
  {
    id: 'vitrine-modular-kitchen',
    sku: 'SM-KIT-004',
    title: 'Vitrine & Granite Modular Kitchen',
    category: 'Kitchen Interior',
    categorySlug: 'kitchens',
    secondaryCategories: ['residential'],
    location: 'Residential Kitchen',
    heroImage: DEFAULT_BRAND_ASSETS.kitchenVitrineDining,
    galleryImages: [
      DEFAULT_BRAND_ASSETS.kitchenVitrineDining,
      DEFAULT_BRAND_ASSETS.livingSlattedDivider,
      DEFAULT_BRAND_ASSETS.plan3dIsometric,
    ],
    scope: ['Ergonomic Kitchen Zoning', 'Backlit Crockery Vitrine', 'CNC Partition Screen', 'Dining Integration'],
    materials: ['Matte Stone Grey Laminate', 'Smoked Fluted Glass', 'White Quartz Counters', 'Warm Wooden Framing'],
    description:
      'An open kitchen and dining layout balancing clean matte grey cabinetry, an illuminated glass crockery tower, and an intricate architectural partition screen.',
    architecturalNotes:
      'Designed along Vastu Agni-zone kitchen orientation principles with clear work-triangle clearances and illuminated display vitrines.',
    hasTechnicalDrawing: true,
    status: 'published',
    featured: true,
    availability: 'Turnkey Available',
    estimateLabel: 'Modular + Dining',
  },
  {
    id: 'aviation-commercial-wing',
    sku: 'SM-COM-005',
    title: 'Aviation Cabin Commercial Wing',
    category: 'Commercial Interior',
    categorySlug: 'commercial',
    secondaryCategories: ['detailing'],
    location: 'Commercial Institute',
    heroImage: DEFAULT_BRAND_ASSETS.commercialAviation,
    galleryImages: [
      DEFAULT_BRAND_ASSETS.commercialAviation,
      DEFAULT_BRAND_ASSETS.commercialOffice,
      DEFAULT_BRAND_ASSETS.studyExecutive,
    ],
    scope: ['Thematic Spatial Concept', 'Porthole Corridor Fabrication', 'Acoustic Grid Ceiling', 'Waiting & Briefing Lounge'],
    materials: ['Curved Gloss Composite Panels', 'Teak Window Trims', 'Brushed Steel Framing', 'Commercial Vinyl Flooring'],
    description:
      'A custom-engineered aviation-inspired commercial corridor and waiting bay built to replicate an aircraft fuselage experience with illuminated porthole apertures.',
    architecturalNotes:
      'Curved ribs fabricated in modular sections with recessed perimeter lighting and durable commercial traffic finishes.',
    hasTechnicalDrawing: true,
    status: 'published',
    featured: true,
    availability: 'Open for Commission',
    estimateLabel: 'Commercial Turnkey',
  },
  {
    id: 'stone-niche-ensuite',
    sku: 'SM-BTH-006',
    title: 'Stone & Illuminated Niche Ensuite',
    category: 'Wet Area Detailing',
    categorySlug: 'bathrooms',
    secondaryCategories: ['residential', 'detailing'],
    location: 'Residential Ensuite',
    heroImage: DEFAULT_BRAND_ASSETS.bathroomStoneNiche,
    galleryImages: [
      DEFAULT_BRAND_ASSETS.bathroomStoneNiche,
      DEFAULT_BRAND_ASSETS.detailRippleDoor,
      DEFAULT_BRAND_ASSETS.bedroomClassicNavy,
    ],
    scope: ['Sanitary Layout & Plumbing', 'Large-Format Stone Cladding', 'Recessed LED Storage Niche', 'Concealed Cistern Framing'],
    materials: ['Warm Veined Grey Marble', 'Matte Graphite Fixtures', 'Waterproof Mirror Cabinetry', 'IP65 Warm Profile LED'],
    dimensions: '9\' 0" × 6\' 6"',
    description:
      'A serene modern ensuite wrapped in full-height veined stone slabs, anchored by a backlit recessed shower niche, cantilevered vanity storage, and matte graphite fittings.',
    architecturalNotes:
      'Drafted with exact waterproof core boxing and concealed cistern framing, paired with 45-degree mitered marble edges around the illuminated niche.',
    hasTechnicalDrawing: true,
    status: 'published',
    featured: true,
    availability: 'Design Package',
    estimateLabel: 'Sanitary & Stone Spec',
  },
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-residential',
    number: '01',
    title: 'Residential Interiors',
    tagline: 'Bespoke homes tailored to your family rhythm',
    description:
      'Complete turnkey interior design for independent residences, apartments, signature bedrooms, modular kitchens, and living lounges crafted with bespoke upholstery and statement joinery.',
    deliverables: ['Full Home Concept & Execution', 'Signature Master & Kids Suites', 'Modular Kitchens & Vitrines', 'Living & Dining Architecture'],
    image: DEFAULT_BRAND_ASSETS.bedroomButterfly,
    status: 'published',
  },
  {
    id: 'srv-commercial',
    number: '02',
    title: 'Commercial Interiors',
    tagline: 'Workspaces, salons & thematic commercial design',
    description:
      'Purpose-built commercial studios, corporate multi-workstation offices, salons, and experiential interiors engineered for functional workflow, brand recall, and acoustic clarity.',
    deliverables: ['Office Workstations & Cabins', 'Salon & Boutique Layouts', 'Experiential Theme Spaces', 'Acoustic & HVAC Ceilings'],
    image: DEFAULT_BRAND_ASSETS.commercialOffice,
    status: 'published',
  },
  {
    id: 'srv-vastu',
    number: '03',
    title: 'Vastu Consultation & Zoning',
    tagline: 'Traditional energy harmony in modern layouts',
    description:
      'Vastu-conscious floor planning and directional zoning integrated seamlessly into contemporary residential and commercial designs for natural light, airflow, and balanced living.',
    deliverables: ['Directional Room Zoning', 'Kitchen & Master Orientation', 'Entrance & Living Alignment', 'Practical Remedial Layouts'],
    image: DEFAULT_BRAND_ASSETS.bedroomBotanical,
    vastuIncluded: true,
    status: 'published',
  },
  {
    id: 'srv-2d-cad',
    number: '04',
    title: '2D CAD & Working Drawings',
    tagline: 'AutoCAD precision before work begins on site',
    description:
      'Detailed 2D floor plans, furniture layouts, salon/commercial station zoning, electrical switchboard heights, ceiling grids, and custom carpentry drawings for zero site ambiguity.',
    deliverables: ['2D Furniture & Partition CAD', 'Electrical & False Ceiling Plans', 'Plumbing & Tiling Grids', 'Joinery Fabrication Drawings'],
    image: DEFAULT_BRAND_ASSETS.plan2dSalon,
    status: 'published',
  },
  {
    id: 'srv-3d-viz',
    number: '05',
    title: '3D Visualization (SketchUp & V-Ray)',
    tagline: 'Photorealistic spatial renders & cutaway plans',
    description:
      'High-definition 3D interior perspectives and 3D isometric cutaway floor plans produced in SketchUp, V-Ray, and 3ds Max so every texture and light angle is previewed before execution.',
    deliverables: ['3D Isometric Floor Plans', 'Photorealistic V-Ray Renders', 'Lighting & Material Studies', 'Theme Room Prototyping'],
    image: DEFAULT_BRAND_ASSETS.plan3dIsometric,
    status: 'published',
  },
  {
    id: 'srv-supervision',
    number: '06',
    title: 'Site Supervision & Turnkey Work',
    tagline: 'Hands-on monitoring from bare site to handover',
    description:
      'Regular on-site walkthroughs led by Muskan Agarwal—coordinating carpenters, POP teams, marble masons, and painters to translate approved 3D concepts into finished rooms.',
    deliverables: ['Work-in-Progress Inspections', 'Material & Laminate Sourcing', 'Carpenter & Mason Alignment', 'Final Styling & Handover'],
    image: DEFAULT_BRAND_ASSETS.founderSiteVisit,
    status: 'published',
  },
];

export const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'step-discover',
    number: '01',
    title: 'Discover',
    subtitle: 'Client Brief & Site Audit',
    description:
      'Understanding family lifestyle, commercial goals, site measurements, and Vastu orientation preferences.',
    focus: 'Site dimensions, lifestyle brief & directional orientation',
    image: DEFAULT_BRAND_ASSETS.founderPortrait,
    imagePosition: 'top',
    actionHeadline: 'Client Brief, Site Audit & Vastu Orientation',
    activities: [
      'Consultation covering family routines, commercial goals, and style direction',
      'Detailed room-by-room site measurements and daylight assessment',
      'Directional Vastu audit for entrances, kitchen, master suite, and workspaces',
      'Scope alignment across 2D, 3D, or turnkey execution',
    ],
    stageOutput: 'Initial dimensional brief & Vastu spatial zoning strategy.',
    status: 'published',
  },
  {
    id: 'step-plan',
    number: '02',
    title: 'Plan (2D)',
    subtitle: 'AutoCAD Space & Vastu Zoning',
    description:
      'Drafting optimized 2D floor layouts, circulation clearances, and Vastu-balanced room placements.',
    focus: 'AutoCAD layouts, ergonomics & Vastu alignment',
    image: DEFAULT_BRAND_ASSETS.plan2dSalon,
    imagePosition: 'center',
    actionHeadline: 'AutoCAD 2D Space Planning & Circulation',
    activities: [
      'Scaled 2D AutoCAD furniture and partition layouts',
      'Clearance checks for wardrobes, dining zones, or commercial workstations',
      'Salon, office, and kitchen ergonomics mapped to workflow',
      'Finalized floor layout prior to 3D modeling',
    ],
    stageOutput: 'Approved 2D AutoCAD floor plan & spatial zoning sheets.',
    status: 'published',
  },
  {
    id: 'step-visualize',
    number: '03',
    title: 'Visualize (3D)',
    subtitle: 'SketchUp, V-Ray & 3ds Max',
    description:
      'Bringing your rooms to life in photorealistic 3D views and isometric cutaways with accurate lighting and finishes.',
    focus: '3D perspectives, material palettes & ceiling lighting',
    image: DEFAULT_BRAND_ASSETS.plan3dIsometric,
    imagePosition: 'center',
    actionHeadline: 'SketchUp, V-Ray & 3ds Max 3D Visualization',
    activities: [
      'Photorealistic 3D interior renders & 3D isometric cutaway views',
      'Exploration of fluted timber, scalloped velvet, marble, and veneers',
      'Warm 3000K cove, pendant, and concealed profile lighting previews',
      'Material and color palette sign-off before carpentry begins',
    ],
    stageOutput: 'High-definition 3D perspectives & material board approvals.',
    status: 'published',
  },
  {
    id: 'step-detail',
    number: '04',
    title: 'Detail',
    subtitle: 'Working CAD & Joinery Specs',
    description:
      'Issuing exact 2D construction drawings for false ceilings, electrical points, sanitary niches, and bespoke furniture.',
    focus: 'Construction elevations, hardware & millwork sheets',
    image: DEFAULT_BRAND_ASSETS.founderStudioLaptop,
    imagePosition: 'top',
    actionHeadline: 'Detailed Working Drawings & Millwork',
    activities: [
      'Electrical, switchboard, and false-ceiling dimensional CAD plans',
      'Sanitary niche elevations, kitchen counter plumbing, and tile layouts',
      'Custom headboard, partition divider, and CNC door fabrication sheets',
      'Hardware, glass, and laminate specification sheets',
    ],
    stageOutput: 'Complete working drawing binder issued to the site team.',
    status: 'published',
  },
  {
    id: 'step-realize',
    number: '05',
    title: 'Realize',
    subtitle: 'On-Site Supervision & Handover',
    description:
      'Active work-in-progress site coordination with craftsmen to deliver refined, long-lasting interiors.',
    focus: 'Site inspections, quality checks & final reveal',
    image: DEFAULT_BRAND_ASSETS.founderSiteVisit,
    imagePosition: 'top',
    actionHeadline: 'Work-in-Progress Supervision & Handover',
    activities: [
      'Direct walkthroughs with carpenters, POP contractors, and masons',
      'Milestone verification against 2D CAD heights and 3D renders',
      'Inspection of polish, joinery edges, and indirect lighting execution',
      'Final styling and ready-to-live handover',
    ],
    stageOutput: 'Completed space delivered by Spaces by Muskan.',
    status: 'published',
  },
];

export const DEFAULT_CRAFT_DETAILS: CraftDetail[] = [
  {
    id: 'sculptural-doors',
    title: 'Concentric Ripple Statement Doors',
    category: 'Custom Joinery',
    description:
      'CNC-carved concentric ripple flush doors paired with brushed metal levers, turning transitional corridors into sculptural moments.',
    specifications: 'Custom CNC Relief Routing · Matte Satin Finish · Concealed Hinges',
    image: DEFAULT_BRAND_ASSETS.detailRippleDoor,
  },
  {
    id: 'curved-cove-living',
    title: 'Sweeping Cove Walls & Fluted Stone',
    category: 'Architectural Lighting',
    description:
      'Curved drywall channels concealing continuous 3000K LED strips that wash vertical ribbed paneling and veined stone slabs.',
    specifications: 'Warm 3000K Linear Diffuser · Fluted MDF/Timber · Brass Inlays',
    image: DEFAULT_BRAND_ASSETS.livingEclipse,
  },
  {
    id: 'walnut-partitions',
    title: 'Architectural Walnut Room Dividers',
    category: 'Space Zoning',
    description:
      'Asymmetric geometric timber display partitions that separate kitchen, dining, and living zones without blocking daylight.',
    specifications: 'High-Gloss Walnut Veneer · Concealed Joinery · Integrated Shelving',
    image: DEFAULT_BRAND_ASSETS.detailWalnutPartition,
  },
  {
    id: 'slatted-ceilings',
    title: 'Slatted Wood Commercial Ceilings',
    category: 'Commercial Craft',
    description:
      'Bespoke linear timber-finished ceilings engineered around cassette AC grilles and linear task lighting in multi-desk studios.',
    specifications: 'Linear Timber Louvers · Cassette HVAC Integration · Glare-Free Task Grid',
    image: DEFAULT_BRAND_ASSETS.commercialOffice,
  },
];

export const DEFAULT_COMPARISON_CASES: DrawingComparisonCase[] = [
  {
    id: 'residence-3d',
    name: '3D Isometric Residence Plan',
    code: 'DWG: SM-3D-01',
    category: 'Residential Planning',
    planImage: DEFAULT_BRAND_ASSETS.plan3dIsometric,
    planLabel: '3D Isometric Floor Plan',
    finishedImage: DEFAULT_BRAND_ASSETS.livingEclipse,
    datum: 'Vastu Oriented Layout',
    software: 'AutoCAD · SketchUp & V-Ray',
    title: 'Full Apartment Spatial Zoning & Living Realization',
    description:
      'From overhead 3D cutaway zoning to realized curved cove lighting, veined marble cladding, and living-dining flow.',
    cadSpecs: [
      'Complete room-by-room furniture placement & circulation clearance check',
      'Vastu-aligned directional zoning across living, kitchen, and bedrooms',
      '3D V-Ray lighting & texture preview approved prior to woodwork',
      'Seamless transition from cutaway spatial model to realized interior',
    ],
    annotations: [
      { x: 50, y: 26, title: 'Curved Cove Lighting', note: '3000K continuous channel over fluted paneling' },
      { x: 48, y: 58, title: 'Focal Eclipse Wall', note: 'Custom circular relief balanced over seating axis' },
      { x: 25, y: 80, title: 'Clear Circulation', note: 'Ergonomic seating and coffee table spacing' },
    ],
  },
  {
    id: 'commercial-salon',
    name: '2D Commercial Salon Plan',
    code: 'DWG: SM-CAD-02',
    category: 'Commercial Space Planning',
    planImage: DEFAULT_BRAND_ASSETS.plan2dSalon,
    planLabel: '2D AutoCAD Floor Plan',
    finishedImage: DEFAULT_BRAND_ASSETS.commercialOffice,
    datum: 'Station & HVAC Grid',
    software: 'AutoCAD 2D Drafting',
    title: '2D Workstation CAD to Realized Slatted Studio',
    description:
      'Scaled 2D furniture and service zoning translated into multi-workstation commercial cabins with linear louvered ceilings.',
    cadSpecs: [
      'Station spacing mapped for manicure, spa rooms, reception & multi-desk bays',
      'Concealed cassette AC positioning integrated inside slatted timber grid',
      'Task lighting and electrical outlets coordinated at desk level',
      'Clear customer walkthrough & staff circulation aisles',
    ],
    annotations: [
      { x: 50, y: 18, title: 'Slatted HVAC Ceiling', note: 'Linear wooden louvers framing ceiling cassette unit' },
      { x: 28, y: 60, title: 'Ergonomic Stations', note: 'Dual-row workstation depth with overhead storage' },
      { x: 50, y: 45, title: 'Daylight Axis', note: 'Unobstructed central aisle toward natural window' },
    ],
  },
  {
    id: 'kitchen-dining',
    name: 'Modular Kitchen & Vitrine',
    code: 'DWG: SM-KIT-03',
    category: 'Culinary & Joinery',
    planImage: DEFAULT_BRAND_ASSETS.plan3dIsometric,
    planLabel: '3D Spatial Zoning',
    finishedImage: DEFAULT_BRAND_ASSETS.kitchenVitrineDining,
    datum: 'Agni-Zone Alignment',
    software: 'SketchUp · 3ds Max',
    title: 'Ergonomic Work Triangle & Backlit Display Partition',
    description:
      'Spatial plan translated into a dual-tone modular kitchen anchored by an illuminated glass crockery tower and CNC screen.',
    cadSpecs: [
      'Balanced wet-dry counter separation along Vastu Agni-zone principles',
      'Backlit smoked glass crockery vitrine framing the kitchen threshold',
      'Geometric CNC-cut divider preserving airflow to dining area',
      'Flush quartz backsplash & matte stone cabinetry profiles',
    ],
    annotations: [
      { x: 75, y: 48, title: 'Backlit Vitrine Tower', note: 'Warm shelf lighting inside fluted glass doors' },
      { x: 22, y: 40, title: 'CNC Screen Divider', note: 'Semi-open visual threshold separating kitchen & dining' },
      { x: 50, y: 78, title: 'Compact Dining Flow', note: 'Seamless clearance around marble dining table' },
    ],
  },
];

export const DEFAULT_ENQUIRIES: EnquiryOrder[] = [];

export const DEFAULT_CMS_DATA: CmsStoreData = {
  siteConfig: DEFAULT_SITE_CONFIG,
  projects: DEFAULT_PROJECTS,
  services: DEFAULT_SERVICES,
  processSteps: DEFAULT_PROCESS_STEPS,
  craftDetails: DEFAULT_CRAFT_DETAILS,
  comparisonCases: DEFAULT_COMPARISON_CASES,
  enquiries: DEFAULT_ENQUIRIES,
  updatedAt: new Date().toISOString(),
};
