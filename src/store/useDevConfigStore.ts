import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkvStorage';


interface DevTheme {
  primaryColor: string;
  backgroundColor: string;
  fontScale: number;
}

interface DevTimers {
  quizTransitionMs: number;
  tableSimulatorMaxTime: number;
}

interface DevContent {
  allowDummyDataInjection: boolean;
}

export interface DevConfigState {
  theme: DevTheme;
  timers: DevTimers;
  content: DevContent;
  isPreviewMode: boolean;
  
  setTheme: (theme: Partial<DevTheme>) => void;
  setTimers: (timers: Partial<DevTimers>) => void;
  setContent: (content: Partial<DevContent>) => void;
  setPreviewMode: (val: boolean) => void;
}

// Singleton. Inicialización perezosa real en componentes via __DEV__ checks.
export const useDevConfigStore = create<DevConfigState>()(
  persist(
    (set) => ({
      theme: { primaryColor: '#2563EB', backgroundColor: '#F9FAFB', fontScale: 1 },
      timers: { quizTransitionMs: 1500, tableSimulatorMaxTime: 60 },
      content: { allowDummyDataInjection: true },
      isPreviewMode: false,
      
      setTheme: (t) => set((s) => ({ theme: { ...s.theme, ...t } })),
      setTimers: (t) => set((s) => ({ timers: { ...s.timers, ...t } })),
      setContent: (c) => set((s) => ({ content: { ...s.content, ...c } })),
      setPreviewMode: (val) => set({ isPreviewMode: val }),
    }),
    {
      name: 'instrumentall-dev-config',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
