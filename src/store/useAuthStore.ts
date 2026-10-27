import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserTier } from '../types';
import { mmkvStorage } from './mmkvStorage';
import { STORAGE_KEYS } from '../constants/config';

// ============================================
// Interfaz del store de autenticación
// ============================================
interface AuthState {
  userTier: UserTier;
  isPremium: boolean;
}

interface AuthActions {
  upgradeToPremium: () => void;
  downgradeToFree: () => void;
}

// ============================================
// Store de autenticación (persistido con MMKV)
// ============================================
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // Estado inicial
      userTier: 'free',
      isPremium: false,

      // Acciones: actualizar a premium
      upgradeToPremium: () =>
        set({ userTier: 'premium', isPremium: true }),

      // Acciones: revertir a free
      downgradeToFree: () =>
        set({ userTier: 'free', isPremium: false }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
