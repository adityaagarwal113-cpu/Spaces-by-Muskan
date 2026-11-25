import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, SlidersHorizontal, Columns } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { DEFAULT_COMPARISON_CASES } from '../data/defaultCmsData';
import { OptimizedImage } from './OptimizedImage';

export const SiteToSpaceComparison: React.FC = () => {
  const { comparisonCases, siteConfig } = useCms();
  const cases = comparisonCases && comparisonCases.length > 0 ? comparisonCases : DEFAULT_COMPARISON_CASES;

  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeIdx = activeCaseIndex < cases.length ? activeCaseIndex : 0;
  const activeCase = cases[safeIdx];

  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(Math.round(percentage));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      handlePointerMove(e.clientX);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  if (!activeCase) return null;

  return (
    <section className="py-20 lg:py-28 bg-[#181615] text-[#F6F3EE] border-b border-[#2B2724] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="w-6 h-[1px] bg-[#D5A38C]" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#D5A38C] font-sans font-medium">
                {siteConfig.comparisonEyebrow || '2D CAD · 3D Render · Reality'}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-[1.08]">
              {siteConfig.comparisonHeadline1 || 'From Drawing'} <br className="hidden sm:block" />
              <span className="italic font-normal text-[#DFD8CE]">
                {siteConfig.comparisonHeadline2 || 'to Realized Space.'}
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10">
              {cases.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCaseIndex(idx);
                    setActiveAnnotation(null);
                  }}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                    safeIdx === idx
                      ? 'bg-[#8E4A36] text-white font-medium'
                      : 'text-[#BDB5AA] hover:text-white'
                  }`}
                >
                  <span className="font-mono tabular-nums mr-1.5">0{idx + 1}</span>
                  <span>{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode('slider')}
                title="Interactive Slider Mode"
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'slider' ? 'bg-[#8E4A36] text-white' : 'text-[#BDB5AA] hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('sideBySide')}
                title="Side by Side Mode"
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'sideBySide' ? 'bg-[#8E4A36] text-white' : 'text-[#BDB5AA] hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Specifications */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 font-mono text-[11px] text-[#D5A38C]">
                <span>{activeCase.code}</span>
                <span className="text-white/25">·</span>
                <span>{activeCase.datum}</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-light">
                {activeCase.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#CFC8BE] font-light leading-relaxed">
                {activeCase.description}
              </p>
            </div>

            <div className="p-5 bg-white/[0.04] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#D5A38C] pb-2 border-b border-white/10">
                <span>Workflow Tools</span>
                <span className="font-mono">{activeCase.software}</span>
              </div>

              <div className="space-y-2 pt-1">
                {activeCase.cadSpecs.map((spec) => (
                  <div key={spec} className="flex items-start gap-2.5 text-xs text-[#E6DFD3] font-light">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D5A38C] shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {activeCase.annotations.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#D5A38C] block">
                  Spatial Highlights
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeCase.annotations.map((ann, aIdx) => (
                    <button
                      key={ann.title}
                      onClick={() => setActiveAnnotation(activeAnnotation === aIdx ? null : aIdx)}
                      className={`px-3 py-1.5 text-xs transition-colors border cursor-pointer ${
                        activeAnnotation === aIdx
                          ? 'bg-[#8E4A36] text-white border-[#8E4A36] font-medium'
                          : 'bg-white/5 text-[#DFD8CE] border-white/15 hover:border-white/35'
                      }`}
                    >
                      <span className="font-mono mr-1.5 tabular-nums">0{aIdx + 1}</span>
                      <span>{ann.title}</span>
                    </button>
                  ))}
                </div>

                {activeAnnotation !== null && activeCase.annotations[activeAnnotation] && (
                  <div className="p-3 bg-black/50 border border-[#8E4A36]/60 text-xs text-[#F6F3EE]">
                    <span className="text-[#D5A38C] font-medium block mb-0.5">
                      {activeCase.annotations[activeAnnotation].title}
                    </span>
                    <span className="font-light text-[#CFC8BE]">
                      {activeCase.annotations[activeAnnotation].note}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-1">
              <Link
                to="/process"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#D5A38C] hover:text-white transition-colors"
              >
                <span>Explore Full Design Workflow</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Comparison Canvas */}
          <div className="lg:col-span-7">
            {viewMode === 'slider' ? (
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="relative h-[380px] sm:h-[460px] lg:h-[520px] overflow-hidden border border-white/15 bg-[#0F0E0D] select-none cursor-ew-resize touch-none shadow-2xl"
              >
                {/* Finished Realization Layer */}
                <OptimizedImage
                  src={activeCase.finishedImage}
                  alt={`${activeCase.name} finished interior`}
                  sizes="(max-width: 1024px) 94vw, 56vw"
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none contrast-[1.03]"
                />

                <div className="absolute top-4 right-4 bg-[#181615]/85 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] text-white px-3 py-1.5 pointer-events-none border border-white/15">
                  Realized Interior
                </div>

                {/* Spatial Pin Markers */}
                {activeCase.annotations.map((ann, aIdx) => (
                  <div
                    key={ann.title}
                    style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <span className="inline-flex rounded-full h-5 w-5 bg-[#8E4A36] border border-white shadow-md text-[9px] font-mono font-semibold text-white items-center justify-center tabular-nums">
                      {aIdx + 1}
                    </span>
                  </div>
                ))}

                {/* Plan Overlay clipped to slider width */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none border-r-2 border-[#D5A38C]"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <OptimizedImage
                    src={activeCase.planImage}
                    alt={activeCase.planLabel}
                    sizes="(max-width: 1024px) 94vw, 56vw"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/15" />
                </div>

                <div className="absolute top-4 left-4 bg-[#181615]/90 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] text-[#D5A38C] px-3 py-1.5 pointer-events-none border border-white/15">
                  {activeCase.planLabel}
                </div>

                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-[#D5A38C] pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#F6F3EE] text-[#181615] flex items-center justify-center shadow-xl text-xs font-bold select-none border-2 border-[#8E4A36] cursor-ew-resize">
                    ↔
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-64 sm:h-[440px] overflow-hidden border border-white/15 bg-white relative shadow-lg">
                  <OptimizedImage
                    src={activeCase.planImage}
                    alt={activeCase.planLabel}
                    sizes="(max-width: 640px) 92vw, 28vw"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-3 left-3 bg-[#181615]/90 text-[10px] uppercase tracking-[0.18em] text-[#D5A38C] px-2.5 py-1">
                    {activeCase.planLabel}
                  </div>
                </div>

                <div className="h-64 sm:h-[440px] overflow-hidden border border-white/15 bg-[#181615] relative shadow-lg">
                  <OptimizedImage
                    src={activeCase.finishedImage}
                    alt={activeCase.name}
                    sizes="(max-width: 640px) 92vw, 28vw"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase text-[#D5A38C] block tracking-[0.2em]">
                      Realized Interior
                    </span>
                    <span className="font-serif text-lg text-white">{activeCase.title}</span>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'slider' && (
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#9C948A] tabular-nums">
                <span>◀ {activeCase.planLabel} ({sliderPosition}%)</span>
                <span>REALIZED INTERIOR ({100 - sliderPosition}%) ▶</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
