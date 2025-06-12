import { FC } from 'react';
import PokemonImage from '../image/pokemon';
import { cn } from '@/lib/utils';
import { capitalize } from '@/lib/tools';
import AnimatedBox from '../animation/box';
import { liftAnimation } from '@/motion/axis';

interface LeagueDataRowProps {
  id: number;
  name: string;
  wins: number;
  loses: number;
}

const LeagueDataRow: FC<LeagueDataRowProps> = ({ id, name, wins, loses }) => {
  const winPercentage = ((wins / (wins + loses)) * 100).toFixed(2);
  return (
    <AnimatedBox
      animation={liftAnimation}
      className={cn(
        'grid grid-cols-3 md:grid-cols-6 items-center even:bg-gray-200/50 odd:bg-white/70 backdrop-blur-lg p-4 justify-items-center',
        'even:text-white odd:text-black text-xs lg:text-base font-medium'
      )}
    >
      <p className="flex justify-center items-center">
        <PokemonImage id={id} />
      </p>
      <p className="hidden md:flex">{id}</p>
      <p>{capitalize(name)}</p>
      <p className="hidden md:flex">{wins}</p>
      <p className="hidden md:flex">{loses}</p>
      <p>{winPercentage}%</p>
    </AnimatedBox>
  );
};

export default LeagueDataRow;
