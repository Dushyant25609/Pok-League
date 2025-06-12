'use client';

import { motion } from 'framer-motion';
import { darkenAnimation } from '@/motion/opacity';
import BackgroundAudio from './audio';
import { Audio } from '@/constants/audio';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const BackgroundOverlay = () => {
  const [soundtrack, setSoundtrack] = useState<string>(Audio.INTRO);
  const pathname = usePathname();

  useEffect(() => {
    switch (true) {
      case pathname === '/':
        setSoundtrack(Audio.INTRO);
        break;
      case pathname.startsWith('/pokedex'):
        setSoundtrack(Audio.POKEDEX);
        break;
    }
  }, [pathname]);
  return (
    <>
      <motion.div
        {...darkenAnimation}
        className="absolute top-0 left-0 w-full h-full -z-10 bg-black"
      />
      <BackgroundAudio src={soundtrack} />
    </>
  );
};

export default BackgroundOverlay;
