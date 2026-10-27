import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

// ============================================
// Instancia única de MMKV para toda la app
// ============================================
export const mmkvInstance = createMMKV({
  id: 'instrumentall-global',
});

// ============================================
// Adaptador MMKV → Zustand persist middleware
// ============================================
export const mmkvStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    mmkvInstance.set(name, value);
  },
  getItem: (name: string) => {
    return mmkvInstance.getString(name) ?? null;
  },
  removeItem: (name: string) => {
    mmkvInstance.remove(name);
  },
};
