import React, { useState } from 'react';
import { ChevronDown, Compass, Sun, Wind, Droplets, Flame } from 'lucide-react';

export const VastuSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-20 lg:py-28 bg-[#F6F5F2] border-b border-[#DDD9D0]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B9322C] font-medium block mb-3">
          Vastu Consultation &amp; Spatial Flow
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#161617] leading-snug">
          &ldquo;Balancing natural energy, daylight, and modern spatial aesthetics.&rdquo;
        </h2>
        <p className="text-sm text-[#76726B] mt-4 leading-relaxed max-w-2xl mx-auto font-light">
          As an Interior Designer &amp; Vastu Consultant, Muskan Agarwal integrates directional Vastu principles with practical 2D CAD planning so beauty and positive energy coexist naturally.
        </p>

        <div className="mt-8">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#DDD9D0] hover:border-[#B9322C] text-[#161617] text-xs uppercase tracking-widest font-medium rounded-xs transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#B9322C]" />
            <span>Explore Vastu &amp; Spatial Orientation</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#76726B] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="mt-6 text-left p-6 sm:p-8 bg-[#FAF9F7] border border-[#DDD9D0] rounded-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-[#DDD9D0] pb-4 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#B9322C] font-medium block">
                    Directional Zoning
                  </span>
                  <h4 className="font-serif text-xl font-normal text-[#161617]">
                    Vastu-Aligned Modern Planning
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-[#76726B]">Spaces by Muskan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-[#F6F5F2] rounded-xs space-y-2 border border-[#DDD9D0]">
                  <div className="flex items-center gap-2 text-[#B9322C] font-medium">
                    <Sun className="w-4 h-4" />
                    <span>East &amp; North-East (Ishanya)</span>
                  </div>
                  <p className="text-[#524E48] leading-relaxed">
                    Prioritizing morning daylight, uncluttered entry foyers, open living spaces, and pooja or study zones.
                  </p>
                </div>

                <div className="p-4 bg-[#F6F5F2] rounded-xs space-y-2 border border-[#DDD9D0]">
                  <div className="flex items-center gap-2 text-[#B9322C] font-medium">
                    <Flame className="w-4 h-4" />
                    <span>South-East (Agni Zone)</span>
                  </div>
                  <p className="text-[#524E48] leading-relaxed">
                    Thoughtful placement for modular kitchens, hob counters, and appliance hubs aligned with fire-element balance.
                  </p>
                </div>

                <div className="p-4 bg-[#F6F5F2] rounded-xs space-y-2 border border-[#DDD9D0]">
                  <div className="flex items-center gap-2 text-[#B9322C] font-medium">
                    <Wind className="w-4 h-4" />
                    <span>South-West (Nairutya Zone)</span>
                  </div>
                  <p className="text-[#524E48] leading-relaxed">
                    Grounded anchoring for master suites, full-height wardrobes, and serene architectural rest zones.
                  </p>
                </div>

                <div className="p-4 bg-[#F6F5F2] rounded-xs space-y-2 border border-[#DDD9D0]">
                  <div className="flex items-center gap-2 text-[#B9322C] font-medium">
                    <Droplets className="w-4 h-4" />
                    <span>North-West (Vayavya Zone)</span>
                  </div>
                  <p className="text-[#524E48] leading-relaxed">
                    Balanced placement for guest rooms, kids bedrooms, cross-ventilation corridors, and dynamic workspaces.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
