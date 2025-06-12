'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ children, className, delay = 0 }) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={variants} className={className}>
      {children}
    </motion.div>
  );
};

export default AnimatedText;
