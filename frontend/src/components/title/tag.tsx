'use client';
import { LeftToRightAnimation, RightToLeftAnimation } from '@/motion/axis';
import { motion } from 'framer-motion';
import { WordRotate } from '../magicui/word-rotate';
import { FC } from 'react';
import { cn } from '@/lib/utils';

interface TagTitleProps {
  text: string;
  size?: 'default' | 'lg' | 'xl';
}

const Sizes = {
  default: 'text-3xl md:text-5xl',
  lg: 'text-5xl md:text-7xl lg:text-8xl',
  xl: 'text-7xl md:text-9xl',
};

const TagTitle: FC<TagTitleProps> = ({ text, size = 'default' }) => {
  return (
    <div className="flex flex-col justify-center">
      <motion.div
        {...LeftToRightAnimation}
        className="border-[#942d0a] border-1 md:border-2 py-[0.5]  rounded-lg w-full bg-orange-700"
      />
      <WordRotate
        words={[text]}
        className={cn('font-long self-center text-orange-700 text-stroke-2', Sizes[size])}
      />
      <motion.div
        {...RightToLeftAnimation}
        className="border-[#942d0a] border-1 md:border-2 py-[0.5]  rounded-lg w-full bg-orange-700"
      />
    </div>
  );
};

export default TagTitle;
