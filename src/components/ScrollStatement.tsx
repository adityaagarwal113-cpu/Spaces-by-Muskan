import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ScrollStatementProps {
  primaryText?: string;
  italicText?: string;
  theme?: 'light' | 'dark';
}

export const ScrollStatement: React.FC<ScrollStatementProps> = ({
  primaryText = 'SPACES WITH INTENTION',
  italicText = 'CRAFTED FOR LIVING',
  theme = 'light',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Maximum subtle movement 20px–45px, restrained and architectural
  const x1 = useTransform(scrollYProgress, [0, 1], [-25, 25]);
  const x2 = useTransform(scrollYProgress, [0, 1], [25, -25]);

  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      className={`py-16 sm:py-24 overflow-hidden border-y select-none pointer-events-none transition-colors ${
        isDark
          ? 'bg-[#181716] border-white/10 text-white'
          : 'bg-[#F5F3EF] border-[#EBE7E0] text-[#181716]'
      }`}
      aria-hidden="true"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          style={{ x: x1 }}
          className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight uppercase whitespace-nowrap opacity-25 flex items-center gap-6"
        >
          <span>{primaryText}</span>
          <span className="w-12 h-[1px] bg-current inline-block opacity-40" />
          <span className="italic font-normal">{italicText}</span>
          <span className="w-12 h-[1px] bg-current inline-block opacity-40" />
          <span>{primaryText}</span>
        </motion.div>

        <motion.div
          style={{ x: x2 }}
          className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight uppercase whitespace-nowrap opacity-15 flex items-center gap-6 mt-3"
        >
          <span className="italic font-normal">{italicText}</span>
          <span className="w-12 h-[1px] bg-current inline-block opacity-40" />
          <span>{primaryText}</span>
          <span className="w-12 h-[1px] bg-current inline-block opacity-40" />
          <span className="italic font-normal">{italicText}</span>
        </motion.div>
      </div>
    </div>
  );
};
