import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowUpRight, Check, Compass, Ruler, Layers } from 'lucide-react';
import { ProjectDetail } from '../types';

interface ProjectModalProps {
  project: ProjectDetail | null;
  onClose: () => void;
  onOpenContact: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onOpenContact }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-0 sm:p-4 md:p-8 animate-in fade-in duration-200"
    >
      {/* Background click dismiss */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#FBFBF9] text-[#181716] sm:rounded-xs shadow-2xl overflow-hidden my-auto border border-[#EBE7E0]">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close project details"
          className="absolute top-5 right-5 z-20 p-2.5 bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-xs cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-[45vh] sm:h-[55vh] bg-[#181716]">
          <img
            src={project.heroImage}
            alt={project.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Hero Overlay Text */}
          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 text-white">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#EBE7E0] mb-2 font-medium">
              <span>{project.category}</span>
              {project.location && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#B89B72]">{project.location}</span>
                </>
              )}
            </div>
            <h2 id="project-modal-title" className="font-serif text-3xl sm:text-5xl font-normal text-white">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Case Study Content */}
        <div className="p-6 sm:p-10 lg:p-12 space-y-12">
          {/* Overview & Description */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8 space-y-4">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A704E] font-medium block">
                Design Intent
              </span>
              <p className="font-serif text-xl sm:text-2xl text-[#181716] leading-relaxed font-light">
                {project.description}
              </p>
              {project.architecturalNotes && (
                <div className="p-4 sm:p-5 bg-[#F5F3EF] border-l-2 border-[#8A704E] text-sm text-[#4A4742] leading-relaxed">
                  <span className="font-medium text-[#181716] block mb-1">Architectural Specification</span>
                  {project.architecturalNotes}
                </div>
              )}
            </div>

            {/* Project Quick Facts */}
            <div className="md:col-span-4 p-6 bg-[#F5F3EF] rounded-xs space-y-5 text-xs">
              <div>
                <span className="text-[#8F8A81] uppercase tracking-wider block mb-1">Category</span>
                <span className="font-medium text-[#181716] text-sm">{project.category}</span>
              </div>
              {project.location && (
                <div>
                  <span className="text-[#8F8A81] uppercase tracking-wider block mb-1">Location</span>
                  <span className="font-medium text-[#181716] text-sm">{project.location}</span>
                </div>
              )}
              {project.dimensions && (
                <div>
                  <span className="text-[#8F8A81] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5" /> Spatial Dimensions
                  </span>
                  <span className="font-medium text-[#181716] text-sm font-mono">{project.dimensions}</span>
                </div>
              )}
              {project.hasTechnicalDrawing && (
                <div>
                  <span className="text-[#8F8A81] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Technical Documentation
                  </span>
                  <span className="font-medium text-[#181716] text-sm">2D CAD & Electrical Coordinated</span>
                </div>
              )}
            </div>
          </div>

          {/* Scope & Material Palette */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#EBE7E0]">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A704E] font-medium block mb-4 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> Scope of Work
              </span>
              <ul className="space-y-2.5">
                {project.scope.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#4A4742]">
                    <Check className="w-4 h-4 text-[#8A704E] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A704E] font-medium block mb-4">
                Materials & Detailing
              </span>
              <div className="flex flex-wrap gap-2">
                {project.materials.map((mat) => (
                  <span
                    key={mat}
                    className="px-3 py-1.5 bg-[#F5F3EF] text-xs text-[#282624] font-medium border border-[#EBE7E0] rounded-xs"
                  >
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Gallery Views */}
          {project.galleryImages.length > 1 && (
            <div className="pt-6 border-t border-[#EBE7E0] space-y-4">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A704E] font-medium block">
                Spatial Perspectives
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.galleryImages.slice(1).map((imgUrl, idx) => (
                  <div key={idx} className="h-64 sm:h-72 bg-[#EBE7E0] overflow-hidden rounded-xs">
                    <img
                      src={imgUrl}
                      alt={`${project.title} perspective ${idx + 2}`}
                      className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Bottom CTA */}
          <div className="pt-8 border-t border-[#EBE7E0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#8F8A81] uppercase tracking-wider block">Have a similar space in mind?</span>
              <span className="font-serif text-xl text-[#181716]">Let&apos;s discuss your spatial requirements.</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                to={`/projects/${project.id}`}
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 border border-[#D8D2C7] hover:border-[#181716] text-[#181716] text-xs uppercase tracking-widest font-medium transition-colors rounded-xs"
              >
                <span>Full Case Study Page</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#181716] text-[#FBFBF9] hover:bg-[#8A704E] text-xs uppercase tracking-widest font-medium transition-colors rounded-xs cursor-pointer"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
