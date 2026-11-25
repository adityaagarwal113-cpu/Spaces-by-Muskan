import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { OptimizedImage } from './OptimizedImage';

export const StudioIntro: React.FC = () => {
  const { siteConfig } = useCms();

  return (
    <section id="studio" className="py-18 sm:py-24 lg:py-28 bg-[#EDE8DF] text-[#181615] border-b border-[#DFD8CE]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-6 h-[1px] bg-[#8E4A36]" />
          <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-sans font-medium">
            {siteConfig.studioIntroEyebrow}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: '100%', opacity: 0 }}
                whileInView={{ y: '0%', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-light leading-[1.1] text-[#181615]"
              >
                {siteConfig.studioIntroHeadline1} <br />
                <span className="italic font-normal text-[#8E4A36]">
                  {siteConfig.studioIntroHeadline2}
                </span>
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 max-w-xl text-[#4A4540] text-sm sm:text-base font-light leading-relaxed"
            >
              <p>{siteConfig.studioIntroParagraph1}</p>
              <p className="text-xs sm:text-sm text-[#6B655E] leading-relaxed">
                {siteConfig.studioIntroParagraph2}
              </p>

              <div className="pt-3">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-medium text-[#8E4A36] hover:text-[#181615] transition-colors"
                >
                  <span>About {siteConfig.founder.split(' ')[0]} &amp; Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ clipPath: 'inset(6% 6% 6% 6%)', opacity: 0 }}
              whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-[#181615] border border-[#DFD8CE] shadow-md">
                <OptimizedImage
                  src={siteConfig.studioIntroImage}
                  alt={`${siteConfig.founder} working on 3D spatial layouts`}
                  fallbackLabel={siteConfig.founder}
                  sizes="(max-width: 1024px) 92vw, 38vw"
                  className="w-full h-full object-cover object-top contrast-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#6B655E]">
                <span>{siteConfig.founder}</span>
                <span className="text-[#8E4A36]">2D CAD · 3D V-Ray</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
