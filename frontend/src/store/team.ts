import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoomState {
  username: string;
  team: number[];
  setTeam: (team: number[]) => void;
  setUsername: (username: string) => void;
}

const useTeamStore = create<RoomState>()(
  persist(
    (set) => ({
      username: '',
      team: [],
      setTeam: (team) => set({ team }),
      setUsername: (username) => set({ username }),
    }),
    {
      name: 'team-storage', // this is the key used in localStorage
      // everything is stored in localStorage by default
      partialize: (state) => ({
        username: state.username,
        team: state.team,
      }),
    }
  )
);

export default useTeamStore;
