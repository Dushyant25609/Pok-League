/* eslint-disable no-unused-vars */
'use client';
import React from 'react';
import PokemonImage from '../image/pokemon';

export interface PokemonStats {
  name: string;
  id: number;
  hp: number;
  speed: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
}

interface PokemonRowProps {
  pokemon: PokemonStats;
  onPokemonSelect: (pokemonId: number) => void;
  isSelected: boolean;
}

const PokemonRow: React.FC<PokemonRowProps> = ({ pokemon, onPokemonSelect, isSelected }) => {
  return (
    <div
      className={`flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 border backdrop-blur-md rounded-xl shadow transition hover:scale-[1.01] cursor-pointer ${
        isSelected ? 'bg-red-800/60 border-red-700' : 'bg-gray-800/40 border-gray-700'
      }`}
      onClick={() => onPokemonSelect(pokemon.id)}
    >
      <PokemonImage id={pokemon.id} alt={pokemon.name} className="w-20 h-20 object-contain" />
      <div className="flex-1 min-w-[150px]">
        <h2 className="text-lg font-semibold text-white capitalize">{pokemon.name}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-white w-full sm:w-auto">
        <Stat label="HP" value={pokemon.hp} />
        <Stat label="Speed" value={pokemon.speed} />
        <Stat label="Attack" value={pokemon.attack} />
        <Stat label="Defense" value={pokemon.defense} />
        <Stat label="Sp. Atk" value={pokemon.specialAttack} />
        <Stat label="Sp. Def" value={pokemon.specialDefense} />
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between bg-gray-800/60 backdrop-blur-md rounded px-3 py-2">
    <span className="text-xs font-medium">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default PokemonRow;
