import { JoinRoomResponse, PokemonResponse, RoomCreateResponse } from '@/types/api';
import api from './base';

const baseUrl = '/room';

export const createBattleRoom = async (
  username: string,
  generations: number[],
  banned_types: number[],
  allow_legendaries: boolean,
  allow_mythical: boolean,
  team_selection_time: number
): Promise<RoomCreateResponse> => {
  try {
    const response = await api.post(baseUrl + '/create/' + username, {
      generations,
      banned_types,
      allow_legendaries,
      allow_mythical,
      team_selection_time,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};

export const joinBattleRoom = async (
  username: string,
  roomCode: string
): Promise<JoinRoomResponse> => {
  try {
    const response = await api.post(baseUrl + '/join/' + username, {
      code: roomCode,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};

export const getRoomPokemonList = async (
  roomId: string,
  limit: number,
  page: number
): Promise<PokemonResponse> => {
  try {
    const response = await api.get(
      baseUrl + '/' + roomId + '/pokemon' + '?limit=' + limit + '&page=' + page
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};
