import TabButton from '@/components/buttons/tab';
import { Card, CardContent } from '@/components/ui/card';
import { Gen } from '@/constants/generation';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getPokemonList } from '@/services/pokedex';
import { Pokemon } from '@/types/pokemon';
import { PokemonResponse } from '@/types/api';
import PokedexBox from '@/components/box/pokedex';
import PaginationControl from '@/components/buttons/paginationControl';

type Props = {
  searchParams: {
    limit?: string;
    page?: string;
  };
};

export const metadata: Metadata = {
  title: 'Pokédex',
};

const Pokedex = async ({ searchParams }: Props) => {
  const limit = Number(searchParams?.limit || 15);
  const page = Number(searchParams?.page || 1);

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
    redirect('/pokedex?limit=16&page=1');
  }

  const Data: PokemonResponse = await getPokemonList(page, limit);

  return (
    <div className="h-full w-full">
      <div className="bg-gradient-to-b from-red-800 from-48% flex justify-center py-4 via-black to-52% to-gray-300 text-center font-long text-4xl md:text-5xl lg:text-6xl font-black text-white text-stroke-1 border-3 animate-pokeball border-black">
        <h1 className="bg-white w-fit px-4 rounded-full py-2 border-4 border-black">Pokedex</h1>
      </div>

      <div className="p-1 md:p-4 flex flex-col justify-center items-center gap-3 md:gap-6 2xl:w-9/12 mx-auto">
        <Card className="flex-row items-center gap-0">
          <CardContent className=" flex flex-col items-center gap-2">
            {Gen.map((gen) => {
              return <TabButton key={gen} text={`Generation ` + gen} route={''} active={false} />;
            })}
            <PaginationControl page={page} totalPages={Data.totalPages} />
          </CardContent>
          <CardContent>
            <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
              {Data &&
                Data.data.map((pokemon: Pokemon) => {
                  return (
                    <PokedexBox
                      key={pokemon.pokemon_id}
                      name={pokemon.name}
                      id={pokemon.pokemon_id}
                      type={pokemon.types}
                    />
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Pokedex;
