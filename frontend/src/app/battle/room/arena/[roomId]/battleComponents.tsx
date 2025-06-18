import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { battlePokemonUsed, dialogMessage } from '@/types/battle';
import PokemonImage from '@/components/image/pokemon';

// 1. SelectPokemonDialog
export function SelectPokemonDialog({
  pokemons,
  onSelect,
  isOpen,
  isFirst,
}: {
  pokemons: battlePokemonUsed[];
  onSelect: (poke: battlePokemonUsed) => void;
  isOpen: boolean;
  isFirst: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isFirst ? 'Select your Starter' : 'Choose your Pokémon'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          {pokemons.map((poke) => (
            <Card
              key={poke.pokemon_id}
              className={cn(
                'p-2 transition-all cursor-pointer hover:ring-2 flex flex-col justify-center items-center',
                poke.hp > 70 ? 'bg-green-200' : poke.hp > 30 ? 'bg-yellow-200' : 'bg-red-200',
                selected === poke.pokemon_id ? 'ring-4 ring-offset-2' : ''
              )}
              onClick={() => {
                console.log('OnClick:', poke.pokemon_id);
                setSelected(poke.pokemon_id);
                onSelect(poke);
              }}
            >
              <PokemonImage id={poke.pokemon_id} />
              <div className="text-sm text-center">HP: {poke.hp}%</div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 2. OpponentUsedPokemons
export function OpponentUsedPokemons({ pokemons }: { pokemons: battlePokemonUsed[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {pokemons.map((poke) => (
        <Card key={poke.pokemon_id} className="p-2 bg-muted">
          <div className="text-center text-xs">Name</div>
          <PokemonImage id={poke.pokemon_id} />
          <div className="text-center text-sm">HP: {poke.hp}%</div>
        </Card>
      ))}
    </div>
  );
}

// 3. DialogDisplay
export function DialogDisplay({ dialogs }: { dialogs: dialogMessage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (dialogs.length === 0) return;
    const timer = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1 < dialogs.length ? i + 1 : i));
        setShow(true);
      }, 500);
    }, 4000);

    return () => clearInterval(timer);
  }, [dialogs]);

  return (
    <div>
      {show && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white shadow-xl px-4 py-2 rounded-xl border w-fit">
          {dialogs[currentIndex]?.text}
        </div>
      )}
    </div>
  );
}

// 4. BattleResult
export function BattleResult({ result, onClear }: { result: string; onClear: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onClear(), 2000);
    return () => clearTimeout(timer);
  }, [result]);

  return result ? (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold bg-white p-6 rounded-xl shadow-xl">
      {result === 'win' ? 'You Win!' : 'You Lose!'}
    </div>
  ) : null;
}

// 5. EndBattleScreen
export function EndBattleScreen({
  winner,
  loser,
  onNewMatch,
  onHome,
}: {
  winner: string;
  loser: string;
  onNewMatch: () => void;
  onHome: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center space-y-4">
      <div className="text-3xl font-bold">Battle Over</div>
      <div className="text-xl">Winner: {winner}</div>
      <div className="text-xl">Loser: {loser}</div>
      <div className="flex space-x-4 mt-4">
        <Button onClick={onNewMatch}>New Match</Button>
        <Button variant="outline" onClick={onHome}>
          Home
        </Button>
      </div>
    </div>
  );
}
