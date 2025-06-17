import { getRoomPokemonList } from '@/services/room';
import { PokemonResponse } from '@/types/api';
import { FC } from 'react';
import PokemonSelectionClient from './PokemonSelectionClient';

type Props = {
  params: {
    roomId: string;
  };
  searchParams: {
    limit?: string;
    page?: string;
  };
};

const SelectionPage: FC<Props> = async ({ searchParams, params }) => {
  const { limit, page } = await searchParams;
  const { roomId } = await params;
  const limitNum = limit ? Number(limit) : 20;
  const pageNum = page ? Number(page) : 1;
  const Data: PokemonResponse = await getRoomPokemonList(roomId, limitNum, pageNum);

  return <PokemonSelectionClient initialData={Data} roomId={roomId} />;
};

export default SelectionPage;
