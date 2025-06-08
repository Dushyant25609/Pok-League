import { highlight } from '@/types/highlight';
import { FaStar, FaBolt, FaSearch, FaBrain } from 'react-icons/fa';

export const Features: highlight[] = [
  {
    icon: <FaSearch className="text-yellow-400" />,
    title: 'Discover Top-Ranked Pokémon',
  },
  {
    icon: <FaBolt className="text-blue-400" />,
    title: 'Optimize Your Movesets',
  },
  {
    icon: <FaBrain className="text-pink-400" />,
    title: 'Real-Time Selection Strategy',
  },
  {
    icon: <FaStar className="text-purple-400" />,
    title: '6 vs 6 Pokémon Battles',
  },
];
