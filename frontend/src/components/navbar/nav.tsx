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
    <AnimatedBox
      animation={dropAnimation}
      className="transform  z-50 bg-white/10 shadow-lg rounded-full px-4 py-2 flex gap-4 backdrop-blur-md"
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
  );
};

export default FloatingNavbar;
