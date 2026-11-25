import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Compass, Ruler, Maximize2, X } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { PageTransition } from '../components/PageTransition';
import { SEO } from '../components/SEO';
import { AnimatePresence, motion } from 'motion/react';
import { OptimizedImage, getHighResImageSrc } from '../components/OptimizedImage';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, siteConfig } = useCms();
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  const activeProjects = projects.filter((p) => p.status !== 'draft');
  const currentIndex = activeProjects.findIndex((p) => p.id === id);
  const safeIndex = currentIndex !== -1 ? currentIndex : 0;
  const project = activeProjects[safeIndex] || projects[0];

  const prevIndex = (safeIndex - 1 + activeProjects.length) % Math.max(1, activeProjects.length);
  const prevProject = activeProjects[prevIndex] || project;
  const nextIndex = (safeIndex + 1) % Math.max(1, activeProjects.length);
  const nextProject = activeProjects[nextIndex] || project;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxImg) {
        if (e.key === 'Escape') setActiveLightboxImg(null);
        return;
      }
      if (!nextProject || !prevProject) return;
      if (e.key === 'ArrowRight') {
        navigate(`/projects/${nextProject.id}`);
      } else if (e.key === 'ArrowLeft') {
        navigate(`/projects/${prevProject.id}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, nextProject, prevProject, activeLightboxImg]);

  if (!project) {
    return (
      <div className="pt-40 pb-20 text-center bg-[#F6F3EE] min-h-screen">
        <h1 className="font-serif text-3xl mb-4 text-[#181615]">Project Not Found</h1>
        <Link to="/projects" className="text-xs uppercase tracking-widest text-[#8E4A36] underline">
          Return to Portfolio
        </Link>
      </div>
    );
  }

  const primaryHero = project.heroImage;
  const spatialImage = project.galleryImages[0] || project.heroImage;
  const detailImageA = project.galleryImages[1] || project.heroImage;
  const detailImageB = project.galleryImages[2] || project.galleryImages[0] || project.heroImage;

  return (
    <PageTransition>
      <SEO
        title={`${project.title} · ${project.category}`}
        description={`${project.description} Designed by ${siteConfig.name}.`}
      />
      <article className="bg-[#F6F3EE] text-[#181615] min-h-screen">
        <div className="pt-28 sm:pt-32 pb-6 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between border-b border-[#DFD8CE]">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-medium text-[#6B655E] hover:text-[#181615] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Selected Work</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[#6B655E] tabular-nums">
              {String(safeIndex + 1).padStart(2, '0')} / {String(activeProjects.length).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5">
              <Link
                to={`/projects/${prevProject.id}`}
                aria-label="Previous project"
                className="p-1.5 rounded-full border border-[#DFD8CE] hover:border-[#181615] text-[#181615] hover:bg-[#EDE8DF] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
              <Link
                to={`/projects/${nextProject.id}`}
                aria-label="Next project"
                className="p-1.5 rounded-full border border-[#DFD8CE] hover:border-[#181615] text-[#181615] hover:bg-[#EDE8DF] transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <header className="pt-14 pb-12 sm:pt-20 sm:pb-16 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#8E4A36] font-medium">
            <span>{project.category}</span>
            {project.location && (
              <>
                <span className="text-[#DFD8CE]" aria-hidden="true">·</span>
                <span>{project.location}</span>
              </>
            )}
            {project.dimensions && (
              <>
                <span className="text-[#DFD8CE]" aria-hidden="true">·</span>
                <span className="font-mono text-[#6B655E]">{project.dimensions}</span>
              </>
            )}
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#181615] leading-[1.06]">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg text-[#4A4540] max-w-2xl mx-auto leading-relaxed font-light">
            {project.description}
          </p>

          {project.materials.length > 0 && (
            <div className="pt-3 text-xs text-[#6B655E] tracking-wide">
              {project.materials.join(' · ')}
            </div>
          )}
        </header>

        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-20 lg:mb-28">
          <div
            onClick={() => primaryHero && setActiveLightboxImg(primaryHero)}
            className="group relative h-[54vh] sm:h-[72vh] lg:h-[80vh] overflow-hidden bg-[#181615] border border-[#DFD8CE] cursor-pointer shadow-lg"
          >
            <OptimizedImage
              src={primaryHero}
              alt={project.title}
              priority
              fallbackLabel={project.title}
              sizes="(max-width: 1280px) 94vw, 1280px"
              className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-end justify-between p-6 sm:p-8 text-white">
              <span className="text-[11px] uppercase tracking-[0.2em] bg-[#181615]/70 backdrop-blur-xs px-3 py-1.5 border border-white/15">
                Plate 01 · Primary View
              </span>
              {primaryHero && (
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#8E4A36] transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 sm:px-8 mb-20 lg:mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <div
                onClick={() => detailImageA && setActiveLightboxImg(detailImageA)}
                className="group relative aspect-[4/3] overflow-hidden bg-[#181615] border border-[#DFD8CE] cursor-pointer shadow-sm"
              >
                <OptimizedImage
                  src={detailImageA}
                  alt={`${project.title} spatial view`}
                  fallbackLabel={project.title}
                  sizes="(max-width: 1024px) 92vw, 66vw"
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 text-[11px] uppercase tracking-[0.18em] text-white/95 bg-[#181615]/75 backdrop-blur-xs px-3 py-1.5">
                  Material Harmony · Spatial Flow
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#8E4A36] font-medium block">
                Spatial Planning &amp; Vastu
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#181615] leading-snug">
                Proportion &amp; Light Balance
              </h2>
              <p className="text-sm text-[#4A4540] leading-relaxed font-light">
                Furniture clearances, circulation corridors, and directional alignment are modeled in 2D AutoCAD and 3D SketchUp &amp; V-Ray before execution begins.
              </p>
            </div>
          </div>
        </section>

        {project.hasTechnicalDrawing && (
          <section className="max-w-6xl mx-auto px-6 sm:px-8 mb-20 lg:mb-28">
            <div className="p-8 sm:p-12 bg-[#181615] text-[#F6F3EE] border border-[#2B2724] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-[#D5A38C]" />
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.24em] text-[#D5A38C] block">
                      2D CAD &amp; 3D Visualization Notes
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-white font-light mt-0.5">
                      Technical Detailing &amp; Site Execution
                    </h3>
                  </div>
                </div>
                {project.dimensions && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFD8CE] bg-white/5 border border-white/10 px-3 py-1.5">
                    <Ruler className="w-3.5 h-3.5 text-[#D5A38C]" />
                    <span>{project.dimensions}</span>
                  </div>
                )}
              </div>

              <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#CFC8BE]">
                <div className="space-y-2 p-5 bg-white/[0.04] border border-white/10">
                  <span className="text-[#D5A38C] uppercase tracking-[0.18em] text-[10px] block">
                    01 · Working AutoCAD Drawings
                  </span>
                  <p className="leading-relaxed font-light">
                    Dimensioned electrical, false ceiling, and switchboard elevations ensuring clean alignment across all furniture pieces.
                  </p>
                </div>
                <div className="space-y-2 p-5 bg-white/[0.04] border border-white/10">
                  <span className="text-[#D5A38C] uppercase tracking-[0.18em] text-[10px] block">
                    02 · Warm Illumination Layers
                  </span>
                  <p className="leading-relaxed font-light">
                    Indirect 3000K cove profiles balanced with bedside pendants and backlit stone or glass showcase lighting.
                  </p>
                </div>
                <div className="space-y-2 p-5 bg-white/[0.04] border border-white/10">
                  <span className="text-[#D5A38C] uppercase tracking-[0.18em] text-[10px] block">
                    03 · Bespoke Joinery Craft
                  </span>
                  <p className="leading-relaxed font-light">
                    Custom headboard upholstery, fluted wood paneling, and veneer alignments verified during active carpentry.
                  </p>
                </div>
              </div>

              {project.architecturalNotes && (
                <div className="pt-4 border-t border-white/10 text-xs sm:text-sm text-[#DFD8CE] font-light leading-relaxed">
                  <strong className="text-white font-medium block mb-1">Studio Architectural Note</strong>
                  {project.architecturalNotes}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="max-w-6xl mx-auto px-6 sm:px-8 mb-20 lg:mb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div
              onClick={() => detailImageB && setActiveLightboxImg(detailImageB)}
              className="group relative aspect-[4/5] overflow-hidden bg-[#181615] border border-[#DFD8CE] cursor-pointer shadow-sm"
            >
              <OptimizedImage
                src={detailImageB}
                alt={`${project.title} detailed execution`}
                fallbackLabel={project.title}
                sizes="(max-width: 768px) 92vw, 45vw"
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 text-[11px] uppercase tracking-[0.18em] text-white/95 bg-[#181615]/75 backdrop-blur-xs px-3 py-1.5">
                Material Palette &amp; Detail
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#8E4A36] font-medium block">
                Execution Quality
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#181615]">
                From Concept Render to Handover
              </h3>
              <p className="text-sm text-[#4A4540] leading-relaxed font-light">
                Every texture—fluted louvers, stone veneers, tailored headboards, and brass hardware—is verified across V-Ray studies and on-site walkthroughs.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-24 lg:mb-32">
          <div
            onClick={() => spatialImage && setActiveLightboxImg(spatialImage)}
            className="group relative h-[50vh] sm:h-[64vh] overflow-hidden bg-[#181615] border border-[#DFD8CE] cursor-pointer shadow-md"
          >
            <OptimizedImage
              src={spatialImage}
              alt={`${project.title} completed interior`}
              fallbackLabel={project.title}
              sizes="(max-width: 1280px) 94vw, 1280px"
              className="w-full h-full object-cover object-center group-hover:scale-[1.015] transition-transform duration-700"
            />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white text-xs pointer-events-none">
              <span className="bg-[#181615]/75 backdrop-blur-xs px-3 py-1.5 uppercase tracking-[0.16em]">
                {project.title} · {siteConfig.name}
              </span>
              <span className="uppercase tracking-[0.2em] text-[#F1ECE3]">
                {project.category}
              </span>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-[#EDE8DF] border-t border-[#DFD8CE]">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-6">
            <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-medium block">
              Next Case Study
            </span>

            <Link
              to={`/projects/${nextProject.id}`}
              className="group block relative max-w-2xl mx-auto p-8 sm:p-12 bg-[#FBF9F6] border border-[#DFD8CE] hover:border-[#8E4A36] transition-all shadow-xs text-left"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#6B655E] block tabular-nums">
                    {String(nextIndex + 1).padStart(2, '0')} / {String(activeProjects.length).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#181615] font-light group-hover:text-[#8E4A36] transition-colors">
                    {nextProject.title}
                  </h3>
                  <span className="text-[11px] text-[#6B655E] uppercase tracking-[0.18em] block">
                    {nextProject.category} {nextProject.location ? `· ${nextProject.location}` : ''}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#181615] text-white flex items-center justify-center shrink-0 group-hover:bg-[#8E4A36] transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            <div className="pt-4">
              <Link
                to={`/contact?project=${encodeURIComponent(project.id)}`}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-medium text-[#181615] hover:text-[#8E4A36] transition-colors"
              >
                <span>Inquire About a Similar Space</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </article>

      {/* High-Resolution 2160w WebP Lightbox */}
      <AnimatePresence>
        {activeLightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#181615]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setActiveLightboxImg(null)}
          >
            <button
              onClick={() => setActiveLightboxImg(null)}
              className="absolute top-6 right-6 p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              aria-label="Close image inspection"
            >
              <X className="w-5 h-5" />
            </button>
            <div
              className="relative max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getHighResImageSrc(activeLightboxImg)}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain max-h-[85vh]"
              />
              <div className="text-center mt-3 text-xs text-[#CFC8BE] tracking-wide">
                {project.title} — {siteConfig.name}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};
