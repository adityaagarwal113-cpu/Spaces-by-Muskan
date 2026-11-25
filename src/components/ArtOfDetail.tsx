import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { CRAFT_DETAILS, BRAND_ASSETS } from '../data/studioData';
import { ResolvedImg } from './OptimizedImage';

interface DetailMoment {
  number: string;
  discipline: string;
  material: string;
  title: string;
  description: string;
  image: string;
  widthClass: string;
  heightClass: string;
}

const DETAIL_MOMENTS: DetailMoment[] = [
  {
    number: '01',
    discipline: CRAFT_DETAILS[0].category.toUpperCase(),
    material: 'CNC Sculpted Flush Door',
    title: CRAFT_DETAILS[0].title,
    description: CRAFT_DETAILS[0].description,
    image: CRAFT_DETAILS[0].image,
    widthClass: 'w-[320px] sm:w-[380px] lg:w-[420px]',
    heightClass: 'h-[360px] sm:h-[420px] lg:h-[460px]',
  },
  {
    number: '02',
    discipline: CRAFT_DETAILS[1].category.toUpperCase(),
    material: 'Curved Cove & Statuario',
    title: CRAFT_DETAILS[1].title,
    description: CRAFT_DETAILS[1].description,
    image: CRAFT_DETAILS[1].image,
    widthClass: 'w-[280px] sm:w-[340px] lg:w-[380px]',
    heightClass: 'h-[320px] sm:h-[380px] lg:h-[420px]',
  },
  {
    number: '03',
    discipline: CRAFT_DETAILS[2].category.toUpperCase(),
    material: 'Gloss Walnut Partition',
    title: CRAFT_DETAILS[2].title,
    description: CRAFT_DETAILS[2].description,
    image: CRAFT_DETAILS[2].image,
    widthClass: 'w-[360px] sm:w-[420px] lg:w-[480px]',
    heightClass: 'h-[340px] sm:h-[400px] lg:h-[440px]',
  },
  {
    number: '04',
    discipline: CRAFT_DETAILS[3].category.toUpperCase(),
    material: 'Slatted Louver Ceiling',
    title: CRAFT_DETAILS[3].title,
    description: CRAFT_DETAILS[3].description,
    image: CRAFT_DETAILS[3].image,
    widthClass: 'w-[300px] sm:w-[360px] lg:w-[400px]',
    heightClass: 'h-[360px] sm:h-[420px] lg:h-[460px]',
  },
  {
    number: '05',
    discipline: 'BESPOKE MILLWORK',
    material: 'Fluted Oak & Relief Carving',
    title: 'Palm Fan Sculpted Feature Wall',
    description: 'Three-dimensional fan relief geometry paired with warm veneer nightstands and recessed bedside sconces.',
    image: BRAND_ASSETS.bedroomPalmRelief,
    widthClass: 'w-[290px] sm:w-[350px] lg:w-[390px]',
    heightClass: 'h-[330px] sm:h-[390px] lg:h-[430px]',
  },
  {
    number: '06',
    discipline: 'ON-SITE MONITORING',
    material: 'Work-in-Progress Craft',
    title: 'Direct Carpentry Site Supervision',
    description: 'Regular walkthroughs verifying millimeter dimensions, veneer matching, and false-ceiling alignments.',
    image: BRAND_ASSETS.founderSiteVisit,
    widthClass: 'w-[320px] sm:w-[380px] lg:w-[420px]',
    heightClass: 'h-[350px] sm:h-[410px] lg:h-[450px]',
  },
];

export const ArtOfDetail: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  const xTransform = useTransform(scrollYProgress, [0, 1], ['0%', '-48%']);

  return (
    <section className="bg-[#161617] text-[#FAF9F7] border-b border-[#242426]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-28 pb-10 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.28em] text-[#E6635C] font-mono block">
              05 · ARCHITECTURAL CRAFT
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-tight">
              &ldquo;Signature details define the space.&rdquo;
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 max-w-sm font-light leading-relaxed">
            From CNC ripple statement doors and fluted acoustic partitions to recessed warm LED lighting channels engineered on site.
          </p>
        </div>
      </div>

      {/* DESKTOP HORIZONTAL FILMSTRIP */}
      <div ref={targetRef} className="hidden lg:block relative h-[160vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <motion.div style={{ x: xTransform }} className="flex items-center gap-8 pl-12 pr-24">
            {DETAIL_MOMENTS.map((item) => (
              <div
                key={item.number}
                className={`${item.widthClass} shrink-0 flex flex-col justify-between p-5 bg-[#1F1F21] border border-white/10 rounded-xs hover:border-[#B9322C] transition-colors`}
              >
                <div className={`${item.heightClass} w-full overflow-hidden rounded-xs bg-black relative mb-4`}>
                  <ResolvedImg
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center filter contrast-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-[9px] text-[#E6635C] uppercase tracking-widest bg-black/65 px-2 py-0.5 rounded-xs border border-white/10">
                      {item.number} / 06
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-mono text-[#E6635C] uppercase tracking-wider block">
                      {item.discipline}
                    </span>
                    <span className="font-serif text-base text-white line-clamp-1">
                      {item.material}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl text-white font-light">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* MOBILE FILMSTRIP */}
      <div className="lg:hidden py-10 px-6 sm:px-8">
        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
          {DETAIL_MOMENTS.map((item) => (
            <div
              key={item.number}
              className="w-[82vw] sm:w-[360px] shrink-0 snap-center p-4 bg-[#1F1F21] border border-white/10 rounded-xs flex flex-col justify-between"
            >
              <div className="h-64 sm:h-72 w-full overflow-hidden rounded-xs bg-black relative mb-4">
                <ResolvedImg
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center filter contrast-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="font-mono text-[9px] text-[#E6635C] uppercase tracking-widest bg-black/65 px-2 py-0.5 rounded-xs border border-white/10">
                    {item.number} / 06
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-mono text-[#E6635C] uppercase tracking-wider block">
                    {item.discipline}
                  </span>
                  <span className="font-serif text-sm text-white line-clamp-1">
                    {item.material}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-lg text-white font-light">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-300 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
            ← Swipe to explore architectural details →
          </span>
        </div>
      </div>
    </section>
  );
};
