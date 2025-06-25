import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { battlePokemonUsed, dialogMessage } from '@/types/battle';
import PokemonImage from '@/components/image/pokemon';
import AnimatedBox from '@/components/animation/box';
import { dropAnimation } from '@/motion/axis';
import { Button } from '@/components/ui/button';

// 1. SelectPokemonDialog
export function SelectPokemonDialog({
  pokemons,
  onSelect,
  isFirst,
}: {
  pokemons: battlePokemonUsed[];
  onSelect: (poke: battlePokemonUsed) => void;
  isFirst: boolean;
  OpPokemonUsed: battlePokemonUsed[];
}) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <Card className="bg-[#1e1e2f]/30 backdrop-blur-md border-0 text-white">
      <CardContent className="flex flex-col gap-3">
        <CardTitle>{isFirst ? 'Select your Starter' : 'Choose your Pokémon'}</CardTitle>

        <div className="grid grid-cols-2  place-items-stretch gap-3">
          {pokemons.map((poke) => (
            <Card
              key={poke.pokemon_id}
              className={cn(
                'backdrop-blur-md font-bold aspect-square p-2 text-white border-0 transition-all cursor-pointer hover:ring-2 flex flex-col justify-center items-center',
                poke.hp > 70
                  ? 'bg-green-200/30'
                  : poke.hp > 30
                    ? 'bg-yellow-200/30'
                    : 'bg-red-200/30',
                poke.hp == 0 ? 'brightness-10' : '',
                selected === poke.pokemon_id ? 'ring-4 ring-offset-2' : ''
              )}
              onClick={() => {
                if (poke.hp == 0) {
                  return;
                }

                setSelected(poke.pokemon_id);
                onSelect(poke);
              }}
            >
              <span
                className={cn(
                  'absolute bottom-0 right-0 w-full rounded-xl bg-amber-500/30',
                  poke.hp > 70
                    ? 'bg-green-500/40'
                    : poke.hp > 30
                      ? 'bg-yellow-500/40'
                      : 'bg-red-500/40'
                )}
                style={{ height: `${poke.hp}%` }}
              />
              <PokemonImage className="z-20" id={poke.pokemon_id} />
              <div className="text-sm text-center z-20">HP: {poke.hp}%</div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 2. OpponentUsedPokemons
export function OpponentUsedPokemons({ pokemons }: { pokemons: battlePokemonUsed[] }) {
  return (
    <div className="grid grid-cols-2 place-items-stretch gap-3">
      {pokemons.map((poke) => (
        <Card
          key={poke.pokemon_id}
          className={cn(
            'p-2 items-center justify-center font-bold relative text-white border-0 aspect-square ',
            poke.hp > 70 ? 'bg-green-200/30' : poke.hp > 30 ? 'bg-yellow-200/30' : 'bg-red-200/30',
            poke.hp == 0 ? 'brightness-10' : ''
          )}
        >
          <span
            className={cn(
              'absolute bottom-0 right-0 w-full rounded-xl',
              poke.hp > 70 ? 'bg-green-500/40' : poke.hp > 30 ? 'bg-yellow-500/40' : 'bg-red-500/40'
            )}
            style={{ height: `${poke.hp}%` }}
          />
          <PokemonImage className="z-20" id={poke.pokemon_id} />
          <div className="text-center text-sm z-20">HP: {poke.hp}%</div>
        </Card>
      ))}
    </div>
  );
}

export function DialogDisplay({
  dialogs,
  battleNumber = 0,
  battleLength = 0,
  onNext,
  onPrevious,
}: {
  dialogs: dialogMessage[];
  battleNumber?: number;
  battleLength?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}) {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [narration, setNarration] = useState<dialogMessage[]>([]);

  const getDialogStyle = (type: string) => {
    switch (type) {
      case 'winner':
        return 'bg-green-500/30 border-green-500 text-green-200';
      case 'loser':
        return 'bg-red-500/30 border-red-500 text-red-200';
      case 'damage':
        return 'bg-orange-500/30 border-orange-500 text-orange-200';
      case 'critical':
        return 'bg-purple-500/30 border-purple-500 text-purple-200';
      case 'attack':
        return 'bg-blue-500/30 border-blue-500 text-blue-200';
      case 'dodge':
        return 'bg-yellow-500/30 border-yellow-500 text-yellow-200';
      case 'battle_start':
        return 'bg-cyan-500/30 font-bold border-cyan-500 text-cyan-200 text-center';
      default:
        return 'bg-gray-500/20 border-gray-500 text-white';
    }
  };

  // Update start and end indices when battleNumber changes
  useEffect(() => {
    if (dialogs.length === 0) {
      setStart(0);
      setEnd(0);
      setNarration([]);
      return;
    }

    // Find the start and end indices for the current battle
    let battleCount = 0;
    let currentBattleStart = dialogs.length - 1;

    for (let i = 0; i < dialogs.length; i++) {
      if (dialogs[i].type === 'battle_start') {
        if (battleCount === battleNumber) {
          currentBattleStart = i;
        }
        battleCount++;
      }
    }

    // If we're looking at the current battle (or if there's only one battle)
    if (battleNumber === battleCount - 1 || battleCount === 0) {
      setStart(currentBattleStart);
      setEnd(dialogs.length);
    } else {
      // Find the end of this battle (start of next battle)
      let nextBattleStart = dialogs.length;
      for (let i = currentBattleStart + 1; i < dialogs.length; i++) {
        if (dialogs[i].type === 'battle_start') {
          nextBattleStart = i;
          break;
        }
      }
      setStart(currentBattleStart);
      setEnd(nextBattleStart);
    }
  }, [battleNumber, dialogs]);

  // Update narration when start and end change
  useEffect(() => {
    if (dialogs.length === 0) {
      setNarration([]);
      return;
    }
    setNarration(dialogs.slice(start, end));
  }, [start, end, dialogs]);

  return (
    <Card className="w-full border-0 h-fit max-h-1/2 overflow-y-scroll p-4 text-white backdrop-blur-md bg-[#1e1e2f]/30 rounded-xl">
      <div className="flex justify-between items-center mb-2">
        <CardTitle className="text-white">Match Dialog</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={battleNumber === 0 || !onPrevious}
            className="text-black border-white/30 hover:bg-white/10"
          >
            Previous Battle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={battleNumber === battleLength - 1 || !onNext}
            className="text-black border-white/30 hover:bg-white/10"
          >
            Next Battle
          </Button>
        </div>
      </div>
      <CardContent className="transform w-full space-y-2">
        {narration.length > 0 ? (
          narration.map((dialog, index) => (
            <div
              key={index}
              className={cn(
                'text-sm px-4 py-2 border-l-4 rounded-md shadow',
                getDialogStyle(dialog.type)
              )}
            >
              <div className="font-semibold capitalize">{dialog.type}</div>
              <div>{dialog.text}</div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">No dialog messages to display</div>
        )}
      </CardContent>
    </Card>
  );
}

export function BattleResult({ result, onClear }: { result: string; onClear: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onClear(), 5000);
    return () => clearTimeout(timer);
  }, [result]);

  const isWin = result === 'won';

  return (
    <div className="fixed top-0 left-0 backdrop-blur-md h-screen w-screen bg-[#1e1e2f]/40 z-50">
      <AnimatedBox
        animation={dropAnimation}
        className={cn(
          'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-4xl font-extrabold px-10 py-6 rounded-3xl shadow-2xl border-4',
          isWin
            ? 'bg-gradient-to-br from-green-400 to-green-700 text-white border-green-300'
            : 'bg-gradient-to-br from-red-400 to-red-700 text-white border-red-300'
        )}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <span className="text-6xl animate-bounce">{isWin ? '🎉' : '💀'}</span>
          <span>{isWin ? 'Victory!' : 'Defeat!'}</span>
          <span className="text-base font-medium">
            {isWin ? 'You crushed your opponent!' : 'Better luck next time!'}
          </span>
        </div>
      </AnimatedBox>
    </div>
  );
}

export function EndBattleScreen({
  winner,
  onNewMatch,
  onHome,
}: {
  winner: string;
  onNewMatch: () => void;
  onHome: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <AnimatedBox
        animation={dropAnimation}
        className="bg-gradient-to-br from-indigo-700 to-purple-900 text-white rounded-2xl p-8 w-[90%] max-w-md text-center shadow-2xl space-y-6"
      >
        <h2 className="text-4xl font-extrabold tracking-wider">Battle Over</h2>

        <div className="space-y-2 text-lg">
          <p className="text-green-300 font-semibold">
            🎉 Winner: <span className="text-white">{winner}</span>
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={onNewMatch}>
            New Match
          </Button>
          <Button
            variant="outline"
            className="border-white text-black hover:bg-white/10"
            onClick={onHome}
          >
            Home
          </Button>
        </div>
      </AnimatedBox>
    </div>
  );
}

export function DuringBattle({
  pokemon1,
  pokemon2,
  pokemon1_id,
  pokemon2_id,
}: {
  pokemon1: string;
  pokemon2: string;
  pokemon1_id: number;
  pokemon2_id: number;
}) {
  return (
    <AnimatedBox
      animation={dropAnimation}
      className="fixed h-screen w-screen top-0 left-0 flex justify-evenly items-center px-6 py-10  bg-gradient-to-r from-blue-950/95 to-red-950/95 backdrop-blur-md shadow-2xl overflow-hidden border border-white/10"
    >
      {/* Left Side - Player 1 */}
      <AnimatedBox
        animation={dropAnimation}
        className="flex flex-col aspect-square items-center justify-center space-y-2 w-1/4 bg-blue-900/30 p-4 rounded-xl border border-blue-400 shadow-md"
      >
        <PokemonImage className="w-2/3" id={pokemon1_id} />
        <span className="text-white text-lg font-semibold">{pokemon1}</span>
      </AnimatedBox>

      {/* VS Text */}
      <div className="text-5xl sm:text-6xl font-black text-white mx-6 animate-pulse drop-shadow-md">
        VS
      </div>

      {/* Right Side - Player 2 */}
      <AnimatedBox
        animation={dropAnimation}
        className="flex flex-col aspect-square items-center justify-center space-y-2 w-1/4 bg-red-900/30 p-4 rounded-xl border border-red-400 shadow-md"
      >
        <PokemonImage className="w-2/3" id={pokemon2_id} />
        <span className="text-white text-lg font-semibold">{pokemon2}</span>
      </AnimatedBox>
    </AnimatedBox>
  );
}

export const OpNextPokemon = ({ id, hp }: { id: number; hp: number }) => {
  return (
    <Card
      key={id}
      className={cn(
        'p-2 w-1/5 z-0  items-center justify-center font-bold relative text-white border-0 aspect-square ',
        hp > 70 ? 'bg-green-200/30' : hp > 30 ? 'bg-yellow-200/30' : 'bg-red-200/30',
        hp == 0 ? 'brightness-10' : ''
      )}
    >
      <span
        className={cn(
          'absolute text-white bottom-0 right-0 w-full rounded-xl',
          hp > 70 ? 'bg-green-500/40' : hp > 30 ? 'bg-yellow-500/40' : 'bg-red-500/40'
        )}
        style={{ height: `${hp}%` }}
      />
      <span className="z-20">Next pokemon</span>
      <PokemonImage className="z-20" id={id} />
      <div className="text-center text-sm z-20">HP: {hp}%</div>
    </Card>
  );
};
