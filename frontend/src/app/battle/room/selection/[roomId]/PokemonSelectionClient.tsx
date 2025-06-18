'use client';

import { FC, useState, useEffect } from 'react';
import AnimatedBox from '@/components/animation/box';
import PokemonList from '@/components/box/statsList';
import PaginationControl from '@/components/buttons/paginationControl';
import Dialog from '@/components/Dialog';
import MyTeam from '@/components/MyTeam';
import NavTitle from '@/components/title/nav';
import { dropAnimation, liftAnimation } from '@/motion/axis';
import { PokemonResponse } from '@/types/api';
import useSocket from '@/hooks/useSocket';
import { Routes, SocketEvents } from '@/lib/routes';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';
import useRoomStore from '@/store/room';
import { TeamSubmitRequest } from '@/types/api';
import { submitPokemonTeam } from '@/services/team';
import useTeamStore from '@/store/team';
import { useRouter } from 'next/navigation';

interface PokemonSelectionClientProps {
  initialData: PokemonResponse;
  roomId: string;
}

const PokemonSelectionClient: FC<PokemonSelectionClientProps> = ({ initialData, roomId }) => {
  const [selectedPokemonIds, setSelectedPokemonIds] = useState<number[]>([]);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const roomSocket = useSocket({ route: SocketEvents.SelectPokemon.replace(':roomId', roomId) });
  const [deadline, setDeadline] = useState<string | null>(null);
  const countdown = useCountdown(deadline);
  const username = useRoomStore((state) => state.username);
  const router = useRouter();

  const submitTeam = async (username: string, roomid: string, pokemonIds: number[]) => {
    const team: TeamSubmitRequest = {
      username,
      room_code: roomid,
      pokemon_ids: pokemonIds,
    };
    await submitPokemonTeam(team).then(() => {
      useTeamStore.setState({ username, team: pokemonIds });
      router.push(Routes.BattleRoom.replace(':roomId', roomid));
    });
  };

  useEffect(() => {
    const socket = roomSocket.current;
    if (!socket) return;

    socket.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        setDeadline(message.deadline);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
    // Clean up when component unmounts
    return () => {
      socket.close();
    };
  }, [roomSocket.current]);

  const handlePokemonSelect = (pokemon: number) => {
    setSelectedPokemonIds((prevSelected) => {
      if (prevSelected.includes(pokemon)) {
        return prevSelected.filter((p) => p !== pokemon);
      } else {
        if (prevSelected.length < 6) {
          return [...prevSelected, pokemon];
        } else {
          return prevSelected;
        }
      }
    });
  };

  return (
    <AnimatedBox
      animation={dropAnimation}
      className="w-full h-full self-center flex flex-col items-center gap-4"
    >
      <NavTitle title={'Pokemon Selection'} />
      {countdown !== null && (
        <div className="flex items-center gap-2 bg-radial-[at_50%_50%] to-zinc-400 from-white from-40% px-4 py-2 rounded-xl shadow-md font-semibold text-lg">
          <span className="animate-pulse text-xl">⏳</span>
          <span>Time left:</span>
          <span className={cn('font-bold text-xl', countdown < 60 && 'text-red-500')}>
            {countdown}s
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-center items-center">
        <AnimatedBox
          animation={dropAnimation}
          className="bg-white/75 overflow-scroll font-bold px-3 h-full flex items-center text-red-500 rounded-lg backdrop-blur-md"
        >
          **The HP of the Pokemon will be multiplied by 10 for better experience of battles
        </AnimatedBox>
        <button
          onClick={() => setIsTeamDialogOpen(true)}
          className="px-6 py-3 w-full md:w-fit md:h-full bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-800 transition-colors"
        >
          View My Team ({selectedPokemonIds.length}/6)
        </button>
        {selectedPokemonIds.length === 6 && (
          <button
            onClick={() => submitTeam(username, roomId, selectedPokemonIds)}
            type="submit"
            className="px-6 py-3 w-full md:w-fit md:h-full bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-800 transition-colors"
          >
            Submit Team
          </button>
        )}
      </div>
      <AnimatedBox
        className="h-3/5 bg-black/30 overflow-scroll py-4 rounded-lg backdrop-blur-md"
        animation={liftAnimation}
      >
        {initialData && (
          <PokemonList
            pokemon={initialData.data}
            onPokemonSelect={handlePokemonSelect}
            selectedPokemonIds={selectedPokemonIds}
          />
        )}
      </AnimatedBox>
      <PaginationControl page={initialData.page} totalPages={initialData.totalPages} />

      <Dialog
        isOpen={isTeamDialogOpen}
        onClose={() => setIsTeamDialogOpen(false)}
        title="My Selected Team"
      >
        <MyTeam selectedPokemon={selectedPokemonIds} />
      </Dialog>
    </AnimatedBox>
  );
};

export default PokemonSelectionClient;
