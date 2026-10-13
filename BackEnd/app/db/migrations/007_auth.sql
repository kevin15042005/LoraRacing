-- Usuario administrador (contraseña guardada cifrada)
CREATE TABLE usuarios (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario    TEXT NOT NULL UNIQUE,
  nombre     TEXT NOT NULL,
  hash       TEXT NOT NULL,
  sal        TEXT NOT NULL,
  creado_en  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- Sesiones iniciadas (una por dispositivo)
CREATE TABLE sesiones (
  token       TEXT PRIMARY KEY,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  creada_en   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  expira_en   TEXT NOT NULL
);
