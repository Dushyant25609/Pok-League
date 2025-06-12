import { Pokemon, PokemonWithStats } from './pokemon';

export interface PokemonResponse {
  data: Pokemon[];
  limit: number;
  total: number;
  page: number;
  totalPages: number;
}

export interface PokemonStatsResponse {
  data: PokemonWithStats[];
  limit: number;
  total: number;
  page: number;
  totalPages: number;
}
