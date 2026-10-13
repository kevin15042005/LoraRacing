export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'devolucion'

/** Una fila del historial: todo lo que entra o sale del inventario */
export interface Movimiento {
  id: number
  repuesto_id: number
  tipo: TipoMovimiento
  cantidad: number // positiva entra, negativa sale
  costo_unitario: number | null
  orden_id: number | null
  nota: string | null
  fecha: string
}

export type NuevoMovimiento = Omit<Movimiento, 'id'>
