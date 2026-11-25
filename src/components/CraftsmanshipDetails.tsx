import React from 'react';
import { CRAFT_DETAILS } from '../data/studioData';

export const CraftsmanshipDetails: React.FC = () => {
  return (
    <section id="details" className="py-24 lg:py-36 bg-[#FBFBF9] border-b border-[#EBE7E0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mb-16 lg:mb-20">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A704E] font-medium block mb-3">
            Craftsmanship &amp; Joinery
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#181716] leading-tight">
            &ldquo;Details make the space.&rdquo;
          </h2>
          <p className="text-sm text-[#7A756D] mt-3 max-w-xl font-light">
            Every shadowline, recessed LED channel, custom timber flute, and switchboard elevation is
            deliberately resolved to create visual stillness and functional longevity.
          </p>
        </div>

        {/* Asymmetrical Detail Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {CRAFT_DETAILS.map((item, index) => (
            <div
              key={item.id}
              className={`group flex flex-col justify-between p-6 bg-[#F5F3EF] border border-[#EBE7E0] rounded-xs hover:border-[#8A704E] transition-all duration-300 ${
                index % 2 === 1 ? 'lg:translate-y-6' : ''
              }`}
            >
              {/* Detail Image Thumbnail */}
              <div className="h-52 w-full overflow-hidden rounded-xs bg-[#EBE7E0] mb-6 hover-light-sweep">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              {/* Text Information */}
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8A704E] font-mono font-medium block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-xl font-normal text-[#181716] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#4A4742] leading-relaxed mt-2 font-light">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EBE7E0] mt-4">
                  <span className="text-[10px] uppercase tracking-wider text-[#8F8A81] block mb-0.5">
                    Specification
                  </span>
                  <span className="text-[11px] font-mono text-[#282624] block">
                    {item.specifications}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
