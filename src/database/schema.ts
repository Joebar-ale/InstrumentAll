// ============================================
// SQL: Esquema de la base de datos InstrumentAll
// ============================================

/**
 * DDL completo del esquema.
 * Usa Tiempos Quirúrgicos en lugar de categorías genéricas
 * para agrupar instrumentos por fase de la cirugía.
 */

// Tabla: Tiempos Quirúrgicos
export const CREATE_TIEMPOS_QUIRURGICOS = `
  CREATE TABLE IF NOT EXISTS tiempos_quirurgicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    orden_sugerido_mesa INTEGER NOT NULL DEFAULT 0
  );
`;

// Tabla: Instrumentos
export const CREATE_INSTRUMENTOS = `
  CREATE TABLE IF NOT EXISTS instrumentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    tiempo_quirurgico_id INTEGER NOT NULL,
    FOREIGN KEY (tiempo_quirurgico_id)
      REFERENCES tiempos_quirurgicos(id)
      ON DELETE CASCADE
  );
`;

// Índice para búsquedas por tiempo quirúrgico
export const INDEX_INSTRUMENTOS_TIEMPO = `
  CREATE INDEX IF NOT EXISTS idx_instrumentos_tiempo
  ON instrumentos(tiempo_quirurgico_id);
`;

// Tabla: Procedimientos
export const CREATE_PROCEDIMIENTOS = `
  CREATE TABLE IF NOT EXISTS procedimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT
  );
`;

// Tabla intermedia: Relación N:M con cantidad sugerida
export const CREATE_RELACION = `
  CREATE TABLE IF NOT EXISTS relacion_procedimiento_instrumento (
    procedimiento_id INTEGER NOT NULL,
    instrumento_id INTEGER NOT NULL,
    cantidad_sugerida INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (procedimiento_id, instrumento_id),
    FOREIGN KEY (procedimiento_id)
      REFERENCES procedimientos(id)
      ON DELETE CASCADE,
    FOREIGN KEY (instrumento_id)
      REFERENCES instrumentos(id)
      ON DELETE CASCADE
  );
`;

// ============================================
// Datos semilla: Tiempos Quirúrgicos por defecto
// ============================================
export const SEED_TIEMPOS_QUIRURGICOS = `
  INSERT OR IGNORE INTO tiempos_quirurgicos (id, nombre, orden_sugerido_mesa) VALUES
    (1, 'Diéresis',          1),
    (2, 'Hemostasia',        2),
    (3, 'Prensión/Tracción', 3),
    (4, 'Separación',        4),
    (5, 'Síntesis',          5);
`;

// ============================================
// Consulta: Instrumentos agrupados por Tiempo Quirúrgico
// Ordenados por orden_sugerido_mesa (NO alfabético)
// ============================================
export const QUERY_INSTRUMENTOS_AGRUPADOS = `
  SELECT
    i.id,
    i.nombre,
    i.descripcion,
    i.imagen_url,
    i.tiempo_quirurgico_id,
    tq.nombre AS tiempo_nombre,
    tq.orden_sugerido_mesa
  FROM instrumentos i
  INNER JOIN tiempos_quirurgicos tq
    ON i.tiempo_quirurgico_id = tq.id
  ORDER BY tq.orden_sugerido_mesa ASC, i.nombre ASC;
`;

// Consulta: Instrumentos de un procedimiento específico
export const QUERY_INSTRUMENTOS_POR_PROCEDIMIENTO = `
  SELECT
    i.id,
    i.nombre,
    i.descripcion,
    i.imagen_url,
    i.tiempo_quirurgico_id,
    tq.nombre AS tiempo_nombre,
    rpi.cantidad_sugerida
  FROM relacion_procedimiento_instrumento rpi
  INNER JOIN instrumentos i
    ON rpi.instrumento_id = i.id
  INNER JOIN tiempos_quirurgicos tq
    ON i.tiempo_quirurgico_id = tq.id
  WHERE rpi.procedimiento_id = ?
  ORDER BY tq.orden_sugerido_mesa ASC, i.nombre ASC;
`;

// Consulta: Procedimientos de un instrumento específico
export const QUERY_PROCEDIMIENTOS_POR_INSTRUMENTO = `
  SELECT
    p.id,
    p.nombre,
    p.descripcion,
    rpi.cantidad_sugerida
  FROM relacion_procedimiento_instrumento rpi
  INNER JOIN procedimientos p
    ON rpi.procedimiento_id = p.id
  WHERE rpi.instrumento_id = ?
  ORDER BY p.nombre ASC;
`;

// Consulta: Flashcards Aleatorias (10 registros)
export const QUERY_FLASHCARDS_ALEATORIAS = `
  SELECT 
    id, 
    nombre, 
    imagen_url
  FROM instrumentos
  ORDER BY RANDOM()
  LIMIT 10;
`;

// Consulta: 4 Instrumentos para Simulador (1 de cada categoría requerida)
export const QUERY_SIMULADOR_MESA = `
  SELECT * FROM (SELECT id, nombre, imagen_url, tiempo_quirurgico_id FROM instrumentos WHERE tiempo_quirurgico_id = 1 ORDER BY RANDOM() LIMIT 1)
  UNION ALL
  SELECT * FROM (SELECT id, nombre, imagen_url, tiempo_quirurgico_id FROM instrumentos WHERE tiempo_quirurgico_id = 2 ORDER BY RANDOM() LIMIT 1)
  UNION ALL
  SELECT * FROM (SELECT id, nombre, imagen_url, tiempo_quirurgico_id FROM instrumentos WHERE tiempo_quirurgico_id = 3 ORDER BY RANDOM() LIMIT 1)
  UNION ALL
  SELECT * FROM (SELECT id, nombre, imagen_url, tiempo_quirurgico_id FROM instrumentos WHERE tiempo_quirurgico_id = 5 ORDER BY RANDOM() LIMIT 1);
`;

// ============================================
// Consultas para Quiz
// ============================================

export const QUERY_QUIZ_PREGUNTAS = `
  SELECT id, nombre, imagen_url 
  FROM instrumentos 
  ORDER BY RANDOM() 
  LIMIT 10;
`;

export const QUERY_QUIZ_DISTRACTORES = `
  SELECT nombre 
  FROM instrumentos 
  WHERE id != ? 
  ORDER BY RANDOM() 
  LIMIT 3;
`;
