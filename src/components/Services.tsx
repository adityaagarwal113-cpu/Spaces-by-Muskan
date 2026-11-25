import React, { useState } from 'react';
import { ArrowUpRight, Compass, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { useEnquiry } from '../context/EnquiryContext';
import { OptimizedImage } from './OptimizedImage';

export const Services: React.FC = () => {
  const { services, siteConfig } = useCms();
  const { openEnquiry } = useEnquiry();
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [mobileOpenIndex, setMobileOpenIndex] = useState<number | null>(0);

  const activeServices = services.filter((s) => s.status !== 'draft');
  const activeService = activeServices[hoveredIndex] || activeServices[0];

  if (!activeService) return null;

  const eyebrow = siteConfig.servicesEyebrow || 'Disciplines';
  const headline = siteConfig.servicesHeadline || '2D Plans, 3D Design & Vastu.';
  const subtitle =
    siteConfig.servicesSubtitle ||
    'End-to-end residential and commercial interior architecture from initial AutoCAD layouts and Vastu alignment through SketchUp & V-Ray renders and site execution.';

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#FBF9F6] text-[#181615] border-b border-[#DFD8CE]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14 pb-8 border-b border-[#DFD8CE]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-[1px] bg-[#8E4A36]" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-sans font-medium">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-light text-[#181615] leading-[1.08]">
              {headline}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#5B554E] max-w-sm font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* DESKTOP EDITORIAL INDEX WITH FRAMED PHOTOGRAPHY PLATE */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 divide-y divide-[#DFD8CE]">
            {activeServices.map((service, index) => {
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={service.id || service.number}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onClick={() => openEnquiry(service.title)}
                  className={`py-6 transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                    isHovered ? 'pl-3 text-[#8E4A36]' : 'text-[#181615]'
                  }`}
                >
                  <div className="flex items-baseline gap-6">
                    <span className="font-mono text-xs font-medium tracking-wider text-[#8E4A36] tabular-nums">
                      {service.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-serif text-2xl xl:text-[28px] font-light tracking-wide group-hover:text-[#8E4A36] transition-colors">
                          {service.title}
                        </h3>
                        {service.vastuIncluded && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-[#8E4A36]/90">
                            <Compass className="w-3 h-3" /> Vastu
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#6B655E] font-light block mt-1">
                        {service.tagline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-[#8E4A36] opacity-0 group-hover:opacity-100 transition-opacity">
                      Inquire
                    </span>
                    <div className="w-8 h-8 rounded-full border border-[#DFD8CE] flex items-center justify-center text-[#181615] group-hover:border-[#8E4A36] group-hover:bg-[#8E4A36] group-hover:text-white transition-all">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="aspect-[4/5] w-full overflow-hidden relative bg-[#181615] border border-[#DFD8CE] shadow-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={hoveredIndex}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  <OptimizedImage
                    src={activeService.image}
                    alt={activeService.title}
                    fallbackLabel={activeService.title}
                    sizes="38vw"
                    className="w-full h-full object-cover object-center contrast-[1.03]"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-5 bg-[#F6F3EE] border border-[#DFD8CE] space-y-2.5">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#8E4A36]">
                <span>Discipline {activeService.number}</span>
                <span>{activeService.tagline}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A4540] font-light leading-relaxed">
                {activeService.description}
              </p>
              {activeService.deliverables.length > 0 && (
                <p className="text-[11px] text-[#6B655E] pt-2 border-t border-[#DFD8CE] leading-relaxed">
                  {activeService.deliverables.join(' · ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE ACCORDION */}
        <div className="lg:hidden divide-y divide-[#DFD8CE]">
          {activeServices.map((service, index) => {
            const isOpen = mobileOpenIndex === index;

            return (
              <div key={service.id || service.number} className="py-4">
                <button
                  type="button"
                  onClick={() => setMobileOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left py-2 cursor-pointer"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs font-medium text-[#8E4A36] tabular-nums">
                      {service.number}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl text-[#181615]">
                        {service.title}
                      </h3>
                      {service.vastuIncluded && (
                        <span className="text-[10px] uppercase tracking-[0.18em] text-[#8E4A36] block mt-0.5">
                          Vastu Aligned
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-[#8E4A36] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 pb-4 space-y-4"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#181615] border border-[#DFD8CE]">
                      <OptimizedImage
                        src={service.image}
                        alt={service.title}
                        fallbackLabel={service.title}
                        sizes="92vw"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    <p className="text-xs text-[#4A4540] font-light leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {service.deliverables.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-[11px] text-[#6B655E]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8E4A36] shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => openEnquiry(service.title)}
                      className="w-full py-3 bg-[#181615] hover:bg-[#8E4A36] text-white text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Inquire About {service.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
