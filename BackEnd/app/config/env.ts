import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Carpeta raíz del BackEnd (desde app/config subimos dos niveles)
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

export const config = {
  // ?? Si lo de la izquierda no existe, usa lo de la derecha
  puerto: Number(process.env.PUERTO ?? 3000),
  zonaHoraria: 'America/Bogota',

  carpetaDatos: path.join(RAIZ, 'datos'),
  carpetaFirmas: path.join(RAIZ, 'datos', 'firmas'),
  carpetaRespaldos: path.join(RAIZ, 'backup'),
  archivoBaseDatos: path.join(RAIZ, 'datos', 'taller.db'),
  carpetaMigraciones: path.join(RAIZ, 'app', 'db', 'migrations'),

  // App web compilada del FrontEnd (si existe, el servidor la muestra)
  carpetaFrontEnd: path.join(RAIZ, '..', 'FrontEnd', 'dist'),

  // Cuántos días dura una sesión iniciada
  diasSesion: 30,

  // Cuántos respaldos automáticos se guardan antes de borrar los más viejos
  maxRespaldos: 30,
}