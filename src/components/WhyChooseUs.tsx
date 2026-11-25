import React from 'react';
import { Eye, ShieldCheck, Compass, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const PILLARS = [
  {
    number: '01',
    icon: Eye,
    title: 'Founder-Led Supervision',
    subtitle: 'Direct Accountability',
    description:
      'Muskan Agarwal personally guides every space from initial 2D drafting through carpentry checks and work-in-progress site milestones.',
  },
  {
    number: '02',
    icon: ShieldCheck,
    title: '2D AutoCAD & 3D V-Ray',
    subtitle: 'Clear Previews Before Work',
    description:
      'Complete 2D plans paired with SketchUp, V-Ray, and 3ds Max visualizations so you inspect every finish and lighting angle beforehand.',
  },
  {
    number: '03',
    icon: Compass,
    title: 'Integrated Vastu Consultancy',
    subtitle: 'Harmonious Zoning',
    description:
      'Contemporary aesthetics blended naturally with Vastu Shastra directional principles for natural light, flow, and balanced energy.',
  },
  {
    number: '04',
    icon: Sparkles,
    title: 'Distinctive Signature Identity',
    subtitle: 'Residential & Commercial',
    description:
      'From bespoke sculpted bedrooms and modular kitchens to thematic salons and corporate workstations built for longevity.',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#F6F5F2] text-[#161617] border-b border-[#DDD9D0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl mb-14 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-[1.5px] bg-[#B9322C]" />
            <span className="text-xs uppercase tracking-[0.28em] text-[#B9322C] font-mono font-medium">
              WHY SPACES BY MUSKAN
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#161617] leading-tight">
            Expressive design. <br />
            <span className="italic font-normal text-[#B9322C]">Executed with precision.</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#524E48] font-light leading-relaxed max-w-xl">
            Every residential home or commercial studio is crafted around functional zoning, custom joinery, Vastu harmony, and transparent 3D clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#FAF9F7] border border-[#DDD9D0] p-6 sm:p-7 rounded-xs flex flex-col justify-between space-y-5 hover:border-[#B9322C] hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#B9322C]">
                      {pillar.number}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#F6F5F2] border border-[#DDD9D0] flex items-center justify-center text-[#B9322C]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#161617] font-normal leading-snug">
                      {pillar.title}
                    </h3>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#B9322C] block mt-1">
                      {pillar.subtitle}
                    </span>
                  </div>

                  <p className="text-xs text-[#524E48] font-light leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DDD9D0]/70 text-[10px] font-mono text-[#76726B] uppercase">
                  Spaces by Muskan Standard
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
