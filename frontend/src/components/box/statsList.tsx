'use client';
import React from 'react';
import PokemonRow, { PokemonStats } from './statsRow';
import { Pokemon } from '@/types/pokemon';

interface PokemonListProps {
  pokemon: Pokemon[];
  onPokemonSelect: (pokemonId: number) => void;
  selectedPokemonIds: number[];
}

const PokemonList = ({ pokemon, onPokemonSelect, selectedPokemonIds }: PokemonListProps) => {
  const pokeData: PokemonStats[] = pokemon.map((pokemon) => ({
    name: pokemon.Name,
    id: pokemon.ID,
    hp: pokemon.BaseStats.HP,
    speed: pokemon.BaseStats.Speed,
    attack: pokemon.BaseStats.Attack,
    defense: pokemon.BaseStats.Defense,
    specialAttack: pokemon.BaseStats.SpecialAttack,
    specialDefense: pokemon.BaseStats.SpecialDefense,
  }));
  return (
    <div className="space-y-4 w-full max-w-5xl mx-auto px-4">
      <div className="flex flex-col items-center justify-center gap-4">
        {pokeData.map((pokemon) => (
          <PokemonRow
            key={pokemon.id}
            pokemon={pokemon}
            onPokemonSelect={onPokemonSelect}
            isSelected={selectedPokemonIds.includes(pokemon.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PokemonList;
