-- Catálogo de repuestos (inventario)
CREATE TABLE repuestos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo        TEXT UNIQUE,
  nombre        TEXT NOT NULL,
  categoria     TEXT,
  marca         TEXT,
  unidad        TEXT NOT NULL DEFAULT 'unidad',      -- unidad, litro, juego...
  costo         INTEGER NOT NULL DEFAULT 0,          -- lo que le cuesta al taller (pesos)
  precio_venta  INTEGER NOT NULL DEFAULT 0,          -- precio estándar al cliente (pesos)
  stock         REAL NOT NULL DEFAULT 0,
  stock_minimo  REAL NOT NULL DEFAULT 1,
  activo        INTEGER NOT NULL DEFAULT 1,
  creado_en     TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
