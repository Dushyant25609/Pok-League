import BattleAreana from './battleArean';

interface Props {
  params: {
    roomId: string;
  };
}

const ArenaPage = async ({ params }: Props) => {
  const { roomId } = await params;
  return <BattleAreana roomId={roomId} />;
};

export default ArenaPage;
