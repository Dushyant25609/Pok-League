import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoomState {
  username: string;
  roomCode: string;
  status: string;
  error: string | null;
  setUsername: (username: string) => void;
  setRoomCode: (roomCode: string) => void;
  setStatus: (status: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetRoom: () => void;
}

const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      username: '',
      roomCode: '',
      status: '',
      error: null,
      setUsername: (username) => set({ username }),
      setRoomCode: (roomCode) => set({ roomCode }),
      setStatus: (status) => set({ status }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      resetRoom: () =>
        set({
          username: '',
          roomCode: '',
          status: '',
          error: null,
        }),
    }),
    {
      name: 'room-storage', // this is the key used in localStorage
      // everything is stored in localStorage by default
      partialize: (state) => ({
        username: state.username,
        roomCode: state.roomCode,
        status: state.status,
      }),
    }
  )
);

export default useRoomStore;
