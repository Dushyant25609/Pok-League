import { FC } from 'react';
import { capitalize } from '@/lib/tools';
import PokemonImage from '@/components/image/pokemon';
import AnimatedBox from '../animation/box';
import { liftAnimation } from '@/motion/axis';

interface PokedexBoxProps {
  index: number;
  name: string;
  id: number;
  type: string[];
}

const PokedexBox: FC<PokedexBoxProps> = ({ index, name, id, type }) => {
  return (
    <AnimatedBox
      animation={{
        ...liftAnimation,
        initial: {
          y: 200,
          opacity: 0,
        },
        transition: { ...liftAnimation.transition, delay: 0.1 * index, duration: 0.1 }, // Change only duration
      }}
      className="relative  flex justify-center items-center aspect-square overflow-hidden group rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-rose-400/50 bg-white dark:bg-zinc-900"
    >
      {/* Pokémon Image */}
      <PokemonImage
        id={id}
        alt={name}
        className="w-3/4 max-w-[160px] object-contain transition-transform duration-300 group-hover:scale-105"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-3">
        <h3 className="text-lg font-bold tracking-wide">{capitalize(name)}</h3>
        <div className="mt-2 flex gap-2 flex-wrap justify-center">
          {type.map((t, i) => (
            <span
              key={i}
              className="bg-white/20 backdrop-blur px-2 py-1 rounded-full text-xs font-semibold uppercase border border-white/30 shadow-sm"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </AnimatedBox>
  );
};

export default PokedexBox;
