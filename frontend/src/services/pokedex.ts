import { PokemonResponse } from '@/types/api';
import api from './base';

export const getPokemonList = async (
  page: number = 1,
  limit: number = 16
): Promise<PokemonResponse> => {
  try {
    const response = await api.get('/pokemon', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};

export const getPokemonById = async (id: string) => {
  try {
    const response = await api.get(`/pokemon/id/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokemon with ID ${id}:`, error);
    throw error;
  }
};
