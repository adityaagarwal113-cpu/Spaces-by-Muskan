import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Hero } from '../components/Hero';
import { SignatureShowcase } from '../components/SignatureShowcase';
import { StudioIntro } from '../components/StudioIntro';
import { Services } from '../components/Services';
import { SiteToSpaceComparison } from '../components/SiteToSpaceComparison';
import { ProcessTimeline } from '../components/ProcessTimeline';
import { AboutFounder } from '../components/AboutFounder';
import { AnnouncementTicker } from '../components/AnnouncementTicker';
import { PageTransition } from '../components/PageTransition';
import { SEO } from '../components/SEO';
import { useCms } from '../context/CmsContext';
import { useEnquiry } from '../context/EnquiryContext';
import { OptimizedImage } from '../components/OptimizedImage';
import { DEFAULT_HOMEPAGE_SECTIONS } from '../data/defaultCmsData';
import { HomepageSectionConfig } from '../types';

export const HomePage: React.FC = () => {
  const { siteConfig } = useCms();
  const { openEnquiry } = useEnquiry();

  const handleWhatsAppDirect = () => {
    const message = encodeURIComponent(
      `Hello ${siteConfig.founder.split(' ')[0]}, I am reaching out from the ${siteConfig.name} website regarding an interior design project.`
    );
    const rawNumber = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl =
      rawNumber && rawNumber.length >= 7
        ? `https://wa.me/${rawNumber}?text=${message}`
        : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const sections: HomepageSectionConfig[] =
    siteConfig.homepageSections && siteConfig.homepageSections.length > 0
      ? siteConfig.homepageSections
      : DEFAULT_HOMEPAGE_SECTIONS;

  const renderCustomSection = (sec: HomepageSectionConfig) => {
    const isDark = sec.customTheme === 'dark';
    const isLinen = sec.customTheme === 'linen';
    const bgClass = isDark
      ? 'bg-[#181615] text-[#F6F3EE] border-[#2B2724]'
      : isLinen
      ? 'bg-[#EDE8DF] text-[#181615] border-[#DFD8CE]'
      : 'bg-[#FBF9F6] text-[#181615] border-[#DFD8CE]';

    const hasImage = Boolean(sec.customImage);

    return (
      <section key={sec.id} className={`py-18 sm:py-24 border-b ${bgClass}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className={`grid grid-cols-1 ${hasImage ? 'lg:grid-cols-12 gap-10 lg:gap-14 items-center' : ''}`}>
            <div className={`${hasImage ? 'lg:col-span-7' : 'max-w-3xl'} space-y-5`}>
              {sec.customEyebrow && (
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-[1px] ${isDark ? 'bg-[#D5A38C]' : 'bg-[#8E4A36]'}`} />
                  <span
                    className={`text-[11px] uppercase tracking-[0.26em] font-medium ${
                      isDark ? 'text-[#D5A38C]' : 'text-[#8E4A36]'
                    }`}
                  >
                    {sec.customEyebrow}
                  </span>
                </div>
              )}

              {sec.customHeadline && (
                <h2
                  className={`font-serif text-3xl sm:text-5xl font-light leading-[1.08] ${
                    isDark ? 'text-white' : 'text-[#181615]'
                  }`}
                >
                  {sec.customHeadline}
                </h2>
              )}

              {sec.customBody && (
                <p
                  className={`text-sm sm:text-base font-light leading-relaxed max-w-2xl ${
                    isDark ? 'text-[#CFC8BE]' : 'text-[#4A4540]'
                  }`}
                >
                  {sec.customBody}
                </p>
              )}

              {sec.customCtaLabel && (
                <div className="pt-2">
                  {sec.customCtaOpensEnquiry ? (
                    <button
                      type="button"
                      onClick={() => openEnquiry(sec.label || 'Residential Interiors')}
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#8E4A36] hover:bg-[#181615] text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                    >
                      <span>{sec.customCtaLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      to={sec.customCtaLink || '/contact'}
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#8E4A36] hover:bg-[#181615] text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
                    >
                      <span>{sec.customCtaLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {hasImage && (
              <div className="lg:col-span-5">
                <div className="aspect-[4/3] overflow-hidden border border-[#DFD8CE]/40 bg-[#181615] shadow-md">
                  <OptimizedImage
                    src={sec.customImage}
                    alt={sec.customHeadline || sec.label}
                    sizes="(max-width: 1024px) 92vw, 40vw"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderClosingCta = (key: string) => (
    <section
      key={key}
      id="home-contact-cta"
      className="relative py-24 sm:py-32 lg:py-40 bg-[#181615] text-[#F6F3EE] overflow-hidden border-t border-[#2B2724]"
    >
      {siteConfig.finalCtaImage && (
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src={siteConfig.finalCtaImage}
            alt={`Signature lounge by ${siteConfig.name}`}
            sizes="100vw"
            className="w-full h-full object-cover object-center brightness-[0.34] contrast-[1.06]"
          />
        </div>
      )}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#181615] via-[#181615]/60 to-[#181615]/80 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#D5A38C] block">
            {siteConfig.name}
          </span>

          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-white leading-[1.06]">
            {siteConfig.finalCtaHeadline1} <br />
            <span className="italic font-normal text-[#DFD8CE]">
              {siteConfig.finalCtaHeadline2}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-[#CFC8BE] max-w-lg mx-auto font-light leading-relaxed">
            {siteConfig.finalCtaDescription}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8E4A36] text-white hover:bg-white hover:text-[#181615] text-[11px] uppercase tracking-[0.22em] font-medium transition-colors shadow-xl cursor-pointer"
            >
              <span>Start a Project</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleWhatsAppDirect}
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/40 text-white hover:border-white hover:bg-white/10 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors backdrop-blur-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );

  return (
    <PageTransition>
      <SEO
        title="Interior Design & Vastu Studio"
        description={`Residential & commercial interiors, Vastu consultation, 2D AutoCAD planning, and SketchUp & V-Ray 3D visualization by ${siteConfig.name} (${siteConfig.founder}).`}
      />

      {sections
        .filter((sec) => sec.visible)
        .map((sec) => {
          switch (sec.type) {
            case 'hero':
              return (
                <React.Fragment key={sec.id}>
                  <Hero />
                  <AnnouncementTicker position="below_hero" />
                </React.Fragment>
              );
            case 'work':
              return <SignatureShowcase key={sec.id} />;
            case 'studio':
              return <StudioIntro key={sec.id} />;
            case 'services':
              return <Services key={sec.id} />;
            case 'comparison':
              return <SiteToSpaceComparison key={sec.id} />;
            case 'process':
              return <ProcessTimeline key={sec.id} />;
            case 'founder':
              return <AboutFounder key={sec.id} />;
            case 'closingCta':
              return renderClosingCta(sec.id);
            case 'custom':
              return renderCustomSection(sec);
            default:
              return null;
          }
        })}
    </PageTransition>
  );
};
