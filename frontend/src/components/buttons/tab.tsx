'use client';

import { FC, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { redirect, useRouter, useSearchParams } from 'next/navigation';

interface TabButtonProps {
  text: string;
  gen?: number;
}

const TabButton: FC<TabButtonProps> = ({ text, gen }) => {
  const [active, setActive] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentGen = searchParams.get('gen');
    setActive(currentGen === gen?.toString());
  }, [searchParams, gen]);

  const handleClick = () => {
    if (gen === 0) {
      redirect('/pokedex/');
    }
    const newParams = new URLSearchParams(searchParams.toString());
    if (gen) {
      newParams.set('gen', gen.toString());
      newParams.set('page', '1');
    } else {
      newParams.delete('gen');
      newParams.delete('page');
    }
    router.push(`/pokedex?${newParams.toString()}`);
  };

  return (
    <Button
      onClick={handleClick}
      className={`rounded-lg px-5 py-2 border-0 text-sm font-semibold transition-colors duration-300
        ${
          active
            ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-md'
            : 'bg-white text-gray-800 hover:bg-gradient-to-r from-yellow-200 to-red-300 border border-gray-300'
        }
      `}
    >
      {text}
    </Button>
  );
};

export default TabButton;
