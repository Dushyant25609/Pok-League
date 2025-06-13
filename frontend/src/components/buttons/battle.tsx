'use client';
import { LeftToRightAnimation, RightToLeftAnimation } from '@/motion/axis';
import AnimatedBox from '../animation/box';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/routes';

const RoomButtons = () => {
  const router = useRouter();
  const handleCreateBattle = (route: string) => {
    router.push(route);
  };
  return (
    <div className="flex h-1/2 gap-3 justify-center items-center">
      <AnimatedBox
        onClick={() => handleCreateBattle(Routes.CreateRoom)}
        className="aspect-square border-8 basis-1 border-red-700 bg-red-700/20 hover:bg-red-700 transition-all duration-500 backdrop-blur-xs  p-6 rounded-3xl flex items-center text-7xl font-long font-black text-white text-stroke-red-0"
        animation={LeftToRightAnimation}
      >
        Create Battle
      </AnimatedBox>
      <AnimatedBox
        onClick={() => handleCreateBattle(Routes.JoinRoom)}
        className="aspect-square border-8 basis-1 border-amber-300 bg-amber-300/20 hover:bg-amber-300 transition-all duration-500 backdrop-blur-xs  p-6 rounded-3xl flex items-center text-7xl font-long font-black text-white text-stroke-amber-0"
        animation={RightToLeftAnimation}
      >
        Join Battle
      </AnimatedBox>
    </div>
  );
};

export default RoomButtons;
