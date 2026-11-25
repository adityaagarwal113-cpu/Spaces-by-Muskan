import React from 'react';
import { ArrowUpRight, Instagram, Youtube } from 'lucide-react';
import { STUDIO_CONFIG, PROJECTS } from '../data/studioData';
import { ResolvedImg } from './OptimizedImage';

export const InstagramFeed: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#F6F5F2] border-b border-[#DDD9D0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-[#DDD9D0]">
          <div>
            <span className="text-xs uppercase tracking-[0.28em] text-[#B9322C] font-mono block mb-2">
              STUDIO JOURNAL
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#161617] leading-tight">
              Latest Reels, Walkthroughs &amp; Renders.
            </h2>
            <p className="text-xs sm:text-sm text-[#76726B] font-light mt-1.5">
              Work-in-progress site tours, 3D concept reveals, and completed spaces from {STUDIO_CONFIG.instagramHandle}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={STUDIO_CONFIG.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#161617] text-[#FAF9F7] hover:bg-[#B9322C] text-xs font-mono uppercase tracking-widest transition-colors rounded-xs shadow-md"
            >
              <Instagram className="w-3.5 h-3.5 text-[#E6635C]" />
              <span>{STUDIO_CONFIG.instagramHandle}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <a
              href={STUDIO_CONFIG.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 border border-[#DDD9D0] bg-white hover:border-[#B9322C] text-[#161617] text-xs font-mono uppercase tracking-widest transition-colors rounded-xs"
            >
              <Youtube className="w-3.5 h-3.5 text-[#B9322C]" />
              <span>YouTube</span>
            </a>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
          {PROJECTS.map((item, idx) => (
            <a
              key={item.id}
              href={STUDIO_CONFIG.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="group w-[72vw] sm:w-[320px] lg:w-[360px] shrink-0 snap-start bg-[#FAF9F7] border border-[#DDD9D0] rounded-xs overflow-hidden hover:border-[#B9322C] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="h-64 sm:h-72 w-full overflow-hidden bg-[#161617] relative">
                <ResolvedImg
                  src={item.heroImage}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out filter contrast-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3">
                  <span className="font-mono text-[9px] text-[#E6635C] uppercase tracking-widest bg-black/65 px-2 py-0.5 rounded-xs border border-white/10">
                    REEL 0{idx + 1}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-mono text-[#DDD9D0] uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <span className="font-serif text-base text-white line-clamp-1">
                    {item.title}
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between border-t border-[#DDD9D0] text-[11px] text-[#76726B] font-mono">
                <span className="truncate max-w-[200px]">{item.scope[0]}</span>
                <span className="text-[#B9322C] group-hover:translate-x-0.5 transition-transform">
                  Instagram →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
