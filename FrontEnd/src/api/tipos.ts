// Cómo lucen los datos que responde el BackEnd (copiados de sus *.tipos.ts)

export interface Usuario {
  id: number
  usuario: string
  nombre: string
  creado_en: string
  tiene_pin: boolean
}

export interface RespuestaLogin {
  token: string
  expira_en: string
  usuario: Usuario
}

// ---------- Inventario ----------
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
  estado: EstadoStock
}

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'devolucion'

export interface Movimiento {
  id: number
  repuesto_id: number
  tipo: TipoMovimiento
  cantidad: number
  costo_unitario: number | null
  orden_id: number | null
  nota: string | null
  fecha: string
}

// ---------- Mano de obra, clientes, motos ----------
export interface ManoObra {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  activo: number
}

export interface Cliente {
  id: number
  nombre: string
  documento: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  notas: string | null
  activo: number
  total_motos?: number
}

export interface Moto {
  id: number
  cliente_id: number
  placa: string
  marca: string | null
  modelo: string | null
  anio: number | null
  cilindraje: number | null
  color: string | null
  km_actual: number | null
  notas: string | null
  activo: number
  cliente_nombre?: string
  cliente_telefono?: string | null
}

export interface ClienteDetalle extends Cliente {
  motos: Moto[]
}

// ---------- Órdenes ----------
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

export interface ResumenOrden {
  bruto: number
  descuentos: number
  cortesias: number
  total: number
  costo: number
  ganancia: number
}

export interface OrdenDetalle extends Orden {
  items: OrdenItem[]
  resumen: ResumenOrden
}

// ---------- Entregas ----------
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

export interface Comprobante {
  entrega: Entrega
  orden: OrdenDetalle
  firma_url: string
}

// ---------- Reportes ----------
export interface TotalesPeriodo {
  ordenes: number
  ingresos: number
  ingresos_mano_obra: number
  ingresos_repuestos: number
  ingresos_otros: number
  costo: number
  ganancia: number
  descuentos: number
  cortesias: number
}

export interface FilaQuincena extends TotalesPeriodo {
  mes: string
  quincena: 1 | 2
  etiqueta: string
  inicio: string
  fin: string
}

export interface ResumenInicio {
  quincena_actual: FilaQuincena
  stock: Record<EstadoStock, number>
  ordenes_abiertas: number
  ordenes_por_entregar: number
}

export interface RepuestoMasUsado {
  repuesto_id: number
  nombre: string
  cantidad: number
  ingresos: number
  costo: number
}

// ---------- Respaldos ----------
export interface Respaldo {
  archivo: string
  motivo: 'automatico' | 'manual'
  tamano_kb: number
  fecha: string
}
