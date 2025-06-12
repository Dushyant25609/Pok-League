import { PokemonResponse } from '@/types/api';
import api from './base';

const baseUrl = '/pokemon';

export const getPokemonList = async (
  page: number = 1,
  limit: number = 18
): Promise<PokemonResponse> => {
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

export const getPokemonById = async (id: string) => {
  try {
    const response = await api.get(baseUrl + `/id/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokemon with ID ${id}:`, error);
    throw error;
  }
};

export const getPokemonByGen = async (page: number = 1, limit: number = 18, gen: number) => {
  try {
    const response = await api.get(baseUrl + `/gen/${gen}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokemon with Gen ${gen}:`, error);
    throw error;
  }
};
