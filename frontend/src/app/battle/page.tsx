import AnimatedBox from '@/components/animation/box';
import RoomButtons from '@/components/buttons/battle';
import FloatingNavbar from '@/components/navbar/nav';
import NavTitle from '@/components/title/nav';
import { dropAnimation } from '@/motion/axis';

const BattlePage = () => {
  return (
    <AnimatedBox
      className="w-full h-full self-center flex flex-col items-center gap-4"
      animation={dropAnimation}
    >
      <NavTitle title={'Battle Arena'} />
      <FloatingNavbar />
      <RoomButtons />
    </AnimatedBox>
  );
};

export default BattlePage;
