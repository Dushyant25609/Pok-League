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

export interface RoomCreateResponse {
  room_id: string;
  code: string;
  status: string;
}

export interface JoinRoomResponse {
  room_id: string;
  host_username: string;
  guest_username: string;
  status: string;
}
