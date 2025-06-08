'use client';

import { dropAnimation } from '@/motion/axis';
import { motion } from 'framer-motion';

const MainTitle = () => {
  return (
    <motion.h1
      {...dropAnimation}
      className="font-pokemon text-amber-300 text-stroke-3 text-5xl md:text-7xl lg:text-8xl xl:text-9xl"
    >
      Pok<span>é</span> L<span>e</span>a<span>g</span>u<span>e</span>
    </motion.h1>
  );
};

export default MainTitle;
