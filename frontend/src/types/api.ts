import { Pokemon } from './pokemon';

export interface PokemonResponse {
  data: Pokemon[];
  limit: number;
  total: number;
  page: number;
  totalPages: number;
}
