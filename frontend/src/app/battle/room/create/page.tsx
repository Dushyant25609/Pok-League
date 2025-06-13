import AnimatedBox from '@/components/animation/box';
import FloatingNavbar from '@/components/navbar/nav';
import NavTitle from '@/components/title/nav';
import BattleRoomForm from '@/components/forms/BattleRoomForm';
import { dropAnimation } from '@/motion/axis';

const BattleRoomPage = () => {
  return (
    <AnimatedBox
      className="w-full h-full self-center flex flex-col items-center gap-4"
      animation={dropAnimation}
    >
      <NavTitle title={'Battle Room'} />
      <FloatingNavbar />
      <BattleRoomForm />
    </AnimatedBox>
  );
};

export default BattleRoomPage;
