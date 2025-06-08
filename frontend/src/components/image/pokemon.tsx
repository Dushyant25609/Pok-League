'use client';
import Image from 'next/image';
import { useState } from 'react';

interface PokemonImageProps {
  id: number;
  alt?: string;
  className?: string;
}

const PokemonImage = ({ id, alt = 'pokemon', className = '' }: PokemonImageProps) => {
  const dreamWorldUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
  const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  const [imgSrc, setImgSrc] = useState(dreamWorldUrl);

  return (
    <Image
      priority
      src={imgSrc}
      alt={alt}
      width={100}
      height={100}
      className={className}
      onError={() => setImgSrc(fallbackUrl)}
    />
  );
};

export default PokemonImage;
