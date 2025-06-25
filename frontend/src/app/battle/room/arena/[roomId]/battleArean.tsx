// Updated battleArena.tsx with mobile responsiveness
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useRoomStore from '@/store/room';
import useSocket from '@/hooks/useSocket';
import { Routes, SocketEvents } from '@/lib/routes';
import useTeamStore from '@/store/team';
import {
  battlePokemon,
  battlePokemonUsed,
  battleResult,
  dialogMessage,
  inBattlePokemon,
} from '@/types/battle';
import {
  SelectPokemonDialog,
  DialogDisplay,
  BattleResult,
  EndBattleScreen,
  OpponentUsedPokemons,
  DuringBattle,
  OpNextPokemon,
} from './battleComponents';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

const Waiting = () => (
  <div className="fixed h-screen w-screen top-0 left-0 z-50 bg-black/30 backdrop-blur-md flex flex-col items-center justify-center text-white px-4">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-red-600 border-opacity-75 mb-6" />
    <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
      Waiting for opponent to Submit their team...
    </h2>
  </div>
);

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
  const [opPokemonUsed, setOpPokemonUsed] = useState<battlePokemonUsed[]>([]);
  const [battlePokemon, setBattlePokemon] = useState<battlePokemon>({
    winner: '',
    loser: '',
    opPokemon: 0,
    hp: 0,
  });
  const [event, setEvent] = useState<string>('ongoing_battle');
  const [waitingOpponent, setWaitingOpponent] = useState<boolean>(false);
  const [dialogMessages, setDialogMessages] = useState<dialogMessage[]>([]);
  const [result, setResult] = useState<battleResult>({ winner: '', pokemon: 0, hp: 0 });
  const [showResultMessage, setShowResultMessage] = useState<boolean>(false);
  const [showEndScreen, setShowEndScreen] = useState<boolean>(false);
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [inBattlePokemon, setInBattlePokemon] = useState<inBattlePokemon>({
    pokemon1_name: '',
    pokemon2_name: '',
    pokemon1_id: 0,
    pokemon2_id: 0,
  });
  const [battleNumber, setBattleNumber] = useState<number>(0);
  const [battleLength, setBattleLength] = useState<number>(0);
  const dialogRef = useRef<dialogMessage[]>([]);
  const router = useRouter();
  const roomSocket = useSocket({ route: SocketEvents.Battle.replace(':roomId', roomId) });

  const sendPokemon = (pokemon_id: number) => {
    if (!roomSocket?.current || roomSocket?.current.readyState !== WebSocket.OPEN) return;
    roomSocket?.current.send(JSON.stringify({ username, pokemon_id, event }));
  };

  useEffect(() => {
    if (!roomSocket?.current) return;

    roomSocket.current.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        switch (data.event) {
          case 'pokemon_select':
            setEvent('ongoing_battle');
            setBattlePokemon({
              winner: data.winner,
              loser: data.loser,
              opPokemon: data.pokemon,
              hp: data.hp,
            });
            setWaitingOpponent(false);
            break;

          case 'dialog_update':
            setEvent('dialog_update');
            setDialogMessages((prev) => {
              const updated = [
                ...prev,
                {
                  text: data.text,
                  type: data.type,
                  timestamp: new Date(data.timestamp),
                },
              ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

              dialogRef.current = updated;
              if (prev.length === 0) setBattleNumber(battleLength);
              return updated;
            });
            break;

          case 'battle_result':
            setEvent('battle_result');
            setInBattle(false);
            setResult({ winner: data.winner, pokemon: data.pokemon, hp: data.hp });
            setShowResultMessage(true);
            setBattleNumber(battleLength);

            if (data.winner === username) {
              setWaitingOpponent(true);
              setPokemonUsed((prev) =>
                prev.map((poke) =>
                  poke.pokemon_id === data.winnerPokemon ? { ...poke, hp: data.hp } : poke
                )
              );
              setOpPokemonUsed((prev) => {
                const exists = prev.find((poke) => poke.pokemon_id === data.loserPokemon);
                return exists
                  ? prev.map((poke) =>
                      poke.pokemon_id === data.loserPokemon ? { ...poke, hp: 0 } : poke
                    )
                  : [...prev, { pokemon_id: data.loserPokemon, hp: 0 }];
              });
              toast.success('You win!');
            } else {
              setPokemonUsed((prev) =>
                prev.map((poke) =>
                  poke.pokemon_id === data.loserPokemon ? { ...poke, hp: 0 } : poke
                )
              );
              setOpPokemonUsed((prev) => {
                const exists = prev.find((poke) => poke.pokemon_id === data.winnerPokemon);
                return exists
                  ? prev.map((poke) =>
                      poke.pokemon_id === data.winnerPokemon ? { ...poke, hp: data.hp } : poke
                    )
                  : [...prev, { pokemon_id: data.winnerPokemon, hp: data.hp }];
              });
              setBattlePokemon({ winner: '', loser: '', opPokemon: 0, hp: 0 });
              toast.error('You lose!');
            }
            break;

          case 'end_battle':
            setShowEndScreen(true);
            setWaitingOpponent(false);
            setEvent('end_battle');
            break;

          case 'battle_start':
            setInBattle(true);
            setInBattlePokemon({
              pokemon1_name: data.p1,
              pokemon2_name: data.p2,
              pokemon1_id: data.p1_id,
              pokemon2_id: data.p2_id,
            });
            setBattleLength((prev) => prev + 1);
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
    <div className="flex flex-col lg:flex-row justify-between gap-4 text-white px-2 sm:px-4 w-full h-full py-2 sm:py-4 overflow-y-auto">
      {waitingOpponent && <Waiting />}

      <SelectPokemonDialog
        pokemons={pokemonUsed}
        onSelect={(poke) => sendPokemon(poke.pokemon_id)}
        isFirst={!dialogMessages.length}
        OpPokemonUsed={opPokemonUsed}
      />

      <div className="w-full space-y-4">
        <DialogDisplay
          dialogs={dialogMessages}
          battleNumber={battleNumber}
          battleLength={battleLength}
          onNext={() => setBattleNumber((prev) => Math.min(prev + 1, battleLength - 1))}
          onPrevious={() => setBattleNumber((prev) => Math.max(prev - 1, 0))}
        />
        {battlePokemon.opPokemon !== 0 && (
          <OpNextPokemon hp={battlePokemon.hp} id={battlePokemon.opPokemon} />
        )}
      </div>

      <Card className="bg-[#1e1e2f]/30 backdrop-blur-md border-0 text-white w-full sm:w-auto">
        <CardContent className="flex flex-col gap-3">
          <CardTitle>Opponent Pokemon</CardTitle>
          {opPokemonUsed.length !== 0 && <OpponentUsedPokemons pokemons={opPokemonUsed} />}
        </CardContent>
      </Card>

      {showResultMessage && (
        <BattleResult
          result={result.winner == username ? 'won' : 'lost'}
          onClear={() => setShowResultMessage(false)}
        />
      )}

      {inBattle && (
        <DuringBattle
          pokemon1={inBattlePokemon.pokemon1_name}
          pokemon2={inBattlePokemon.pokemon2_name}
          pokemon1_id={inBattlePokemon.pokemon1_id}
          pokemon2_id={inBattlePokemon.pokemon2_id}
        />
      )}

      {showEndScreen && (
        <EndBattleScreen
          winner={result.winner}
          onNewMatch={() => router.push(Routes.Battle)}
          onHome={() => router.push(Routes.Home)}
        />
      )}
    </div>
  );
};

export default BattleAreana;
