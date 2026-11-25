import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass } from 'lucide-react';
import { ProjectDetail, ProjectCategory } from '../types';
import { PROJECTS } from '../data/studioData';
import { ProjectModal } from './ProjectModal';
import { ResolvedImg } from './OptimizedImage';

interface PortfolioProps {
  onOpenContact: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ onOpenContact }) => {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('all');
  const [activeModalProject, setActiveModalProject] = useState<ProjectDetail | null>(null);

  const filterTabs: { id: ProjectCategory; label: string }[] = [
    { id: 'all', label: 'All Spaces' },
    { id: 'bedrooms', label: 'Bedrooms' },
    { id: 'residential', label: 'Living & Media' },
    { id: 'kitchens', label: 'Kitchens' },
    { id: 'bathrooms', label: 'Bathrooms' },
    { id: 'detailing', label: 'Detailing' },
  ];

  const filteredProjects =
    selectedCategory === 'all'
      ? PROJECTS
      : PROJECTS.filter(
          (p) =>
            p.categorySlug === selectedCategory ||
            p.secondaryCategories?.includes(selectedCategory)
        );

  return (
    <section id="work" className="py-24 lg:py-36 bg-[#F5F3EF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 lg:mb-16 border-b border-[#D8D2C7] pb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#8A704E] font-medium block mb-3">
              Selected Work
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#181716]">
              A selection of spaces, details &amp; explorations.
            </h2>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EBE7E0] rounded-xs">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 rounded-xs cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#181716] text-[#FBFBF9] shadow-xs'
                    : 'text-[#6B665F] hover:text-[#181716] hover:bg-white/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Asymmetrical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {filteredProjects.map((project, index) => {
            // Asymmetrical layout weights
            const isLarge = index === 0;
            const isVertical = index === 1;
            const colSpan = isLarge
              ? 'md:col-span-8 h-[440px] sm:h-[520px]'
              : isVertical
              ? 'md:col-span-4 h-[440px] sm:h-[520px]'
              : 'md:col-span-4 h-[380px] sm:h-[420px]';

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                data-cursor="view"
                className={`group relative overflow-hidden bg-[#181716] cursor-pointer rounded-xs block ${colSpan}`}
              >
                {/* Project Photograph */}
                <ResolvedImg
                  src={project.heroImage}
                  alt={`${project.title} - ${project.category}`}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-103"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />

                {/* Top Corner Badge */}
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none">
                  {project.location ? (
                    <span className="text-[11px] font-mono tracking-wider uppercase text-white/90 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-xs">
                      {project.location}
                    </span>
                  ) : <span />}

                  {project.hasTechnicalDrawing && (
                    <span className="text-[11px] font-sans tracking-wide uppercase text-[#EBE7E0] bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-xs flex items-center gap-1.5">
                      <Compass className="w-3 h-3 text-[#B89B72]" /> CAD Detailing
                    </span>
                  )}
                </div>

                {/* Bottom Content Information */}
                <div className="absolute bottom-6 left-6 right-6 text-white transform transition-transform duration-300">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#D8D2C7] mb-1.5 font-medium">
                    <span>{project.category}</span>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white group-hover:text-[#F5F3EF]">
                      {project.title}
                    </h3>
                    <div className="w-9 h-9 shrink-0 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#B89B72] group-hover:text-[#181716] transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Studio Note on Genuine Documentation */}
        <div className="mt-12 pt-6 border-t border-[#D8D2C7] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A756D] gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8A704E]" />
            <span>Curated from active residential commissions &amp; architectural drawings</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/projects"
              className="text-[#181716] font-medium uppercase tracking-wider hover:text-[#8A704E] transition-colors inline-flex items-center gap-1.5"
            >
              <span>View Full Project Archive</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onOpenContact}
              className="group inline-flex items-center gap-1.5 text-[#8A704E] font-medium uppercase tracking-wider hover:text-[#181716] transition-colors"
            >
              <span>Commission a Custom Space</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen / Magazine Modal Viewer */}
      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
        onOpenContact={onOpenContact}
      />
    </section>
  );
};
