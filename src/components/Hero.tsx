import React from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { MagneticButton } from './MagneticButton';
import { useEnquiry } from '../context/EnquiryContext';
import { OptimizedImage } from './OptimizedImage';

export const Hero: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const { siteConfig, projects } = useCms();

  const publishedCount = projects.filter((p) => p.status !== 'draft').length;

  return (
    <section className="relative bg-[#F6F3EE] text-[#181615] overflow-hidden flex flex-col justify-between pt-22 sm:pt-26 pb-7 px-4 sm:px-8 lg:px-12 bg-[radial-gradient(ellipse_90%_75%_at_50%_30%,#FBF9F6_0%,#EAE4DA_100%)] border-b border-[#DFD8CE]">
      {/* Subtle Architectural Proportion Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.045]">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-4 md:grid-cols-12 border-x border-[#181615]/30">
          <div className="border-r border-[#181615]/30 col-span-1 hidden md:block" />
          <div className="border-r border-[#181615]/30 col-span-2 hidden md:block" />
          <div className="border-r border-[#181615]/30 col-span-3 hidden md:block" />
          <div className="border-r border-[#181615]/30 col-span-3 hidden md:block" />
          <div className="border-r border-[#181615]/30 col-span-2 hidden md:block" />
        </div>
      </div>

      {/* LAYERED DYNAMIC HERO COMPOSITION (APPROVED DESKTOP & RESPONSIVE MOBILE DIRECTION) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center py-4 sm:py-6">
        <div className="relative w-full max-w-5xl flex items-center justify-center">
          {/* LAYER 1: MAIN HERO PHOTOGRAPHY */}
          <motion.div
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[88vw] sm:w-[76vw] md:w-[68vw] lg:w-[60vw] max-w-[860px] h-[52vh] sm:h-[56vh] md:h-[62vh] lg:h-[67vh] overflow-hidden bg-[#181615] shadow-[0_28px_70px_-20px_rgba(24,22,21,0.28)] border border-[#DFD8CE] z-10"
          >
            <OptimizedImage
              src={siteConfig.heroPrimaryImage}
              alt={`${siteConfig.name} signature interior`}
              priority
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 75vw, 860px"
              className="w-full h-full object-cover object-center contrast-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/88 via-[#181615]/28 to-transparent" />

            {/* HERO TYPOGRAPHY OVERLAY */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 md:p-12 text-white flex flex-col justify-end space-y-3 sm:space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3"
              >
                <span className="w-5 h-[1px] bg-[#D5A38C]" />
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.24em] text-[#F1ECE3] font-sans font-medium">
                  {siteConfig.heroEyebrow}
                </span>
              </motion.div>

              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="font-serif text-[34px] sm:text-5xl md:text-6xl lg:text-[68px] font-light tracking-tight text-white leading-[1.04] max-w-2xl"
                >
                  {siteConfig.heroHeadlineLine1} <br />
                  <span className="italic font-normal text-[#F6F3EE]">{siteConfig.heroHeadlineLine2}</span>
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="pt-2 sm:pt-3 flex flex-wrap items-center gap-3"
              >
                <MagneticButton strength={0.14}>
                  <button
                    type="button"
                    onClick={() => openEnquiry('Residential Interiors')}
                    className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-[#8E4A36] hover:bg-white text-white hover:text-[#181615] text-[11px] sm:text-xs uppercase tracking-[0.18em] font-medium transition-colors shadow-lg cursor-pointer whitespace-nowrap"
                  >
                    <span>{siteConfig.heroPrimaryCta}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </MagneticButton>

                <MagneticButton strength={0.1}>
                  <a
                    href="#work"
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 border border-white/45 text-white hover:bg-white/15 text-[11px] sm:text-xs uppercase tracking-[0.18em] font-medium transition-colors cursor-pointer backdrop-blur-xs whitespace-nowrap"
                  >
                    <span>{siteConfig.heroSecondaryCta}</span>
                    <span className="font-mono text-[10px] text-[#E6C5B5] tabular-nums">
                      {String(publishedCount).padStart(2, '0')}
                    </span>
                  </a>
                </MagneticButton>
              </motion.div>
            </div>
          </motion.div>

          {/* LAYER 2: SECONDARY OVERLAPPING IMAGE (Top Right) */}
          {siteConfig.heroSecondaryImage && (
            <motion.div
              initial={{ scale: 1.1, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-2 right-2 sm:top-3 sm:-right-4 lg:-right-8 w-[38vw] sm:w-[24vw] lg:w-[20vw] max-w-[164px] sm:max-w-[260px] h-[18vh] sm:h-[26vh] lg:h-[30vh] overflow-hidden bg-[#181615] shadow-[0_18px_44px_-10px_rgba(24,22,21,0.34)] border-[3px] border-[#F6F3EE] z-20 pointer-events-none"
            >
              <OptimizedImage
                src={siteConfig.heroSecondaryImage}
                alt={siteConfig.heroSecondaryTitle}
                priority
                sizes="(max-width: 640px) 40vw, 260px"
                className="w-full h-full object-cover object-center contrast-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/75 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <span className="font-serif text-[12px] sm:text-sm text-white/95 line-clamp-1">
                  {siteConfig.heroSecondaryTitle}
                </span>
              </div>
            </motion.div>
          )}

          {/* LAYER 3: DETAIL OVERLAPPING IMAGE (Bottom Left Desktop) */}
          {siteConfig.heroTertiaryImage && (
            <motion.div
              initial={{ scale: 1.1, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="hidden sm:block absolute bottom-3 -left-4 lg:-left-8 w-[23vw] lg:w-[19vw] max-w-[240px] h-[24vh] lg:h-[27vh] overflow-hidden bg-[#181615] shadow-[0_18px_44px_-10px_rgba(24,22,21,0.34)] border-[3px] border-[#F6F3EE] z-20 pointer-events-none"
            >
              <OptimizedImage
                src={siteConfig.heroTertiaryImage}
                alt={siteConfig.heroTertiaryTitle}
                priority
                sizes="240px"
                className="w-full h-full object-cover object-center contrast-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/75 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <span className="font-serif text-sm text-white/95 line-clamp-1">
                  {siteConfig.heroTertiaryTitle}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* MOBILE LAYER 3 VISUAL CONTINUATION */}
      {siteConfig.heroTertiaryImage && (
        <motion.div
          initial={{ scale: 1.08, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="sm:hidden relative z-20 -mt-5 ml-auto mr-3 mb-4 w-[48vw] h-[16vh] overflow-hidden bg-[#181615] shadow-[0_16px_36px_-8px_rgba(24,22,21,0.34)] border-[3px] border-[#F6F3EE] pointer-events-none"
        >
          <OptimizedImage
            src={siteConfig.heroTertiaryImage}
            alt={siteConfig.heroTertiaryTitle}
            priority
            sizes="48vw"
            className="w-full h-full object-cover object-center contrast-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/75 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
            <span className="font-serif text-xs text-white/95 line-clamp-1">
              {siteConfig.heroTertiaryTitle}
            </span>
          </div>
        </motion.div>
      )}

      {/* Minimal Architectural Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full pt-3.5 select-none border-t border-[#DFD8CE]"
      >
        <a
          href="#work"
          className="flex items-center gap-2.5 text-[#6B655E] hover:text-[#181615] transition-colors cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full border border-[#181615]/20 flex items-center justify-center group-hover:border-[#8E4A36] transition-colors">
            <ArrowDown className="w-3 h-3 text-[#8E4A36] group-hover:translate-y-0.5 transition-transform" />
          </div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#5B554E]">
            Explore Selected Work
          </span>
        </a>

        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-[#6B655E]">
          <span className="text-[#8E4A36] font-medium">{siteConfig.founder}</span>
          <span className="text-[#DFD8CE]" aria-hidden="true">·</span>
          <span className="hidden sm:inline text-[#181615]">2D · 3D · Vastu</span>
        </div>
      </motion.div>
    </section>
  );
};
