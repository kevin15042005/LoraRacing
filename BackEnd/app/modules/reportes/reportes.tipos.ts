/** Totales de dinero de un periodo */
export interface TotalesPeriodo {
  ordenes: number // cantidad de órdenes cerradas o entregadas
  ingresos: number // lo cobrado a clientes
  ingresos_mano_obra: number
  ingresos_repuestos: number
  ingresos_otros: number
  costo: number // costo de repuestos y otros gastos
  ganancia: number // ingresos - costo
  descuentos: number // total descontado
  cortesias: number // valor de lo que no se cobró
}

export interface FilaQuincena extends TotalesPeriodo {
  mes: string // "2026-10"
  quincena: 1 | 2
  etiqueta: string // "1ª quincena de octubre 2026"
  inicio: string
  fin: string
}

export interface RepuestoMasUsado {
  repuesto_id: number
  nombre: string
  cantidad: number
  ingresos: number
  costo: number
}

export interface ResumenInicio {
  quincena_actual: FilaQuincena
  stock: Record<string, number> // agotado, por_agotarse, suficiente
  ordenes_abiertas: number
  ordenes_por_entregar: number
}
