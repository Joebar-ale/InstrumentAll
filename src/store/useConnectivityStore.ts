import { create } from 'zustand';

// ============================================
// Interfaz del store de conectividad
// ============================================
interface ConnectivityState {
  isOnline: boolean;
}

interface ConnectivityActions {
  setOnline: (status: boolean) => void;
}

// ============================================
// Store de conectividad (NO persistido — es transitorio)
// ============================================
export const useConnectivityStore = create<ConnectivityState & ConnectivityActions>()(
  (set) => ({
    // Estado inicial: asumimos online hasta que NetInfo confirme
    isOnline: true,

    // Acción: actualizado por el listener de NetInfo
    setOnline: (status: boolean) => set({ isOnline: status }),
  })
);
