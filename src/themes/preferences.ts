import { create } from 'zustand';
type Mode = 'light' | 'dark';
function initialMode(): Mode {
  try { return localStorage.getItem('logistics-theme') === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}
export const usePreferences = create<{ mode: Mode; toggleTheme: () => void }>((set) => ({
  mode: initialMode(),
  toggleTheme: () => set(state => {
    const mode = state.mode === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('logistics-theme', mode); } catch { /* Keep the session preference. */ }
    return { mode };
  }),
}));
