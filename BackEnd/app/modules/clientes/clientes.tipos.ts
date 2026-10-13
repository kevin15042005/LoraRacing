import type { Moto } from '../motos/motos.tipos.js'

export interface Cliente {
  id: number
  nombre: string
  documento: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  notas: string | null
  activo: number
  creado_en: string
}

/** Cliente con la cantidad de motos registradas (para la lista) */
export interface ClienteResumen extends Cliente {
  total_motos: number
}

/** Cliente con todas sus motos (para el detalle) */
export interface ClienteDetalle extends Cliente {
  motos: Moto[]
}
