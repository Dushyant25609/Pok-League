import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';

interface NavItemProps {
  name: string;
  onClick: () => void;
  isActive: boolean;
}

const NavItems: FC<NavItemProps> = ({ name, onClick, isActive }) => {
  return (
    <div
      key={name}
      onClick={onClick}
      className="relative cursor-pointer px-4 py-1 font-bold text-white flex justify-center items-center text-xs md:text-base"
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-full bg-red-500 z-[-1]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
      {name}
    </div>
  );
};

export default NavItems;
