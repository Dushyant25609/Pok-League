import AnimatedBox from '@/components/animation/box';
import LeagueDataRow from '@/components/box/league';
import PaginationControl from '@/components/buttons/paginationControl';
import FloatingNavbar from '@/components/navbar/nav';
import NavTitle from '@/components/title/nav';
import { dropAnimation, liftAnimation } from '@/motion/axis';
import { getPokemonStatsList } from '@/services/league';
import { PokemonStatsResponse } from '@/types/api';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Pokemon Performance Stats',
};

const PerformanceStats = async ({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string; page?: string }>;
}) => {
  const { limit, page } = await searchParams;
  const limitInt = limit ? parseInt(limit) : 15;
  const pageInt = page ? parseInt(page) : 1;

  if (isNaN(limitInt) || isNaN(pageInt) || limitInt <= 0 || pageInt <= 0) {
    redirect('/league?limit=15&page=1');
  }

  const Data: PokemonStatsResponse = await getPokemonStatsList(pageInt, limitInt);

  return (
    <AnimatedBox
      animation={dropAnimation}
      className="w-full h-full self-center flex flex-col items-center gap-4"
    >
      <NavTitle title={'Performance'} />
      <FloatingNavbar />
      <AnimatedBox animation={liftAnimation} className="md:w-9/12 md:h-3/5 mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-6 font-bold text-xs md:text-base text-white p-3 bg-zinc-600 rounded-t-lg backdrop-blur-2xl justify-items-center">
          <h2></h2>
          <h2 className="hidden md:flex">ID</h2>
          <h2>Name</h2>
          <h2 className="hidden md:flex">Wins</h2>
          <h2 className="hidden md:flex">Loses</h2>
          <h2>Win Percentage</h2>
        </div>
        <div className="flex flex-col h-full overflow-y-scroll ">
          {Data.data &&
            Data.data.map((pokemon, index) => {
              return (
                <LeagueDataRow
                  key={index}
                  id={pokemon.ID}
                  name={pokemon.Name}
                  wins={pokemon.Stats.BattlesWon}
                  loses={pokemon.Stats.BattlesLost}
                />
              );
            })}
        </div>
        <div className="bg-zinc-600/ backdrop-blur-lg rounded-b-lg p-2">
          <PaginationControl page={pageInt} totalPages={Data.totalPages} />
        </div>
      </AnimatedBox>
    </AnimatedBox>
  );
};

export default PerformanceStats;
