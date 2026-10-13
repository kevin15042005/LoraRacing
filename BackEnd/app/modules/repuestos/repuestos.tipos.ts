export type EstadoStock = 'agotado' | 'por_agotarse' | 'suficiente'

export interface Repuesto {
  id: number
  codigo: string | null
  nombre: string
  categoria: string | null
  marca: string | null
  unidad: string
  costo: number
  precio_venta: number
  stock: number
  stock_minimo: number
  activo: number
  creado_en: string
}

/** Repuesto con su estado calculado (agotado / por agotarse / suficiente) */
export interface RepuestoConEstado extends Repuesto {
  estado: EstadoStock
}

export interface FiltrosRepuestos {
  q?: string
  estado?: EstadoStock
  categoria?: string
}
