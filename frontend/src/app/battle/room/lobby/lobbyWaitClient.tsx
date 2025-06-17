'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useRoomStore from '@/store/room';
import useSocket from '@/hooks/useSocket';
import { Routes, SocketEvents } from '@/lib/routes';

const LobbyWait = () => {
  const roomId = useRoomStore((state) => state.roomCode);
  if (!roomId) {
    toast.error('Room not found');
    return <>Page not found</>;
  }
  const username = useRoomStore((state) => state.username);
  const roomSocket = useSocket({ route: SocketEvents.Lobby.replace(':roomId', roomId) });
  const router = useRouter();
  useEffect(() => {
    const ws = roomSocket.current;
    if (!ws) return;

    ws.onopen = () => {
      ws.send(JSON.stringify({ username }));
    };

    ws.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        console.log(data);
        if (data.type === 'room_ready') {
          toast.success('Both users connected! Starting the game...');
          router.push(Routes.SelectionRoom.replace(':roomId', roomId));
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };
  }, [100]);

  return (
    <div className=" flex flex-col items-center justify-center text-white px-4">
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-red-600 border-opacity-75 mb-6" />
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
        Waiting for opponent...
      </h2>
      <p className="text-sm text-gray-400">
        Room Code: <span className="text-white font-xl font-mono">{roomId}</span>
      </p>
      <p className="text-sm text-gray-400">Please wait for the other player to join.</p>
    </div>
  );
};

export default LobbyWait;
