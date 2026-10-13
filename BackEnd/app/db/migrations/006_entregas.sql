-- Constancia de entrega con firma del cliente
CREATE TABLE entregas (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  orden_id          INTEGER NOT NULL UNIQUE REFERENCES ordenes(id),
  recibe_nombre     TEXT NOT NULL,
  recibe_documento  TEXT,
  km_entrega        INTEGER,
  observaciones     TEXT,
  firma_archivo     TEXT NOT NULL,               -- nombre del PNG en datos/firmas
  fecha             TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
