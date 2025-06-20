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

export interface battleDialog {
  battle: number;
  dialogs: dialogMessage[];
}

export interface inBattlePokemon {
  pokemon1_name: string;
  pokemon2_name: string;
  pokemon1_id: number;
  pokemon2_id: number;
}
