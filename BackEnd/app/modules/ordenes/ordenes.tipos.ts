import type { ResumenCobro } from '../../share/utils/dinero.js'

export type TipoOrden = 'venta' | 'mantenimiento'
export type EstadoOrden = 'abierta' | 'cerrada' | 'entregada' | 'anulada'
export type TipoItem = 'repuesto' | 'mano_obra' | 'otro'

export interface Orden {
  id: number
  tipo: TipoOrden
  cliente_id: number | null
  moto_id: number | null
  km: number | null
  diagnostico: string | null
  notas: string | null
  mecanico: string | null
  estado: EstadoOrden
  fecha: string
  cerrada_en: string | null
  anulada_en: string | null
  motivo_anulacion: string | null
}

/** Orden con datos del cliente y la moto (para listas) */
export interface OrdenConDatos extends Orden {
  cliente_nombre: string | null
  cliente_telefono: string | null
  cliente_documento: string | null
  placa: string | null
  moto_marca: string | null
  moto_modelo: string | null
  total: number
  total_items: number
}

export interface OrdenItem {
  id: number
  orden_id: number
  tipo: TipoItem
  repuesto_id: number | null
  mano_obra_id: number | null
  descripcion: string
  cantidad: number
  precio_estandar: number
  precio_unitario: number
  descuento: number
  cobrar: number // 1 = se cobra, 0 = cortesía
  costo_unitario: number
  total: number
}

/** Orden completa: datos + líneas + totales */
export interface OrdenDetalle extends OrdenConDatos {
  items: OrdenItem[]
  resumen: ResumenCobro & {
    costo: number // costo de repuestos y otros gastos
    ganancia: number // total cobrado - costo
  }
}

export interface FiltrosOrdenes {
  estado?: EstadoOrden
  tipo?: TipoOrden
  cliente_id?: number
  moto_id?: number
  desde?: string
  hasta?: string
  q?: string
  mecanico?: string
}
