import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { mmkvInstance } from './mmkvStorage';
import seedData from '../data/seed.json';

export function useDatabaseInit() {
  const db = useSQLiteContext();
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initDb() {
      try {
        const isSeeded = mmkvInstance.getBoolean('isDatabaseSeeded');
        
        if (isSeeded) {
          setIsInitializing(false);
          return;
        }

        // Ejecución Transaccional (Bulk Insert)
        await db.withTransactionAsync(async () => {
          
          // 1. Tiempos Quirúrgicos
          for (const tq of seedData.tiempos_quirurgicos) {
            await db.runAsync(
              'INSERT OR IGNORE INTO tiempos_quirurgicos (id, nombre, orden_sugerido_mesa) VALUES (?, ?, ?)',
              [tq.id, tq.nombre, tq.orden_sugerido_mesa]
            );
          }

          // 2. Procedimientos
          for (const p of seedData.procedimientos) {
            await db.runAsync(
              'INSERT OR IGNORE INTO procedimientos (id, nombre, descripcion) VALUES (?, ?, ?)',
              [p.id, p.nombre, p.descripcion]
            );
          }

          // 3. Instrumentos
          for (const i of seedData.instrumentos) {
            await db.runAsync(
              'INSERT OR IGNORE INTO instrumentos (id, nombre, descripcion, imagen_url, tiempo_quirurgico_id) VALUES (?, ?, ?, ?, ?)',
              [i.id, i.nombre, i.descripcion, i.imagen_url, i.tiempo_quirurgico_id]
            );
          }

          // 4. Relación Procedimiento-Instrumento
          for (const r of seedData.relacion_procedimiento_instrumento) {
            await db.runAsync(
              'INSERT OR IGNORE INTO relacion_procedimiento_instrumento (procedimiento_id, instrumento_id, cantidad_sugerida) VALUES (?, ?, ?)',
              [r.procedimiento_id, r.instrumento_id, r.cantidad_sugerida]
            );
          }
        });

        // Setear flag en MMKV tras el commit exitoso
        mmkvInstance.set('isDatabaseSeeded', true);
        
      } catch (e: any) {
        console.error('Error poblando la BD:', e);
        setError(e);
      } finally {
        setIsInitializing(false);
      }
    }

    initDb();
  }, [db]);

  return { isInitializing, error };
}
