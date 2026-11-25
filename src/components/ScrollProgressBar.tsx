import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full h-[2px] bg-transparent overflow-hidden">
        <motion.div
          className="h-full bg-[#8E4A36] origin-left"
          style={{ scaleX }}
        />
      </div>
    </div>
  );
};
