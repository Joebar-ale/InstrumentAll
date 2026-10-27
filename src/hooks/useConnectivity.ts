import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useConnectivityStore } from '../store/useConnectivityStore';
import { useEnergyStore } from '../store/useEnergyStore';
import { useAuthStore } from '../store/useAuthStore';

// ============================================
// Hook: Sincroniza NetInfo → Stores de Zustand
// ============================================

/**
 * Debe montarse UNA VEZ en el componente raíz (App.tsx).
 * - Escucha cambios de red en tiempo real.
 * - Actualiza el store de conectividad.
 * - Resetea la energía automáticamente al reconectar (solo free).
 */
export function useConnectivity(): void {
  const setOnline = useConnectivityStore((s) => s.setOnline);
  const resetEnergy = useEnergyStore((s) => s.resetEnergy);
  const isPremium = useAuthStore((s) => s.isPremium);

  useEffect(() => {
    // Suscripción al listener de conectividad
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = !!(state.isConnected && state.isInternetReachable);

      // Actualizar estado de red global
      setOnline(isConnected);

      // Si reconecta y es usuario free → restaurar energía
      if (isConnected && !isPremium) {
        resetEnergy();
      }
    });

    // Limpieza al desmontar
    return () => unsubscribe();
  }, [setOnline, resetEnergy, isPremium]);
}
