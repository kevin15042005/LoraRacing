// Copias de seguridad de la base de datos.
// No usa repositorio porque trabaja con archivos, no con tablas.
//
// - Al encender el servidor y cada hora revisa si ya hay respaldo de hoy; si no, lo crea.
// - Guarda los últimos N automáticos (config.maxRespaldos) y borra los más viejos.
// - Los manuales nunca se borran solos.
//
// PARA RESTAURAR un respaldo: apaga el servidor, copia el archivo de la carpeta
// backup/ a datos/taller.db (reemplazándolo) y vuelve a encender.
import fs from 'node:fs'
import path from 'node:path'
import { config } from '../../config/env.js'
import { db } from '../../db/conexion.js'
import { noEncontrado, solicitudInvalida } from '../../share/errores.js'
import { ahora, hoy } from '../../share/utils/fechas.js'
import type { MotivoRespaldo, Respaldo } from './respaldos.tipos.js'

const PATRON = /^taller_(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})_(automatico|manual)\.db$/
const UNA_HORA = 60 * 60 * 1000

function leerRespaldo(archivo: string): Respaldo | null {
  const partes = PATRON.exec(archivo)
  if (!partes) return null
  const [, fecha, hh, mm, ss, motivo] = partes
  const { size } = fs.statSync(path.join(config.carpetaRespaldos, archivo))
  return {
    archivo,
    motivo: motivo as MotivoRespaldo,
    tamano_kb: Math.round(size / 1024),
    fecha: `${fecha} ${hh}:${mm}:${ss}`,
  }
}

export const respaldosServicio = {
  /** Lista los respaldos, el más reciente primero */
  listar(): Respaldo[] {
    return fs
      .readdirSync(config.carpetaRespaldos)
      .map(leerRespaldo)
      .filter((r): r is Respaldo => r !== null)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  },

  /** Crea una copia segura de la base (aunque esté en uso) */
  async crear(motivo: MotivoRespaldo = 'manual'): Promise<Respaldo> {
    const marca = ahora().replace(' ', '_').replace(/:/g, '-')
    const archivo = `taller_${marca}_${motivo}.db`
    await db.backup(path.join(config.carpetaRespaldos, archivo))
    this.limpiar()
    console.log(`Respaldo creado: ${archivo}`)
    return leerRespaldo(archivo)!
  },

  /** Borra los respaldos automáticos más viejos que superen el máximo */
  limpiar() {
    const automaticos = this.listar().filter(r => r.motivo === 'automatico')
    for (const viejo of automaticos.slice(config.maxRespaldos)) {
      fs.rmSync(path.join(config.carpetaRespaldos, viejo.archivo), { force: true })
    }
  },

  /** Ruta del archivo para descargarlo (valida el nombre para evitar accesos indebidos) */
  rutaArchivo(archivo: string): string {
    if (!PATRON.test(archivo)) throw solicitudInvalida('Nombre de respaldo no válido')
    const ruta = path.join(config.carpetaRespaldos, archivo)
    if (!fs.existsSync(ruta)) throw noEncontrado('Respaldo')
    return ruta
  },

  /** Crea el respaldo del día si todavía no existe */
  async respaldoDiario() {
    const yaHayHoy = this.listar().some(r => r.motivo === 'automatico' && r.fecha.startsWith(hoy()))
    if (!yaHayHoy) await this.crear('automatico')
  },

  /** Se llama una vez al encender el servidor */
  programarAutomatico() {
    const ejecutar = () =>
      this.respaldoDiario().catch(error => console.error('No se pudo crear el respaldo automático:', error))
    ejecutar()
    setInterval(ejecutar, UNA_HORA).unref()
  },
}
