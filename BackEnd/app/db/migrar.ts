// fs (File System): manejo de archivos y carpetas
import fs from "node:fs";
import path from "node:path";
import { db } from "./conexion.js";
import { config } from "../config/env.js";

export function migrar() {
  // 1. Tabla para recordar qué migraciones ya se aplicaron
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migraciones (
      nombre TEXT PRIMARY KEY,
      aplicada_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `);

  // 2. Nombres de las migraciones ya aplicadas
  const filas = db.prepare("SELECT nombre FROM _migraciones").all() as {
    nombre: string;
  }[];
  const aplicadas = new Set(filas.map((fila) => fila.nombre));

  // 3. Archivos .sql de la carpeta, en orden
  const archivos = fs
    .readdirSync(config.carpetaMigraciones)
    .filter((archivo) => archivo.endsWith(".sql"))
    .sort();

  // 4. Aplicar las que falten
  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) continue;

    // readFileSync(ruta, 'utf8') lee el contenido del archivo como texto
    const sql = fs.readFileSync(path.join(config.carpetaMigraciones, archivo), "utf8");

    // Transacción: o se aplica todo el archivo o nada
    db.transaction(() => {
      db.exec(sql); // exec: el archivo puede tener varias instrucciones
      db.prepare("INSERT INTO _migraciones (nombre) VALUES (?)").run(archivo); // ? = archivo
    })();

    console.log(`Migración aplicada: ${archivo}`);
  }
} // ← la función termina aquí, al final de todo