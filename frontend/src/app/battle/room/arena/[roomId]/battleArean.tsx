'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useRoomStore from '@/store/room';
import useSocket from '@/hooks/useSocket';
import { Routes, SocketEvents } from '@/lib/routes';
import useTeamStore from '@/store/team';
import { battlePokemon, battlePokemonUsed, battleResult, dialogMessage } from '@/types/battle';
import {
  SelectPokemonDialog,
  OpponentUsedPokemons,
  DialogDisplay,
  BattleResult,
  EndBattleScreen,
} from './battleComponents';

const Waiting = () => {
  return (
    <div className=" flex flex-col items-center justify-center text-white px-4">
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-red-600 border-opacity-75 mb-6" />
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
        Waiting for opponent to Submit their team...
      </h2>
    </div>
  );
};

interface Props {
  roomId: string;
}

const BattleAreana = ({ roomId }: Props) => {
  const username = useRoomStore((state) => state.username);
  const team = useTeamStore((state) => state.team).map((p) => ({
    pokemon_id: p,
    hp: 100,
  }));

  const [pokemonUsed, setPokemonUsed] = useState<battlePokemonUsed[]>(team);
  const [battlePokemon, setBattlePokemon] = useState<battlePokemon>({
    winner: '',
    loser: '',
    opPokemon: 0,
    hp: 0,
  });
  const [event, setEvent] = useState<string>('ongoing_battle');
  const [waitingOpponent, setWaitingOpponent] = useState<boolean>(false);
  const [selectPokemon, setSelectPokemon] = useState<boolean>(true);
  const [dialogMessages, setDialogMessages] = useState<dialogMessage[]>([]);
  const [result, setResult] = useState<battleResult>({ winner: '', pokemon: 0, hp: 0 });
  const [showResultMessage, setShowResultMessage] = useState<boolean>(false);
  const [showEndScreen, setShowEndScreen] = useState<boolean>(false);
  const [countdownEnd, setCountdownEnd] = useState<string>('');
  const router = useRouter();

  // ✅ still called at top level
  const roomSocket = useSocket({ route: SocketEvents.Battle.replace(':roomId', roomId) });

  const sendPokemon = (pokemon_id: number) => {
    console.log('sendPokemon:', pokemon_id);
    console.log('WebSocket:', roomSocket?.current);
    console.log('WebSocket State:', roomSocket?.current?.readyState);
    if (!roomSocket?.current || roomSocket?.current.readyState !== WebSocket.OPEN) return;
    console.log('Data Sent:', { username, pokemon_id, event });
    roomSocket?.current.send(JSON.stringify({ username, pokemon_id, event }));
  };

  useEffect(() => {
    if (!roomSocket?.current) return;

    roomSocket.current.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        console.log('Data Received:', data);
        switch (data.event) {
          case 'pokemon_select':
            setEvent('ongoing_battle');
            setBattlePokemon({
              winner: data.winner,
              loser: data.loser,
              opPokemon: data.pokemon,
              hp: data.hp,
            });
            // eslint-disable-next-line no-case-declarations
            const time = new Date().getTime() + 20 * 1000;
            setCountdownEnd(time.toString());
            setWaitingOpponent(false);
            setSelectPokemon(true);
            break;

          case 'dialog_update':
            setEvent('dialog_update');
            setDialogMessages((prev) =>
              [
                ...prev,
                {
                  text: data.text,
                  type: data.type,
                  timestamp: new Date(data.timestamp),
                },
              ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            );
            break;

          case 'battle_result':
            setEvent('battle_result');
            setResult({ winner: data.winner, pokemon: data.pokemon, hp: data.hp });
            setShowResultMessage(true);
            setTimeout(() => setShowResultMessage(false), 2000);

            if (data.winner === username) {
              setPokemonUsed((prev) =>
                prev.map((poke) =>
                  poke.pokemon_id === data.winnerPokemon ? { ...poke, hp: data.hp } : poke
                )
              );
              setWaitingOpponent(true);
              setSelectPokemon(false);
              toast.success('You win!');
            } else {
              setPokemonUsed((prev) =>
                prev.map((poke) =>
                  poke.pokemon_id === data.loserPokemon ? { ...poke, hp: 0 } : poke
                )
              );
              setSelectPokemon(true);
              const time = new Date().getTime() + 20 * 1000;
              setCountdownEnd(time.toString());
              toast.error('You lose!');
            }
            break;

          case 'end_battle':
            setShowEndScreen(true);
            setEvent('end_battle');
            break;
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };
  }, [roomSocket?.current]);

  useEffect(() => {
    if (pokemonUsed.length > 0 && pokemonUsed.every((p) => p.hp === 0)) {
      if (!roomSocket?.current) return;
      roomSocket?.current.send(JSON.stringify({ username, pokemon_id: 1, event: 'end_battle' }));
    }
  }, [pokemonUsed, username, roomSocket?.current]);

  return (
    <div className="flex flex-col items-center justify-center text-white px-4 w-full h-full">
      {waitingOpponent && <Waiting />}
      {countdownEnd && <p>Time left: {countdownEnd}</p>}

      {selectPokemon && (
        <SelectPokemonDialog
          pokemons={pokemonUsed}
          onSelect={(poke) => sendPokemon(poke.pokemon_id)}
          isFirst={!dialogMessages.length}
          isOpen={selectPokemon}
        />
      )}

      {battlePokemon.opPokemon !== 0 && (
        <OpponentUsedPokemons
          pokemons={[{ pokemon_id: battlePokemon.opPokemon, hp: battlePokemon.hp }]}
        />
      )}

      <DialogDisplay dialogs={dialogMessages} />

      {showResultMessage && (
        <BattleResult
          result={result.winner === username ? 'won' : 'lost'}
          onClear={() => setShowResultMessage(false)}
        />
      )}

      {showEndScreen && (
        <EndBattleScreen
          winner={result.winner}
          loser={battlePokemon.loser}
          onNewMatch={() => router.push(Routes.Battle)}
          onHome={() => router.push(Routes.Home)}
        />
      )}
    </div>
  );
};

export default BattleAreana;
