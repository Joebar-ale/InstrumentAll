// ============================================
// Tipos de Usuario y Estado de la App
// ============================================

/** Nivel de suscripción del usuario */
export type UserTier = 'free' | 'premium';

/** Estado de conectividad */
export interface ConnectivityState {
  isOnline: boolean;
}

/** Estado del sistema de energía offline */
export interface EnergyState {
  remainingQueries: number;
  isBlocked: boolean;
}

// ============================================
// Entidades de la Base de Datos
// ============================================

/** Tiempo quirúrgico (antes "categoría") */
export interface TiempoQuirurgico {
  id: number;
  nombre: string;
  orden_sugerido_mesa: number;
}

/** Instrumento quirúrgico */
export interface Instrumento {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  tiempo_quirurgico_id: number;
}

/** Instrumento con nombre del tiempo quirúrgico (JOIN) */
export interface InstrumentoConTiempo extends Instrumento {
  tiempo_nombre: string;
}

/** Procedimiento quirúrgico */
export interface Procedimiento {
  id: number;
  nombre: string;
  descripcion: string | null;
}

/** Relación N:M entre procedimiento e instrumento */
export interface RelacionProcedimientoInstrumento {
  procedimiento_id: number;
  instrumento_id: number;
  cantidad_sugerida: number;
}

// ============================================
// Tipos para la UI — SectionList agrupada
// ============================================

/** Sección para SectionList: instrumentos agrupados por tiempo quirúrgico */
export interface InstrumentoSection {
  title: string;
  ordenMesa: number;
  data: Instrumento[];
}
