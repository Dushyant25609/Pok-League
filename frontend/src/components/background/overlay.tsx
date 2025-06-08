'use client';

import { motion } from 'framer-motion';
import { darkenAnimation } from '@/motion/opacity';
import BackgroundAudio from './audio';
import { FC } from 'react';

interface BackgroundOverlayProps {
  src: string;
}

const BackgroundOverlay: FC<BackgroundOverlayProps> = ({ src }) => {
  return (
    <>
      <motion.div
        {...darkenAnimation}
        className="absolute top-0 left-0 w-full h-full -z-10 bg-black"
      />
      <BackgroundAudio src={src} />
    </>
  );
};

export default BackgroundOverlay;
