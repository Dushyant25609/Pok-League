// hooks/useSocket.ts
'use client';

import { useEffect, useRef } from 'react';

export default function useSocket({ route }: { route: string }) {
  const baseURL = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:8080/api/ws';
  const SOCKET_URL = `${baseURL}${route}`;

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket(SOCKET_URL);

    socketRef.current.onopen = () => {
      console.log('✅ Connected to:', SOCKET_URL);
    };

    socketRef.current.onclose = () => {
      console.log('❌ Disconnected from:', SOCKET_URL);
    };
  }, [SOCKET_URL]);

  return socketRef;
}
