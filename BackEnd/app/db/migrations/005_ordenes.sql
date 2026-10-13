-- Una orden es una venta de mostrador o un mantenimiento
-- Estados: abierta -> cerrada (cobrada, stock descontado) -> entregada (firmada)
--          cualquiera menos entregada puede pasar a anulada
CREATE TABLE ordenes (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo              TEXT NOT NULL CHECK (tipo IN ('venta','mantenimiento')),
  cliente_id        INTEGER REFERENCES clientes(id),
  moto_id           INTEGER REFERENCES motos(id),
  km                INTEGER,
  diagnostico       TEXT,
  notas             TEXT,
  estado            TEXT NOT NULL DEFAULT 'abierta'
                    CHECK (estado IN ('abierta','cerrada','entregada','anulada')),
  fecha             TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  cerrada_en        TEXT,
  anulada_en        TEXT,
  motivo_anulacion  TEXT
);

-- Cada línea de la orden
CREATE TABLE orden_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  orden_id         INTEGER NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  tipo             TEXT NOT NULL CHECK (tipo IN ('repuesto','mano_obra','otro')),
  repuesto_id      INTEGER REFERENCES repuestos(id),
  mano_obra_id     INTEGER REFERENCES mano_obra(id),
  descripcion      TEXT NOT NULL,
  cantidad         REAL NOT NULL DEFAULT 1,
  precio_estandar  INTEGER NOT NULL DEFAULT 0,   -- precio del catálogo (referencia)
  precio_unitario  INTEGER NOT NULL DEFAULT 0,   -- lo que realmente se cobra (editable)
  descuento        INTEGER NOT NULL DEFAULT 0,   -- descuento en pesos para la línea
  cobrar           INTEGER NOT NULL DEFAULT 1,   -- 0 = no se cobra (cortesía)
  costo_unitario   INTEGER NOT NULL DEFAULT 0,   -- costo del repuesto al cerrar la orden
  total            INTEGER GENERATED ALWAYS AS (
                     CASE WHEN cobrar = 1
                          THEN MAX(CAST(ROUND(cantidad * precio_unitario) AS INTEGER) - descuento, 0)
                          ELSE 0 END
                   ) VIRTUAL
);

CREATE INDEX idx_items_orden ON orden_items(orden_id);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_ordenes_cerrada ON ordenes(cerrada_en);
