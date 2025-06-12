'use client';

import { MotionAnimation } from '@/types/motion';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedBoxProps {
  children: ReactNode;
  className?: string;
  animation: MotionAnimation;
}

export default function AnimatedBox({ children, className, animation }: AnimatedBoxProps) {
  return (
    <motion.div
      className={className}
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
    >
      {children}
    </motion.div>
  );
}
