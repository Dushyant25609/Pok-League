import { getRoomPokemonList } from '@/services/room';
import { PokemonResponse } from '@/types/api';
import PokemonSelectionClient from './PokemonSelectionClient';

const SelectionPage = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<{ limit?: string; page?: string }>;
  params: Promise<{ roomId: string }>;
}) => {
  const { limit, page } = await searchParams;
  const { roomId } = await params;
  const limitNum = limit ? Number(limit) : 20;
  const pageNum = page ? Number(page) : 1;
  const Data: PokemonResponse = await getRoomPokemonList(roomId, limitNum, pageNum);

  return <PokemonSelectionClient initialData={Data} roomId={roomId} />;
};

export default SelectionPage;
