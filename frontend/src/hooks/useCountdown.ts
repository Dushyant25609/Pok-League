// hooks/useCountdown.ts
'use client';
import { useEffect, useState } from 'react';

export function useCountdown(deadline: string | null) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const end = new Date(deadline).getTime();
      const now = Date.now();
      const remaining = Math.floor((end - now) / 1000);

      if (remaining <= 0) {
        setCountdown(0);
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return countdown;
}
