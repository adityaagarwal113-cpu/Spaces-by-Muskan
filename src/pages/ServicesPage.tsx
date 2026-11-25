import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { PageTransition } from '../components/PageTransition';
import { SEO } from '../components/SEO';
import { OptimizedImage } from '../components/OptimizedImage';

export const ServicesPage: React.FC = () => {
  const { services, siteConfig } = useCms();
  const [activeTab, setActiveTab] = useState(0);

  const activeServices = services.filter((s) => s.status !== 'draft');
  const safeTab = activeTab < activeServices.length ? activeTab : 0;
  const currentService = activeServices[safeTab] || activeServices[0];

  return (
    <PageTransition>
      <SEO
        title="Services & Vastu Consultancy"
        description={`Residential Interiors, Commercial Workspaces, Vastu Consultation, 2D AutoCAD Drafting, 3D SketchUp & V-Ray Visualization, and Site Execution by ${siteConfig.name}.`}
      />
      <div className="pt-32 pb-24 lg:pt-40 lg:pb-36 bg-[#F6F3EE] text-[#181615] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl mb-16 lg:mb-24">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-[1px] bg-[#8E4A36]" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-medium">
                Studio Capabilities
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#181615] leading-[1.06]">
              2D precision, 3D clarity, <br />
              <span className="italic font-normal text-[#6B655E]">and Vastu-aligned spaces.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#5B554E] mt-6 leading-relaxed font-light">
              {siteConfig.name} delivers end-to-end residential and commercial interior architecture—combining Vastu Shastra consultancy with AutoCAD working plans, SketchUp &amp; V-Ray renders, and dedicated site coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-24">
            <div className="lg:col-span-4 space-y-2 border-r-0 lg:border-r border-[#DFD8CE] pr-0 lg:pr-8">
              {activeServices.map((srv, index) => {
                const isActive = safeTab === index;
                return (
                  <button
                    key={srv.id || srv.number}
                    onClick={() => {
                      setActiveTab(index);
                      if (window.innerWidth < 1024) {
                        const el = document.getElementById('service-detail-showcase');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`w-full text-left p-4 sm:p-5 transition-all duration-300 flex items-center justify-between cursor-pointer border ${
                      isActive
                        ? 'bg-[#181615] text-[#FBF9F6] border-[#181615] shadow-sm'
                        : 'bg-[#FBF9F6] text-[#181615] border-[#DFD8CE] hover:bg-[#EDE8DF]'
                    }`}
                  >
                    <div className="flex items-baseline gap-4">
                      <span
                        className={`font-mono text-xs font-medium tabular-nums ${
                          isActive ? 'text-[#D5A38C]' : 'text-[#8E4A36]'
                        }`}
                      >
                        {srv.number}
                      </span>
                      <span className="font-serif text-lg sm:text-xl font-light">
                        {srv.title}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-[#D5A38C] translate-x-1' : 'text-[#6B655E]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {currentService && (
              <div
                id="service-detail-showcase"
                className="lg:col-span-8 bg-[#FBF9F6] p-6 sm:p-12 border border-[#DFD8CE]"
              >
                <motion.div
                  key={safeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#8E4A36] font-medium tabular-nums">
                        DISCIPLINE {currentService.number}
                      </span>
                      <span className="text-[#DFD8CE]" aria-hidden="true">·</span>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#6B655E]">
                        {currentService.tagline}
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#181615] font-light">
                      {currentService.title}
                    </h2>
                  </div>

                  <div className="h-64 sm:h-80 w-full overflow-hidden bg-[#EDE8DF] border border-[#DFD8CE]">
                    <OptimizedImage
                      src={currentService.image}
                      alt={currentService.title}
                      fallbackLabel={currentService.title}
                      sizes="(max-width: 1024px) 92vw, 60vw"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <p className="text-base sm:text-lg text-[#4A4540] leading-relaxed font-light">
                    {currentService.description}
                  </p>

                  <div className="pt-4 border-t border-[#DFD8CE]">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#8E4A36] font-medium block mb-4">
                      Key Deliverables &amp; Documentation
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentService.deliverables.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2.5 text-xs text-[#262320] p-3.5 bg-[#F6F3EE] border border-[#DFD8CE]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#8E4A36] shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/contact?service=${encodeURIComponent(currentService.title)}`}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#8E4A36] hover:bg-[#181615] text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
                    >
                      <span>Inquire About {currentService.title}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          <div className="p-8 sm:p-12 bg-[#181615] text-[#F6F3EE] text-center max-w-4xl mx-auto space-y-4">
            <Compass className="w-6 h-6 text-[#D5A38C] mx-auto" />
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-white">
              Every project bridges Vastu alignment, 3D visual clarity, and site craftsmanship.
            </h3>
            <p className="text-xs sm:text-sm text-[#CFC8BE] font-light max-w-xl mx-auto leading-relaxed">
              From AutoCAD residential plans and 2D salon/commercial workstation zoning to full carpentry execution.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
