export interface BaseStats {
  ID: number;
  PokemonID: number;
  HP: number;
  Attack: number;
  Defense: number;
  SpecialAttack: number;
  SpecialDefense: number;
  Speed: number;
}

export interface Pokemon {
  pokemon_id: number;
  name: string;
  types: string[];
  baseStats: BaseStats;
}
