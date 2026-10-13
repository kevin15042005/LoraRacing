CREATE TABLE clientes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL,
  documento  TEXT UNIQUE,
  telefono   TEXT,
  email      TEXT,
  direccion  TEXT,
  notas      TEXT,
  activo     INTEGER NOT NULL DEFAULT 1,
  creado_en  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE motos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id  INTEGER NOT NULL REFERENCES clientes(id),
  placa       TEXT NOT NULL UNIQUE,
  marca       TEXT,
  modelo      TEXT,
  anio        INTEGER,
  cilindraje  INTEGER,
  color       TEXT,
  km_actual   INTEGER,
  notas       TEXT,
  activo      INTEGER NOT NULL DEFAULT 1,
  creado_en   TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX idx_motos_cliente ON motos(cliente_id);
