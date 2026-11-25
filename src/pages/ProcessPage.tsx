import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowUpRight, Compass, Eye, Sparkles, Layers, Hammer, CheckCircle2 } from 'lucide-react';
import { BRAND_ASSETS } from '../data/studioData';
import { useCms } from '../context/CmsContext';
import { PageTransition } from '../components/PageTransition';
import { SEO } from '../components/SEO';
import { OptimizedImage } from '../components/OptimizedImage';

export const ProcessPage: React.FC = () => {
  const { processSteps, siteConfig } = useCms();
  const [activeStep, setActiveStep] = useState(0);

  const visibleSteps = processSteps.filter((step) => step.status !== 'draft');
  const stepIcons = [Compass, Eye, Sparkles, Layers, Hammer];
  const fallbackImages = [
    siteConfig.founderPortrait,
    BRAND_ASSETS.plan2dSalon,
    BRAND_ASSETS.plan3dIsometric,
    siteConfig.founderStudioLaptop,
    siteConfig.founderSiteVisit,
  ];

  const safeStep = activeStep < visibleSteps.length ? activeStep : 0;
  const activeProcess = visibleSteps[safeStep];

  const activeImg =
    activeProcess?.image !== undefined
      ? activeProcess.image
      : fallbackImages[safeStep % fallbackImages.length] || BRAND_ASSETS.plan3dIsometric;

  const objectPosClass =
    activeProcess?.imagePosition === 'top'
      ? 'object-top'
      : activeProcess?.imagePosition === 'bottom'
      ? 'object-bottom'
      : 'object-center';

  const activities = activeProcess?.activities && activeProcess.activities.length > 0
    ? activeProcess.activities
    : [activeProcess?.focus || 'Detailed design review and coordination'].filter(Boolean);

  return (
    <PageTransition>
      <SEO
        title="Methodology & Workflow"
        description={`Explore the studio process at ${siteConfig.name}: brief discovery, 2D AutoCAD planning, Vastu alignment, 3D V-Ray renders, and site execution.`}
      />
      <div className="pt-32 pb-24 lg:pt-40 lg:pb-36 bg-[#F6F3EE] min-h-screen text-[#181615]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl mb-16 lg:mb-20">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-[1px] bg-[#8E4A36]" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-medium">
                {siteConfig.processEyebrow || 'Design Methodology'}
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#181615] leading-[1.06]">
              From 2D sketch to space. <br />
              <span className="italic font-normal text-[#6B655E]">A structured workflow.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#5B554E] mt-6 leading-relaxed font-light">
              Every residence or commercial project follows a disciplined pathway combining Vastu guidance, AutoCAD working drawings, SketchUp &amp; V-Ray 3D visualization, and site supervision.
            </p>
          </div>

          <div
            className="flex md:grid gap-3 sm:gap-4 overflow-x-auto pb-3 md:pb-0 mb-12"
            style={{
              gridTemplateColumns: `repeat(${Math.min(Math.max(visibleSteps.length, 1), 6)}, minmax(0, 1fr))`,
            }}
          >
            {visibleSteps.map((step, idx) => {
              const Icon = stepIcons[idx % stepIcons.length] || Compass;
              const isSelected = safeStep === idx;
              return (
                <button
                  key={step.id || `${step.number}-${idx}`}
                  onClick={() => setActiveStep(idx)}
                  className={`min-w-[170px] md:min-w-0 p-4 sm:p-5 text-left transition-all duration-300 border cursor-pointer shrink-0 md:shrink ${
                    isSelected
                      ? 'bg-[#181615] text-[#FBF9F6] border-[#181615] shadow-sm'
                      : 'bg-[#FBF9F6] text-[#181615] border-[#DFD8CE] hover:border-[#8E4A36]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-mono text-xs font-medium tabular-nums ${
                        isSelected ? 'text-[#D5A38C]' : 'text-[#8E4A36]'
                      }`}
                    >
                      {step.number}
                    </span>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D5A38C]' : 'text-[#6B655E]'}`} />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-light mb-1">
                    {step.title}
                  </h3>
                  <span
                    className={`text-[10px] sm:text-xs block truncate ${
                      isSelected ? 'text-[#DFD8CE]' : 'text-[#6B655E]'
                    }`}
                  >
                    {step.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {activeProcess && (
            <div className="bg-[#FBF9F6] p-8 sm:p-12 border border-[#DFD8CE] shadow-xs">
              <AnimatePresence mode="wait">
                <motion.div
                  key={safeStep}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                >
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#8E4A36] font-medium tabular-nums">
                        PHASE {activeProcess.number}
                      </span>
                      <span className="text-[#DFD8CE]" aria-hidden="true">·</span>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#6B655E]">
                        {activeProcess.subtitle}
                      </span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl text-[#181615] font-light leading-tight">
                      {activeProcess.title}
                      {activeProcess.actionHeadline ? `: ${activeProcess.actionHeadline}` : ''}
                    </h2>

                    <p className="text-base text-[#4A4540] leading-relaxed font-light">
                      {activeProcess.description}
                    </p>

                    <div className="space-y-3 pt-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#8E4A36] font-medium block">
                        Core Phase Actions
                      </span>
                      <div className="space-y-2">
                        {activities.map((act) => (
                          <div key={act} className="flex items-start gap-2.5 text-xs text-[#262320]">
                            <CheckCircle2 className="w-4 h-4 text-[#8E4A36] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(activeProcess.stageOutput || activeProcess.focus) && (
                      <div className="p-4 bg-[#F6F3EE] border border-[#DFD8CE] text-xs text-[#4A4540]">
                        <span className="font-medium text-[#181615] block mb-1">Stage Output</span>
                        {activeProcess.stageOutput || activeProcess.focus}
                      </div>
                    )}

                    <div className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={safeStep === 0}
                          onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 border border-[#DFD8CE] text-[11px] uppercase tracking-[0.16em] font-medium text-[#181615] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#EDE8DF] cursor-pointer"
                        >
                          Previous Phase
                        </button>
                        <button
                          disabled={safeStep === visibleSteps.length - 1}
                          onClick={() =>
                            setActiveStep((prev) => Math.min(visibleSteps.length - 1, prev + 1))
                          }
                          className="px-4 py-2 bg-[#181615] text-[#FBF9F6] text-[11px] uppercase tracking-[0.16em] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8E4A36] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Next Phase</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Link
                        to="/contact"
                        className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-medium text-[#8E4A36] hover:text-[#181615]"
                      >
                        <span>Start Your Project</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 h-[360px] sm:h-[440px] overflow-hidden bg-[#181615] border border-[#DFD8CE] shadow-sm relative">
                    <OptimizedImage
                      src={activeImg}
                      alt={`${activeProcess.title} stage`}
                      fallbackLabel={activeProcess.title}
                      sizes="(max-width: 1024px) 92vw, 38vw"
                      className={`w-full h-full object-cover ${objectPosClass}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-5 left-5 right-5 text-white text-xs">
                      <span className="font-mono text-[#D5A38C] block tabular-nums">
                        STAGE {activeProcess.number}
                      </span>
                      <span className="font-serif text-xl font-light">{activeProcess.title}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
