import AnimatedBox from '@/components/animation/box';
import BattleAreana from './battleArean';
import { dropAnimation } from '@/motion/axis';
import NavTitle from '@/components/title/nav';

interface Props {
  params: {
    roomId: string;
  };
}

const ArenaPage = async ({ params }: Props) => {
  const { roomId } = await params;
  return (
    <AnimatedBox className="w-full h-full flex flex-col gap-0" animation={dropAnimation}>
      <NavTitle title="Battle" />
      <BattleAreana roomId={roomId} />
    </AnimatedBox>
  );
};

export default ArenaPage;
