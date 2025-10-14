import { create } from 'zustand';

interface SyncState {
  syncKey: number;
  triggerSync: () => void;
}


export const useDataSync = create<SyncState>((set) => ({
  syncKey: 0,
  triggerSync: () => set((state) => ({ syncKey: state.syncKey + 1 })),
}));