import type { OrdenDetalle } from '../ordenes/ordenes.tipos.js'

export interface Entrega {
  id: number
  orden_id: number
  recibe_nombre: string
  recibe_documento: string | null
  km_entrega: number | null
  observaciones: string | null
  firma_archivo: string
  fecha: string
}

/** Entrega con datos básicos de la orden (para la lista) */
export interface EntregaResumen extends Entrega {
  tipo: string
  placa: string | null
  cliente_nombre: string | null
}

/** Todo lo necesario para imprimir el comprobante de entrega */
export interface Comprobante {
  entrega: Entrega
  orden: OrdenDetalle
  firma_url: string
}
