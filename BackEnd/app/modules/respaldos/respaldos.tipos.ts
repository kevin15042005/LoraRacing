export type MotivoRespaldo = 'automatico' | 'manual'

export interface Respaldo {
  archivo: string // "taller_2026-10-13_12-53-10_manual.db"
  motivo: MotivoRespaldo
  tamano_kb: number
  fecha: string
}
