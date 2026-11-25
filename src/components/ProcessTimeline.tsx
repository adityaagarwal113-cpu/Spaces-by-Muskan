import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_ASSETS } from '../data/studioData';
import { useCms } from '../context/CmsContext';
import { OptimizedImage } from './OptimizedImage';

export const ProcessTimeline: React.FC = () => {
  const { processSteps, siteConfig } = useCms();
  const [activeStep, setActiveStep] = useState<number>(0);

  const visibleSteps = processSteps.filter((step) => step.status !== 'draft');
  const fallbackImages = [
    siteConfig.founderPortrait,
    BRAND_ASSETS.plan2dSalon,
    BRAND_ASSETS.plan3dIsometric,
    siteConfig.founderStudioLaptop,
    siteConfig.founderSiteVisit,
  ];

  const safeIndex = activeStep < visibleSteps.length ? activeStep : 0;
  const current = visibleSteps[safeIndex] || visibleSteps[0];

  if (!current) return null;

  const currentImage =
    current.image !== undefined
      ? current.image
      : fallbackImages[safeIndex % fallbackImages.length] || BRAND_ASSETS.plan3dIsometric;

  const objectPosClass =
    current.imagePosition === 'top'
      ? 'object-top'
      : current.imagePosition === 'bottom'
      ? 'object-bottom'
      : 'object-center';

  const eyebrow = siteConfig.processEyebrow || 'Methodology';
  const headline = siteConfig.processHeadline || 'From 2D Plan to Realized Space.';

  return (
    <section id="process" className="py-18 sm:py-24 lg:py-28 bg-[#F6F3EE] text-[#181615] border-b border-[#DFD8CE]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#DFD8CE]">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="w-6 h-[1px] bg-[#8E4A36]" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-sans font-medium">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#181615]">
              {headline}
            </h2>
          </div>

          <Link
            to="/process"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-medium text-[#8E4A36] hover:text-[#181615] transition-colors"
          >
            <span>Explore Full Process</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-2.5">
            {visibleSteps.map((step, idx) => {
              const isActive = safeIndex === idx;

              return (
                <div
                  key={step.id || `${step.number}-${idx}`}
                  onMouseEnter={() => setActiveStep(idx)}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 sm:p-5 border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#FBF9F6] border-[#8E4A36] shadow-xs pl-6'
                      : 'bg-transparent border-[#DFD8CE] hover:border-[#A38452]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs font-medium text-[#8E4A36] tabular-nums">
                        {step.number}
                      </span>
                      <h3
                        className={`font-serif text-xl sm:text-2xl transition-colors ${
                          isActive ? 'text-[#181615] font-normal' : 'text-[#4A4540] font-light'
                        }`}
                      >
                        {step.title}
                      </h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#6B655E] hidden sm:inline-block">
                      {step.subtitle}
                    </span>
                  </div>

                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="text-xs sm:text-sm text-[#4A4540] font-light mt-2.5 pt-2.5 border-t border-[#DFD8CE] leading-relaxed"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-6 aspect-[4/3] sm:h-[420px] sm:aspect-auto overflow-hidden bg-[#181615] border border-[#DFD8CE] relative shadow-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={safeIndex}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full"
              >
                <OptimizedImage
                  src={currentImage}
                  alt={current.title}
                  fallbackLabel={current.title}
                  sizes="(max-width: 1024px) 94vw, 46vw"
                  className={`w-full h-full object-cover contrast-[1.03] ${objectPosClass}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/82 via-[#181615]/15 to-transparent pointer-events-none" />

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] tracking-[0.22em] text-[#D5A38C] uppercase block">
                    Stage {current.number} · {current.subtitle}
                  </span>
                  <h4 className="font-serif text-xl sm:text-2xl text-white mt-0.5 font-light">
                    {current.title}
                  </h4>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
