import AnimatedBox from '@/components/animation/box';
import { JoinRoomForm } from '@/components/forms/JoinRoomForm';
import FloatingNavbar from '@/components/navbar/nav';
import NavTitle from '@/components/title/nav';
import { dropAnimation } from '@/motion/axis';

export default function JoinRoomPage() {
  return (
    <AnimatedBox
      animation={dropAnimation}
      className="w-full h-full self-center flex flex-col items-center gap-4"
    >
      <NavTitle title="Battle Room" />
      <FloatingNavbar />
      <JoinRoomForm />
    </AnimatedBox>
  );
}
