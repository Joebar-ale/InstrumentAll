import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkvStorage';
import { STORAGE_KEYS, MAX_OFFLINE_QUERIES } from '../constants/config';

// ============================================
// Interfaz del store de energía offline
// ============================================
interface EnergyState {
  remainingQueries: number;
  isBlocked: boolean;
}

interface EnergyActions {
  /** Consume 1 consulta offline (solo si free + offline) */
  consumeQuery: () => void;
  /** Resetea energía a 15 (al reconectar internet) */
  resetEnergy: () => void;
  /** Verifica si aún tiene consultas disponibles */
  hasEnergy: () => boolean;
}

// ============================================
// Store de energía (persistido con MMKV)
// Sobrevive cierre de app para evitar exploit
// ============================================
export const useEnergyStore = create<EnergyState & EnergyActions>()(
  persist(
    (set, get) => ({
      // Estado inicial: máximo de consultas
      remainingQueries: MAX_OFFLINE_QUERIES,
      isBlocked: false,

      // Decrementar consultas disponibles
      consumeQuery: () => {
        const { remainingQueries } = get();

        // Protección: no decrementar si ya está en 0
        if (remainingQueries <= 0) {
          set({ isBlocked: true });
          return;
        }

        const newRemaining = remainingQueries - 1;
        set({
          remainingQueries: newRemaining,
          isBlocked: newRemaining <= 0,
        });
      },

      // Restaurar energía al máximo
      resetEnergy: () =>
        set({
          remainingQueries: MAX_OFFLINE_QUERIES,
          isBlocked: false,
        }),

      // Consultar si tiene energía restante
      hasEnergy: () => get().remainingQueries > 0,
    }),
    {
      name: STORAGE_KEYS.ENERGY,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
