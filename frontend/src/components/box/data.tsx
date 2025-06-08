'use client';

import { highlight } from '@/types/highlight';
import { motion } from 'framer-motion';
import { FC } from 'react';

interface DataBoxProps {
  highlight: highlight;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  delay?: number;
  xAxisAnimation?: number;
}

const DataBox: FC<DataBoxProps> = ({
  highlight,
  index,
  hoveredIndex,
  setHoveredIndex,
  delay,
  xAxisAnimation,
}) => {
  const isHovered = hoveredIndex === index;
  const isOtherHovered = hoveredIndex !== null && !isHovered;
  return (
    <motion.div
      initial={{ opacity: 0, x: xAxisAnimation || 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay || 0.5, ease: 'linear' }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      className={`
        flex justify-center items-center gap-4 p-4 text-xs md:text-base 
        border border-white/20 rounded-xl transition-all duration-300
        ${isHovered ? 'scale-105 bg-white/20' : 'bg-white/10'} 
        ${isOtherHovered ? 'brightness-75' : 'brightness-100'}
      `}
    >
      <div className="text-2xl">{highlight.icon}</div>
      <div>
        <h3 className="text-sm lg:text-lg text-center font-semibold text-white">
          {highlight.title}
        </h3>
        {highlight.description && <p className="text-sm text-white/80">{highlight.description}</p>}
      </div>
    </motion.div>
  );
};

export default DataBox;
