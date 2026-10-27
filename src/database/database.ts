import type { SQLiteDatabase } from 'expo-sqlite';
import {
  CREATE_TIEMPOS_QUIRURGICOS,
  CREATE_INSTRUMENTOS,
  CREATE_PROCEDIMIENTOS,
  CREATE_RELACION,
  INDEX_INSTRUMENTOS_TIEMPO,
  SEED_TIEMPOS_QUIRURGICOS,
} from './schema';

// ============================================
// Versión actual del esquema (para migraciones futuras)
// ============================================
const CURRENT_DB_VERSION = 1;

// ============================================
// Inicialización y migración de la base de datos
// ============================================

/**
 * Se ejecuta al iniciar la app via SQLiteProvider.onInit
 * Crea las tablas si no existen e inserta datos semilla.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Activar WAL para mejor rendimiento en lecturas concurrentes
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Activar foreign keys (desactivadas por defecto en SQLite)
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Obtener versión actual de la DB
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  const currentVersion = result?.user_version ?? 0;

  // Migración v0 → v1: Esquema inicial
  if (currentVersion < 1) {
    await db.execAsync(CREATE_TIEMPOS_QUIRURGICOS);
    await db.execAsync(CREATE_INSTRUMENTOS);
    await db.execAsync(INDEX_INSTRUMENTOS_TIEMPO);
    await db.execAsync(CREATE_PROCEDIMIENTOS);
    await db.execAsync(CREATE_RELACION);

    // Insertar tiempos quirúrgicos por defecto
    await db.execAsync(SEED_TIEMPOS_QUIRURGICOS);
  }

  // Futuras migraciones irían aquí:
  // if (currentVersion < 2) { ... }

  // Actualizar la versión del esquema
  await db.execAsync(`PRAGMA user_version = ${CURRENT_DB_VERSION};`);
}
