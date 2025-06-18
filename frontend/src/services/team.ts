import { TeamSubmitRequest } from '@/types/api';
import api from './base';

const baseUrl = '/pokemon';

export const submitPokemonTeam = async (userTeam: TeamSubmitRequest) => {
  try {
    const response = await api.post(baseUrl + '/team/submit', userTeam);
    return response.data;
  } catch (error) {
    console.error('Error submitting team:', error);
    throw error;
  }
};
