'use client';

import { FC, useState, useEffect } from 'react';
import AnimatedBox from '@/components/animation/box';
import PokemonList from '@/components/box/statsList';
import PaginationControl from '@/components/buttons/paginationControl';
import Dialog from '@/components/Dialog';
import MyTeam from '@/components/MyTeam';
import NavTitle from '@/components/title/nav';
import { dropAnimation, liftAnimation } from '@/motion/axis';
import { PokemonResponse } from '@/types/api';

interface PokemonSelectionClientProps {
  initialData: PokemonResponse;
}

const PokemonSelectionClient: FC<PokemonSelectionClientProps> = ({ initialData }) => {
  const [selectedPokemonIds, setSelectedPokemonIds] = useState<number[]>([]);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

  useEffect(() => {
    console.log('selectedPokemonIds: ', selectedPokemonIds);
  }, [selectedPokemonIds]);

  const handlePokemonSelect = (pokemon: number) => {
    setSelectedPokemonIds((prevSelected) => {
      if (prevSelected.includes(pokemon)) {
        return prevSelected.filter((p) => p !== pokemon);
      } else {
        if (prevSelected.length < 6) {
          return [...prevSelected, pokemon];
        } else {
          return prevSelected;
        }
      }
    });
  };

  return (
    <AnimatedBox
      animation={dropAnimation}
      className="w-full h-full self-center flex flex-col items-center gap-4"
    >
      <NavTitle title={'Pokemon Selection'} />
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-center items-center">
        <AnimatedBox
          animation={dropAnimation}
          className="bg-white/75 overflow-scroll font-bold px-3 h-full flex items-center text-red-500 rounded-lg backdrop-blur-md"
        >
          **The HP of the Pokemon will be multiplied by 10 for better experience of battles
        </AnimatedBox>
        <button
          onClick={() => setIsTeamDialogOpen(true)}
          className="px-6 py-3 w-full md:w-fit md:h-full bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-800 transition-colors"
        >
          View My Team ({selectedPokemonIds.length}/6)
        </button>
        {selectedPokemonIds.length === 6 && (
          <button className="px-6 py-3 w-full md:w-fit md:h-full bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-800 transition-colors">
            Submit Team
          </button>
        )}
      </div>
      <AnimatedBox
        className="h-4/6 bg-black/30 overflow-scroll py-4 rounded-lg backdrop-blur-md"
        animation={liftAnimation}
      >
        {initialData && (
          <PokemonList
            pokemon={initialData.data}
            onPokemonSelect={handlePokemonSelect}
            selectedPokemonIds={selectedPokemonIds}
          />
        )}
      </AnimatedBox>
      <PaginationControl page={initialData.page} totalPages={initialData.totalPages} />

      <Dialog
        isOpen={isTeamDialogOpen}
        onClose={() => setIsTeamDialogOpen(false)}
        title="My Selected Team"
      >
        <MyTeam selectedPokemon={selectedPokemonIds} />
      </Dialog>
    </AnimatedBox>
  );
};

export default PokemonSelectionClient;
