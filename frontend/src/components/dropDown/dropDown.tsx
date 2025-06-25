'use client';
import { FC } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Gen } from '@/constants/generation';

interface DropDownProps {
  limit: number;
  gen: number;
}

const DropDown: FC<DropDownProps> = ({ limit, gen }) => {
  return (
    <Select
      onValueChange={(value) => {
        window.location.href = `/pokedex?limit=${limit}&page=1&gen=${value}`;
      }}
      defaultValue={gen.toString()}
    >
      <SelectTrigger className="w-[250px] border-black bg-white text-black dark:bg-zinc-900 dark:text-white">
        <SelectValue placeholder="Select Generation" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-zinc-900 text-black dark:text-white">
        <SelectItem value="0">All Generations</SelectItem>
        {Gen.map((gen) => (
          <SelectItem key={gen} value={gen.toString()}>
            Generation {gen}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DropDown;
