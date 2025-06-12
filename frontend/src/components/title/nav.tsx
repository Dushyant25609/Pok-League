import { FC } from 'react';

interface NavTitleProps {
  title: string;
}

const NavTitle: FC<NavTitleProps> = ({ title }) => {
  return (
    <div className="w-full bg-gradient-to-b from-red-800 from-48% flex justify-center py-4 via-black to-52% to-gray-300 text-center font-long text-4xl md:text-5xl lg:text-6xl font-black text-white text-stroke-1 border-3 animate-pokeball border-black">
      <h1 className="bg-white w-fit px-4 rounded-full py-2 border-4 border-black">{title}</h1>
    </div>
  );
};

export default NavTitle;
