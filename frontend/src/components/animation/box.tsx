'use client';

import { MotionAnimation } from '@/types/motion';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedBoxProps {
  children: ReactNode;
  className?: string;
  animation: MotionAnimation;
  onClick?: () => void;
}

export default function AnimatedBox({ children, className, animation, onClick }: AnimatedBoxProps) {
  return (
    <motion.div
      className={className}
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
