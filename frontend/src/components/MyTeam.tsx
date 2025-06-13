'use client';

import React from 'react';
import PokemonImage from './image/pokemon';

interface MyTeamProps {
  selectedPokemon: number[];
}

const MyTeam: React.FC<MyTeamProps> = ({ selectedPokemon }) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {selectedPokemon.map((id) => (
        <div key={id} className="flex flex-col items-center bg-gray-700/50 rounded-lg p-2">
          <PokemonImage id={id} alt={'pokemon'} className="w-16 h-16 object-contain" />
        </div>
      ))}
      {Array(6 - selectedPokemon.length)
        .fill(0)
        .map((_, index) => (
          <div
            key={`empty-${index}`}
            className="flex flex-col items-center justify-center bg-gray-700/30 rounded-lg p-2 border border-dashed border-gray-600 h-24"
          >
            <span className="text-gray-400 text-sm">Empty Slot</span>
          </div>
        ))}
    </div>
  );
};

export default MyTeam;
