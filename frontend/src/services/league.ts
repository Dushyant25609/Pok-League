import { PokemonStatsResponse } from '@/types/api';
import api from './base';

const baseUrl = '/pokemon/stats';

export const getPokemonStatsList = async (
  page: number = 1,
  limit: number = 15
): Promise<PokemonStatsResponse> => {
  try {
    const response = await api.get(baseUrl, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};
