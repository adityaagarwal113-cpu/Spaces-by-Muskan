import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { OptimizedImage } from './OptimizedImage';

export const SignatureShowcase: React.FC = () => {
  const { projects, siteConfig } = useCms();
  const activeList = projects.filter((p) => p.status !== 'draft');
  const featured = activeList.filter((p) => p.featured);
  const showcase = (
    featured.length >= 6
      ? featured
      : [...featured, ...activeList.filter((p) => !p.featured)]
  ).slice(0, 6);

  if (showcase.length === 0) return null;

  const topRow = showcase.slice(0, 2);
  const middleRow = showcase.slice(2, 5);
  const spotlight = showcase[5];

  const eyebrow = siteConfig.workEyebrow || 'Selected Works';
  const headline = siteConfig.workHeadline || 'Six Signature Interiors.';
  const subtitle =
    siteConfig.workSubtitle ||
    'Curated residences, bespoke bedrooms, modular kitchens, and commercial interiors realized from drawing to handover.';

  return (
    <section id="work" className="bg-[#F6F3EE] text-[#181615]">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-18 sm:pt-24 pb-10 border-b border-[#DFD8CE]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
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

          <div className="flex flex-col sm:items-end gap-2 max-w-sm">
            <p className="text-xs sm:text-sm text-[#5B554E] font-light leading-relaxed sm:text-right">
              {subtitle}
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#8E4A36] hover:text-[#181615] font-medium transition-colors"
            >
              <span>Complete Archive ({String(activeList.length).padStart(2, '0')})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ROW 1: ASYMMETRIC FLAGSHIP DIPTYCH (01 - 02) */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {topRow.map((project, idx) => {
            const isPrimary = idx === 0;
            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={isPrimary ? 'lg:col-span-7' : 'lg:col-span-5 lg:pt-12'}
              >
                <Link to={`/projects/${project.id}`} className="group block">
                  <div
                    className={`w-full overflow-hidden bg-[#EDE8DF] border border-[#DFD8CE] project-card-hover ${
                      isPrimary
                        ? 'aspect-[4/3] sm:aspect-[16/11]'
                        : 'aspect-[4/5]'
                    }`}
                  >
                    <OptimizedImage
                      src={project.heroImage}
                      alt={`${project.title} — ${project.category}`}
                      sizes={
                        isPrimary
                          ? '(max-width: 1024px) 94vw, 58vw'
                          : '(max-width: 1024px) 94vw, 38vw'
                      }
                      className="w-full h-full object-cover object-center contrast-[1.03]"
                    />
                  </div>

                  <div className="pt-5 flex items-start justify-between gap-4 border-b border-[#DFD8CE] pb-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-[#6B655E]">
                        <span className="font-mono text-[#8E4A36] tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[#DFD8CE]" aria-hidden="true">/</span>
                        <span>{project.category}</span>
                        {project.location && (
                          <>
                            <span className="text-[#DFD8CE]" aria-hidden="true">·</span>
                            <span>{project.location}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-light text-[#181615] group-hover:text-[#8E4A36] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5B554E] font-light leading-relaxed max-w-lg line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    <div className="w-9 h-9 shrink-0 rounded-full border border-[#DFD8CE] flex items-center justify-center text-[#181615] group-hover:border-[#8E4A36] group-hover:bg-[#8E4A36] group-hover:text-white transition-all mt-1">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>

        {/* ROW 2: THREE PORTRAIT ARCHITECTURE PLATES (03 - 05) */}
        {middleRow.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 pt-14 sm:pt-20">
            {middleRow.map((project, idx) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.75, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to={`/projects/${project.id}`} className="group block">
                  <div className="w-full aspect-[4/5] overflow-hidden bg-[#EDE8DF] border border-[#DFD8CE] project-card-hover">
                    <OptimizedImage
                      src={project.heroImage}
                      alt={`${project.title} — ${project.category}`}
                      sizes="(max-width: 768px) 92vw, 31vw"
                      className="w-full h-full object-cover object-center contrast-[1.03]"
                    />
                  </div>

                  <div className="pt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#6B655E]">
                      <span>{project.category}</span>
                      <span className="font-mono text-[#8E4A36] tabular-nums">
                        {String(idx + 3).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl sm:text-[28px] font-light text-[#181615] group-hover:text-[#8E4A36] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#5B554E] font-light leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* ROW 3: ARCHITECTURAL SPOTLIGHT BAND (06) */}
      {spotlight && (
        <div className="bg-[#181615] text-[#F6F3EE] border-y border-[#2B2724]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#D5A38C] tabular-nums">06</span>
                  <span className="w-5 h-[1px] bg-[#D5A38C]/60" />
                  <span className="text-[11px] uppercase tracking-[0.24em] text-[#D5A38C]">
                    {spotlight.category}
                  </span>
                </div>

                <h3 className="font-serif text-3xl sm:text-5xl text-white font-light leading-[1.1]">
                  {spotlight.title}
                </h3>

                <p className="text-sm text-[#CFC8BE] font-light leading-relaxed">
                  {spotlight.description}
                </p>

                {spotlight.materials.length > 0 && (
                  <p className="text-xs text-[#9C948A] font-light tracking-wide pt-1 border-t border-white/10">
                    {spotlight.materials.join(' · ')}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    to={`/projects/${spotlight.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#8E4A36] hover:bg-white text-white hover:text-[#181615] text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
                  >
                    <span>Examine Case Study</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#E6DFD3] hover:text-[#D5A38C] transition-colors"
                  >
                    <span>All Projects ({String(activeList.length).padStart(2, '0')})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2">
                <Link to={`/projects/${spotlight.id}`} className="group block">
                  <div className="w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-[#0E0D0C] border border-white/10 project-card-hover">
                    <OptimizedImage
                      src={spotlight.heroImage}
                      alt={spotlight.title}
                      sizes="(max-width: 1024px) 94vw, 58vw"
                      className="w-full h-full object-cover object-center contrast-[1.04]"
                    />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
