export interface battlePokemon {
  winner: string;
  loser: string;
  opPokemon: number;
  hp: number;
}

export interface dialogMessage {
  text: string;
  type: string;
  timestamp: Date;
}

export interface battleResult {
  winner: string;
  pokemon: number;
  hp: number;
}

export interface battlePokemonUsed {
  pokemon_id: number;
  hp: number;
}
