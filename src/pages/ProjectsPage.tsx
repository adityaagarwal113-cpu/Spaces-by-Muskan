import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Compass, Sparkles } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { ProjectCategory } from '../types';
import { PageTransition } from '../components/PageTransition';
import { SEO } from '../components/SEO';
import { OptimizedImage } from '../components/OptimizedImage';

export const ProjectsPage: React.FC = () => {
  const { projects, siteConfig } = useCms();
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>('all');
  const activeProjects = projects.filter((p) => p.status !== 'draft');

  const filterTabs: { id: ProjectCategory; label: string }[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'residential', label: 'Residential' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'bedrooms', label: 'Bedrooms' },
    { id: 'kitchens', label: 'Kitchens' },
    { id: 'bathrooms', label: 'Bathrooms' },
  ];

  const getCountForFilter = (id: ProjectCategory) => {
    if (id === 'all') return activeProjects.length;
    return activeProjects.filter(
      (p) => p.categorySlug === id || p.secondaryCategories?.includes(id)
    ).length;
  };

  const filteredProjects = activeProjects.filter((p) => {
    if (activeFilter === 'all') return true;
    if (p.categorySlug === activeFilter) return true;
    if (p.secondaryCategories?.includes(activeFilter)) return true;
    return false;
  });

  return (
    <PageTransition>
      <SEO
        title="Portfolio & Selected Works"
        description={`Residential suites, commercial offices, aviation interiors, modular kitchens, and stone ensuites designed by ${siteConfig.name}.`}
      />
      <div className="pt-32 pb-24 lg:pt-40 lg:pb-36 bg-[#F6F3EE] text-[#181615] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-[1px] bg-[#8E4A36]" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-medium">
                Portfolio &amp; Selected Works
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#181615] leading-[1.06]">
              Spaces shaped with <br />
              <span className="italic font-normal text-[#6B655E]">craft &amp; Vastu harmony.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#5B554E] mt-6 leading-relaxed font-light">
              A curated archive of signature residences, bespoke bedrooms, modular kitchens, commercial workstations, and thematic interiors by {siteConfig.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#EDE8DF] mb-12 border border-[#DFD8CE] w-fit">
            {filterTabs.map((tab) => {
              const isSelected = activeFilter === tab.id;
              const count = getCountForFilter(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#181615] text-[#FBF9F6] shadow-xs'
                      : 'text-[#4A4540] hover:text-[#181615] hover:bg-[#FBF9F6]/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      isSelected ? 'text-[#D5A38C]' : 'text-[#6B655E]'
                    }`}
                  >
                    {String(count).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => {
                const isSingle = filteredProjects.length === 1;
                const isHeroTile = !isSingle && idx === 0;
                const isTallTile = !isSingle && idx === 1;
                const colSpan = isSingle
                  ? 'md:col-span-12 lg:col-span-10 lg:col-start-2'
                  : isHeroTile
                  ? 'md:col-span-7'
                  : isTallTile
                  ? 'md:col-span-5'
                  : 'md:col-span-4';

                const frameClass = isSingle
                  ? 'aspect-[16/10]'
                  : isHeroTile
                  ? 'aspect-[4/3] sm:aspect-[16/11]'
                  : 'aspect-[4/5]';

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={colSpan}
                  >
                    <Link
                      to={`/projects/${project.id}`}
                      className="group block cursor-pointer"
                    >
                      <div
                        className={`w-full ${frameClass} overflow-hidden bg-[#EDE8DF] border border-[#DFD8CE] project-card-hover`}
                      >
                        <OptimizedImage
                          src={project.heroImage}
                          alt={`${project.title} — ${project.category}`}
                          fallbackLabel={project.title}
                          sizes={
                            isSingle || isHeroTile
                              ? '(max-width: 768px) 92vw, 58vw'
                              : '(max-width: 768px) 92vw, 33vw'
                          }
                          className="w-full h-full object-cover object-center contrast-[1.03]"
                        />
                      </div>

                      <div className="pt-4 pb-3 border-b border-[#DFD8CE] flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#6B655E]">
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
                            {project.hasTechnicalDrawing && (
                              <>
                                <span className="text-[#DFD8CE]" aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1 text-[#8E4A36]">
                                  <Compass className="w-3 h-3" /> 2D &amp; 3D
                                </span>
                              </>
                            )}
                          </div>

                          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#181615] group-hover:text-[#8E4A36] transition-colors">
                            {project.title}
                          </h2>
                          <p className="text-xs text-[#5B554E] line-clamp-1 font-light max-w-md">
                            {project.description}
                          </p>
                        </div>

                        <div className="w-8 h-8 shrink-0 rounded-full border border-[#DFD8CE] flex items-center justify-center text-[#181615] group-hover:bg-[#8E4A36] group-hover:border-[#8E4A36] group-hover:text-white transition-all mt-1">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          <div className="mt-16 pt-8 border-t border-[#DFD8CE] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B655E] gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#8E4A36]" />
              <span>
                Portfolio archive by {siteConfig.name} ({siteConfig.instagramHandle})
              </span>
            </div>
            <Link
              to="/contact"
              className="text-[#181615] uppercase tracking-[0.2em] text-[11px] font-medium hover:text-[#8E4A36] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Commission a Space</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
