-- Historial de todo lo que entra y sale del inventario
CREATE TABLE movimientos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  repuesto_id     INTEGER NOT NULL REFERENCES repuestos(id),
  tipo            TEXT NOT NULL CHECK (tipo IN ('entrada','salida','ajuste','devolucion')),
  cantidad        REAL NOT NULL,                     -- positiva entra, negativa sale
  costo_unitario  INTEGER,
  orden_id        INTEGER,                           -- si viene de una orden
  nota            TEXT,
  fecha           TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX idx_movimientos_repuesto ON movimientos(repuesto_id);
