'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as 'light' | 'dark'}
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',

          // Backgrounds + text colors for each type
          success: 'group-[.toast]:bg-green-500 group-[.toast]:text-white',
          error: 'group-[.toast]:bg-red-500 group-[.toast]:text-white',
          info: 'group-[.toast]:bg-blue-500 group-[.toast]:text-white',
          warning: 'group-[.toast]:bg-yellow-400 group-[.toast]:text-black',
          loading: 'group-[.toast]:bg-gray-500 group-[.toast]:text-white',
          default:
            'group-[.toast]:bg-white group-[.toast]:text-black dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-white',
        },
      }}
      icons={{
        success: '✅',
        error: '💀',
        info: 'ℹ️',
        warning: '⚠️',
        loading: '⏳',
        close: '❌',
      }}
      {...props}
    />
  );
};

export { Toaster };
