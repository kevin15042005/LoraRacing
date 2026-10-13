-- Catálogo de mano de obra con precio estándar
CREATE TABLE mano_obra (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       TEXT NOT NULL UNIQUE,
  descripcion  TEXT,
  precio       INTEGER NOT NULL DEFAULT 0,
  activo       INTEGER NOT NULL DEFAULT 1,
  creado_en    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
