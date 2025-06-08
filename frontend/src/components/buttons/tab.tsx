import { FC } from 'react';
import { Button } from '../ui/button';

interface TabButtonProps {
  text: string;
  route?: string;
  active: boolean;
}

const TabButton: FC<TabButtonProps> = ({ text, route, active }) => {
  console.log(text, route, active);
  return (
    <Button
      className={`rounded-lg w-full px-5 py-2 text-sm font-semibold transition-colors duration-300
          ${
            active
              ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg hover:shadow-xl'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }
        `}
    >
      {text}
    </Button>
  );
};

export default TabButton;
