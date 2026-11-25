import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STUDIO_CONFIG } from '../data/studioData';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: `What services are offered by ${STUDIO_CONFIG.name}?`,
    answer:
      'Spaces by Muskan delivers turnkey residential and commercial interior design, Vastu Shastra consultancy, 2D AutoCAD working drawings, photorealistic SketchUp & V-Ray 3D visualization, modular kitchens, and custom bedroom or commercial suites.',
  },
  {
    question: 'Do you provide 3D designs and 2D floor plans before construction starts?',
    answer:
      'Yes. We begin with scaled 2D AutoCAD floor plans and Vastu directional zoning, followed by photorealistic 3D views (SketchUp & V-Ray / 3ds Max) so you can review lighting, veneers, and layouts clearly prior to site execution.',
  },
  {
    question: 'Does Muskan Agarwal oversee site work and carpenters directly?',
    answer:
      'Yes. Muskan Agarwal regularly supervises work-in-progress milestones on site—coordinating carpenters, POP installers, electricians, and marble masons against detailed drawings.',
  },
  {
    question: 'Do you integrate Vastu principles without compromising modern styling?',
    answer:
      'Yes. As an Interior Designer and Vastu Consultant, Muskan blends practical Vastu orientation (kitchens, bedrooms, entrances, workstations) seamlessly with clean, contemporary interiors.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 lg:py-28 bg-[#FAF9F7] border-b border-[#DDD9D0]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs uppercase tracking-[0.28em] text-[#B9322C] font-mono block">
            FREQUENTLY ASKED
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#161617]">
            Studio Questions &amp; Clarity
          </h2>
        </div>

        <div className="divide-y divide-[#DDD9D0] border-t border-b border-[#DDD9D0]">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.question} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="font-serif text-xl sm:text-2xl text-[#161617] font-normal">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#B9322C] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-xs sm:text-sm text-[#524E48] font-light leading-relaxed max-w-2xl">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
