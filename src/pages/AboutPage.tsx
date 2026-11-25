import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, Heart, Ruler, CheckCircle, Youtube } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { PageTransition } from '../components/PageTransition';
import { SEO } from '../components/SEO';
import { OptimizedImage, ResolvedImg } from '../components/OptimizedImage';

export const AboutPage: React.FC = () => {
  const { siteConfig } = useCms();

  return (
    <PageTransition>
      <SEO
        title={`About ${siteConfig.founder} & Studio`}
        description={`Meet ${siteConfig.founder}, Interior Designer & Vastu Consultant behind ${siteConfig.name} (${siteConfig.secondaryMark}), specializing in 2D/3D interior design and turnkey spaces.`}
      />
      <div className="pt-32 pb-24 lg:pt-40 lg:pb-36 bg-[#F6F3EE] text-[#181615] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl mb-16 lg:mb-24">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-[1px] bg-[#8E4A36]" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-medium">
                About {siteConfig.name}
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#181615] leading-[1.06]">
              Bold creativity, <br />
              <span className="italic font-normal text-[#6B655E]">grounded in Vastu harmony.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#5B554E] mt-6 leading-relaxed font-light">
              {siteConfig.founderBioP1}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24 pb-20 border-b border-[#DFD8CE]">
            <div className="lg:col-span-5 relative space-y-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#181615] shadow-md border border-[#DFD8CE]">
                <OptimizedImage
                  src={siteConfig.founderPortrait}
                  alt={`${siteConfig.founder} — ${siteConfig.name}`}
                  fallbackLabel={siteConfig.founder}
                  sizes="(max-width: 1024px) 92vw, 38vw"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/85 via-[#181615]/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  {siteConfig.logoEmblem && (
                    <ResolvedImg
                      src={siteConfig.logoEmblem}
                      preferThumb
                      alt={`${siteConfig.name} emblem`}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border border-white/25 mb-3 shadow-md"
                    />
                  )}
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#D5A38C] block">
                    Founder · Interior Designer &amp; Vastu Consultant
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl text-white font-light">
                    {siteConfig.founder}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-[11px] uppercase tracking-[0.24em] text-[#8E4A36] font-medium block">
                Principal Designer &amp; Entrepreneur
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#181615] leading-tight">
                {siteConfig.founderSectionHeadline}
              </h2>
              <div className="space-y-4 text-base text-[#4A4540] leading-relaxed font-light">
                <p>{siteConfig.founderBioP1}</p>
                <p>{siteConfig.founderBioP2}</p>
                <p className="text-sm text-[#6B655E]">
                  Software fluency across AutoCAD, SketchUp &amp; V-Ray, and 3ds Max pairs with directional Vastu knowledge and direct site monitoring during construction.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-5">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#8E4A36] hover:bg-[#181615] text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
                >
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] uppercase tracking-[0.18em] font-medium text-[#6B655E] hover:text-[#8E4A36] transition-colors"
                >
                  Instagram {siteConfig.instagramHandle}
                </a>
                <a
                  href={siteConfig.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-medium text-[#6B655E] hover:text-[#8E4A36] transition-colors"
                >
                  <Youtube className="w-4 h-4 text-[#8E4A36]" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mb-24">
            <div className="max-w-2xl mb-12">
              <span className="text-[11px] uppercase tracking-[0.24em] text-[#8E4A36] font-medium block mb-2">
                Core Pillars
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#181615]">
                How Every Space Comes Together
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-[#FBF9F6] border border-[#DFD8CE] space-y-4">
                <Heart className="w-5 h-5 text-[#8E4A36]" />
                <h4 className="font-serif text-2xl font-light text-[#181615]">
                  Personalization &amp; Character
                </h4>
                <p className="text-xs sm:text-sm text-[#4A4540] leading-relaxed font-light">
                  Each room reflects its occupants—from kids arch bedrooms and botanical murals to warm executive studies and calm dining zones.
                </p>
              </div>

              <div className="p-8 bg-[#FBF9F6] border border-[#DFD8CE] space-y-4">
                <Ruler className="w-5 h-5 text-[#8E4A36]" />
                <h4 className="font-serif text-2xl font-light text-[#181615]">
                  2D CAD &amp; 3D Clarity
                </h4>
                <p className="text-xs sm:text-sm text-[#4A4540] leading-relaxed font-light">
                  AutoCAD working drawings paired with SketchUp, V-Ray, and 3ds Max views eliminate surprises on site for carpenters and clients alike.
                </p>
              </div>

              <div className="p-8 bg-[#FBF9F6] border border-[#DFD8CE] space-y-4">
                <Compass className="w-5 h-5 text-[#8E4A36]" />
                <h4 className="font-serif text-2xl font-light text-[#181615]">
                  Vastu Shastra Balance
                </h4>
                <p className="text-xs sm:text-sm text-[#4A4540] leading-relaxed font-light">
                  Spaces thoughtfully zoned around directional orientation, sunlight paths, and natural airflow without sacrificing modern aesthetics.
                </p>
              </div>
            </div>
          </div>

          {/* Recognition & On-Site Supervision Showcase */}
          <div className="p-8 sm:p-12 lg:p-16 bg-[#181615] text-[#F6F3EE]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-[11px] uppercase tracking-[0.24em] text-[#D5A38C]">
                  Entrepreneurial Journey · Work in Progress
                </span>
                <h3 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                  From 3D render to active site execution.
                </h3>
                <p className="text-sm text-[#CFC8BE] leading-relaxed font-light">
                  Every approved 3D perspective is backed by on-site coordination—checking woodwork carcasses, scalloped panels, false ceiling drops, and lighting tones firsthand.
                </p>
                <div className="space-y-2.5 text-xs text-[#DFD8CE] pt-2">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#D5A38C] shrink-0" />
                    <span>Founder-led studio practice ({siteConfig.secondaryMark} · {siteConfig.name})</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#D5A38C] shrink-0" />
                    <span>Regular work-in-progress site inspections and craftsman guidance</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#D5A38C] shrink-0" />
                    <span>2D AutoCAD layouts and photorealistic 3D V-Ray previews</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="h-64 sm:h-80 overflow-hidden border border-white/10 bg-[#0E0D0C]">
                  <OptimizedImage
                    src={siteConfig.awardPlaque}
                    alt={`${siteConfig.secondaryMark} ${siteConfig.founder} Entrepreneur Award Plaque`}
                    fallbackLabel={siteConfig.secondaryMark}
                    sizes="(max-width: 1024px) 44vw, 24vw"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="h-64 sm:h-80 overflow-hidden border border-white/10 bg-[#0E0D0C]">
                  <OptimizedImage
                    src={siteConfig.founderSiteVisit}
                    alt={`${siteConfig.founder} supervising carpentry work on site`}
                    fallbackLabel={siteConfig.founder}
                    sizes="(max-width: 1024px) 44vw, 24vw"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-16 border-t border-[#DFD8CE] text-center max-w-2xl mx-auto space-y-6">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#8E4A36] font-medium block">
              Begin a Conversation
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#181615]">
              Ready to plan your home or commercial space?
            </h3>
            <p className="text-sm text-[#5B554E] leading-relaxed font-light">
              Connect with {siteConfig.founder} for 2D/3D spatial design, Vastu consultation, or turnkey interior commissions.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#8E4A36] text-white hover:bg-[#181615] text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
              >
                <span>Initiate a Project</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
