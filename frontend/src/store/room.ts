import { create } from 'zustand';

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
}

const useRoomStore = create<RoomState>((set) => ({
  username: '',
  roomCode: '',
  status: '',
  error: null,
  setUsername: (username) => set({ username }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export default useRoomStore;
