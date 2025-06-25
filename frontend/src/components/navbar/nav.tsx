'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavItems from './navItem';
import { Routes } from '@/lib/routes';
import AnimatedBox from '../animation/box';
import { dropAnimation } from '@/motion/axis';

const navItems = [
  { name: 'Home', href: Routes.Home },
  { name: 'Pokedex', href: Routes.Pokedex },
  { name: 'Performance', href: Routes.Performance },
  { name: 'Battle', href: Routes.Battle },
];

const FloatingNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/');

  useEffect(() => {
    const basePath = pathname.split('?')[0];
    setActiveTab(basePath);
  }, [pathname]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md md:static md:translate-x-0 md:w-auto md:mt-4">
      <AnimatedBox
        animation={dropAnimation}
        className="flex flex-col md:flex-row items-center justify-around gap-2 md:gap-4 px-4 py-2 bg-white/10 backdrop-blur-md shadow-lg rounded-2xl"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.href.split('?')[0];
          return (
            <NavItems
              key={item.name}
              name={item.name}
              isActive={isActive}
              onClick={() => handleNavigation(item.href)}
            />
          );
        })}
      </AnimatedBox>
    </div>
  );
};

export default FloatingNavbar;
