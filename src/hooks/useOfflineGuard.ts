import { useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useConnectivityStore } from '../store/useConnectivityStore';
import { useEnergyStore } from '../store/useEnergyStore';

// ============================================
// Interfaz del resultado del guardia offline
// ============================================
interface OfflineGuardResult {
  /** Si el usuario puede navegar el catálogo */
  canBrowse: boolean;
  /** Si el usuario puede acceder al modo estudio */
  canStudy: boolean;
  /** Si el usuario es premium */
  isPremium: boolean;
  /** Si tiene conexión a internet */
  isOnline: boolean;
  /** Consultas offline restantes */
  remainingQueries: number;
  /** Si está bloqueado por falta de energía */
  isBlocked: boolean;
  /** Consume 1 consulta si aplica (free + offline) */
  consumeIfNeeded: () => void;
}

// ============================================
// Hook: Guardia de acceso offline
// ============================================

/**
 * Centraliza las reglas de negocio Freemium:
 *
 * PREMIUM → Acceso total, sin restricciones.
 * FREE + ONLINE → Catálogo con banner, Estudio con interstitial.
 * FREE + OFFLINE + ENERGÍA → Catálogo (consume 1 consulta), Estudio bloqueado.
 * FREE + OFFLINE + SIN ENERGÍA → Todo bloqueado, mostrar modal.
 */
export function useOfflineGuard(): OfflineGuardResult {
  const isPremium = useAuthStore((s) => s.isPremium);
  const isOnline = useConnectivityStore((s) => s.isOnline);
  const remainingQueries = useEnergyStore((s) => s.remainingQueries);
  const isBlocked = useEnergyStore((s) => s.isBlocked);
  const consumeQuery = useEnergyStore((s) => s.consumeQuery);

  // Determinar permisos de navegación
  const canBrowse = isPremium || isOnline || (!isOnline && !isBlocked);

  // Estudio: solo con internet o premium
  const canStudy = isPremium || isOnline;

  // Consumir consulta SOLO si: free + offline
  const consumeIfNeeded = useCallback(() => {
    if (!isPremium && !isOnline) {
      consumeQuery();
    }
  }, [isPremium, isOnline, consumeQuery]);

  return {
    canBrowse,
    canStudy,
    isPremium,
    isOnline,
    remainingQueries,
    isBlocked,
    consumeIfNeeded,
  };
}
