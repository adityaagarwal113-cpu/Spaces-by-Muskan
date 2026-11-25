import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { OptimizedImage } from './OptimizedImage';

export const AboutFounder: React.FC = () => {
  const { siteConfig } = useCms();

  return (
    <section id="about" className="py-20 lg:py-28 bg-[#FBF9F6] text-[#181615] border-b border-[#DFD8CE]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <motion.div
              initial={{ clipPath: 'inset(8% 0 0 0)', opacity: 0.85 }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)', opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] overflow-hidden bg-[#181615] shadow-lg border border-[#DFD8CE]"
            >
              <OptimizedImage
                src={siteConfig.founderPortrait}
                alt={`${siteConfig.founder} — Principal Designer & Vastu Consultant`}
                fallbackLabel={siteConfig.founder}
                sizes="(max-width: 1024px) 92vw, 38vw"
                className="w-full h-full object-cover object-top contrast-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/85 via-[#181615]/15 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] tracking-[0.22em] text-[#D5A38C] uppercase block">
                  Principal Designer &amp; Vastu Consultant
                </span>
                <span className="font-serif text-2xl sm:text-3xl text-white font-light block">
                  {siteConfig.founder}
                </span>
                <span className="text-xs text-[#DFD8CE] font-light block">
                  {siteConfig.name} · {siteConfig.secondaryMark}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[1px] bg-[#8E4A36]" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-sans font-medium">
                The Principal
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#181615] leading-[1.1]">
              {siteConfig.founderSectionHeadline}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#4A4540] font-light leading-relaxed max-w-xl">
              <p>{siteConfig.founderBioP1}</p>
              <p>{siteConfig.founderBioP2}</p>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#181615] text-[#FBF9F6] hover:bg-[#8E4A36] text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
              >
                <span>Meet {siteConfig.founder}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
