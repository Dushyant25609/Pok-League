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

export interface PokemonWithStats extends Pokemon {
  Stats: {
    ID: number;
    PokemonID: number;
    BattlesWon: number;
    BattlesLost: number;
    TotalBattles: number;
  };
}
