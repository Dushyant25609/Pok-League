import DataBoxWrapper from '@/components/box/dataWrapper';
import MainTitle from '@/components/title/main';
import TagTitle from '@/components/title/tag';
import { Features } from '@/constants/highlights';
import ShinyButton from '@/components/buttons/ShinyButton';
import HomeButtons from '@/components/buttons/home';
import AnimatedText from '@/components/animation/AnimatedText';

export default function Home() {
  return (
    <div className="self-center flex flex-col justify-center items-center gap-3 md:gap-6 p-4 2xl:w-9/12 mx-auto">
      <MainTitle />
      <TagTitle text="BATTLE ARENA" />
      <AnimatedText delay={1} className="md:w-2/3 xl:w-2/5 text-center text-gray-300">
        <p>
          Step into the ultimate Pokémon battle experience! Whether you're a seasoned trainer or
          just starting your journey, PokéLeague Battle Arena gives you the edge to dominate every
          match.
        </p>
      </AnimatedText>

      <DataBoxWrapper
        className={'grid grid-cols-1 md:grid-cols-2 md:w-1/2 gap-4'}
        features={Features}
      />
      <ShinyButton roundness="lg" className="w-full md:w-1/2 mx-auto font-bold">
        <div className="flex gap-12 items-center h-full">
          <h2>Ready to Battle</h2>
        </div>
      </ShinyButton>
      <HomeButtons />
    </div>
  );
}
