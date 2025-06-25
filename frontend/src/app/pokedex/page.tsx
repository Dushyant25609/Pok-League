import TabButton from '@/components/buttons/tab';
import { Card, CardContent } from '@/components/ui/card';
import { Gen } from '@/constants/generation';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getPokemonByGen, getPokemonList } from '@/services/pokedex';
import { Pokemon } from '@/types/pokemon';
import { PokemonResponse } from '@/types/api';
import PokedexBox from '@/components/box/pokedex';
import PaginationControl from '@/components/buttons/paginationControl';
import NavTitle from '@/components/title/nav';
import DropDown from '@/components/dropDown/dropDown';
import FloatingNavbar from '@/components/navbar/nav';
import { redis } from '@/lib/redis';
import AnimatedBox from '@/components/animation/box';
import { dropAnimation, liftAnimation } from '@/motion/axis';
import { NormalAnimation } from '@/motion/opacity';

async function getPokedexData(page: number, limit: number) {
  const cacheKey = `pokedex:data:page:${page}:limit:${limit}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return cached as PokemonResponse;
  }

  const data = await getPokemonList(page, limit);
  await redis.set(cacheKey, JSON.stringify(data), { ex: 86400 }); // Cache for 5 minutes

  return data;
}

async function getPokedexGenData(page: number, limit: number, gen: number) {
  const cacheKey = `pokedexGen:data:page:${page}:limit:${limit}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return cached as PokemonResponse;
  }

  const data = await getPokemonByGen(page, limit, gen);
  await redis.set(cacheKey, JSON.stringify(data), { ex: 86400 }); // Cache for 5 minutes

  return data;
}

export const metadata: Metadata = {
  title: 'Pokédex',
};

const Pokedex = async ({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string; page?: string; gen?: string }>;
}) => {
  const { limit, page, gen } = await searchParams;
  const limitInt = limit ? parseInt(limit) : 18;
  const pageInt = page ? parseInt(page) : 1;
  const genInt = gen ? parseInt(gen) : 0;

  if (
    isNaN(limitInt) ||
    isNaN(pageInt) ||
    limitInt <= 0 ||
    pageInt <= 0 ||
    genInt < 0 ||
    genInt > 9
  ) {
    redirect('/pokedex?limit=18&page=1&gen=1');
  }

  let Data: PokemonResponse;
  if (genInt) {
    Data = await getPokedexGenData(pageInt, limitInt, genInt);
  } else {
    Data = await getPokedexData(pageInt, limitInt);
  }
  console.log('data:', Data);

  return (
    <AnimatedBox
      animation={NormalAnimation}
      className="w-full h-full flex flex-col gap-4 items-center"
    >
      <NavTitle title={'Pokedex'} />

      <FloatingNavbar />
      <Card className="w-10/12 flex md flex-col items-center gap-4 backdrop-blur-sm bg-white/30 border border-black shadow-md p-2">
        <CardContent className="flex flex-wrap justify-center items-center gap-2 w-full md:hidden">
          <DropDown limit={limitInt} gen={genInt} />
        </CardContent>

        <AnimatedBox
          className="hidden md:flex flex-wrap justify-center items-center gap-2 w-full md:w-auto"
          animation={{
            ...dropAnimation,
            transition: { ...dropAnimation.transition, delay: 1.5 }, // Change only duration
          }}
        >
          <TabButton text={`All Gen`} gen={0} />
          {Gen.map((gen) => (
            <TabButton key={gen} text={`Gen ${gen}`} gen={gen} />
          ))}
        </AnimatedBox>

        <CardContent className="w-4/5">
          {/* Mobile carousel view */}
          <AnimatedBox
            animation={{
              ...liftAnimation,
              transition: { ...liftAnimation.transition, delay: 1.5 }, // Change only duration
            }}
            className="flex md:hidden overflow-x-auto space-x-2 no-scrollbar"
          >
            {Data &&
              Data.data.map((pokemon: Pokemon, index) => (
                <div key={pokemon.ID} className="min-w-[45%] max-w-[45%]">
                  <PokedexBox
                    key={pokemon.Name}
                    index={index}
                    name={pokemon.Name}
                    id={pokemon.ID}
                    type={pokemon.Types}
                  />
                </div>
              ))}
          </AnimatedBox>

          {/* Desktop grid view */}
          <AnimatedBox
            animation={{
              ...liftAnimation,
              transition: { ...liftAnimation.transition, delay: 0.5 }, // Change only duration
            }}
            className="hidden md:grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-6"
          >
            {Data &&
              Data.data.map((pokemon: Pokemon, index) => (
                <PokedexBox
                  key={pokemon.Name}
                  index={index}
                  name={pokemon.Name}
                  id={pokemon.ID}
                  type={pokemon.Types}
                />
              ))}
          </AnimatedBox>
        </CardContent>
        <PaginationControl page={pageInt} totalPages={Data.totalPages} />
      </Card>
    </AnimatedBox>
  );
};

export default Pokedex;
