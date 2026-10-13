// =============================================================
// share/utils/fechas.ts
// Fechas siempre en hora de Colombia, guardadas como texto
// con formato "AAAA-MM-DD HH:MM:SS" (fácil de ordenar y comparar).
// =============================================================
import { config } from '../../config/env.js'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// El formato sueco (sv-SE) produce justo "2026-10-13 12:53:10"
const formato = new Intl.DateTimeFormat('sv-SE', {
  timeZone: config.zonaHoraria,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

/** Fecha y hora actual de Colombia: "2026-10-13 12:53:10" */
export function ahora(): string {
  return formato.format(new Date()).replace('T', ' ')
}

/** Fecha actual de Colombia: "2026-10-13" */
export function hoy(): string {
  return ahora().slice(0, 10)
}

/** Suma días a un texto de fecha y hora. sumarDias("2026-10-13 10:00:00", 30) */
export function sumarDias(fechaHora: string, dias: number): string {
  const d = new Date(fechaHora.replace(' ', 'T') + 'Z')
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

/** Suma minutos a un texto de fecha y hora. sumarMinutos("2026-10-13 10:00:00", 15) */
export function sumarMinutos(fechaHora: string, minutos: number): string {
  const d = new Date(fechaHora.replace(' ', 'T') + 'Z')
  d.setUTCMinutes(d.getUTCMinutes() + minutos)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

/** Último día de un mes (mes de 1 a 12) */
function ultimoDiaDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate()
}

export interface Quincena {
  inicio: string // "2026-10-01"
  fin: string // "2026-10-15"
  numero: 1 | 2
  etiqueta: string // "1ª quincena de octubre 2026"
}

/** Devuelve la quincena (1–15 o 16–fin de mes) a la que pertenece una fecha */
export function quincenaDe(fecha: string = hoy()): Quincena {
  const anio = Number(fecha.slice(0, 4))
  const mes = Number(fecha.slice(5, 7))
  const dia = Number(fecha.slice(8, 10))
  const mm = String(mes).padStart(2, '0')
  const numero = dia <= 15 ? 1 : 2

  const inicio = numero === 1 ? `${anio}-${mm}-01` : `${anio}-${mm}-16`
  const fin = numero === 1
    ? `${anio}-${mm}-15`
    : `${anio}-${mm}-${String(ultimoDiaDelMes(anio, mes)).padStart(2, '0')}`

  return {
    inicio,
    fin,
    numero,
    etiqueta: `${numero === 1 ? '1ª' : '2ª'} quincena de ${MESES[mes - 1]} ${anio}`,
  }
}

/** Convierte "2026-10-15" en el último segundo de ese día, para filtros "hasta" */
export function finDelDia(fecha: string): string {
  return `${fecha} 23:59:59`
}

/** Convierte "2026-10-01" en el primer segundo de ese día, para filtros "desde" */
export function inicioDelDia(fecha: string): string {
  return `${fecha} 00:00:00`
}
