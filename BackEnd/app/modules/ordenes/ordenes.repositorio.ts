// Único lugar del módulo ordenes que escribe SQL
import { db } from '../../db/conexion.js'
import { finDelDia, inicioDelDia } from '../../share/utils/fechas.js'
import type { FiltrosOrdenes, Orden, OrdenConDatos, OrdenItem, TipoItem } from './ordenes.tipos.js'

const SELECT_CON_DATOS = `
  SELECT o.*,
    c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.documento AS cliente_documento,
    m.placa, m.marca AS moto_marca, m.modelo AS moto_modelo,
    IFNULL((SELECT SUM(i.total) FROM orden_items i WHERE i.orden_id = o.id), 0) AS total,
    (SELECT COUNT(*) FROM orden_items i WHERE i.orden_id = o.id) AS total_items
  FROM ordenes o
  LEFT JOIN clientes c ON c.id = o.cliente_id
  LEFT JOIN motos m ON m.id = o.moto_id`

export interface NuevaLinea {
  orden_id: number
  tipo: TipoItem
  repuesto_id: number | null
  mano_obra_id: number | null
  descripcion: string
  cantidad: number
  precio_estandar: number
  precio_unitario: number
  descuento: number
  cobrar: number
  costo_unitario: number
}

export const ordenesRepositorio = {
  listar(filtros: FiltrosOrdenes): OrdenConDatos[] {
    const condiciones: string[] = []
    const valores: Record<string, unknown> = {}

    if (filtros.estado) { condiciones.push('o.estado = @estado'); valores.estado = filtros.estado }
    if (filtros.tipo) { condiciones.push('o.tipo = @tipo'); valores.tipo = filtros.tipo }
    if (filtros.cliente_id) { condiciones.push('o.cliente_id = @cliente_id'); valores.cliente_id = filtros.cliente_id }
    if (filtros.moto_id) { condiciones.push('o.moto_id = @moto_id'); valores.moto_id = filtros.moto_id }
    if (filtros.desde) { condiciones.push('o.fecha >= @desde'); valores.desde = inicioDelDia(filtros.desde) }
    if (filtros.hasta) { condiciones.push('o.fecha <= @hasta'); valores.hasta = finDelDia(filtros.hasta) }
    if (filtros.mecanico) { condiciones.push('o.mecanico = @mecanico'); valores.mecanico = filtros.mecanico }
    if (filtros.q) {
      condiciones.push(`(IFNULL(m.placa,'') LIKE @q OR IFNULL(c.nombre,'') LIKE @q OR IFNULL(o.mecanico,'') LIKE @q OR CAST(o.id AS TEXT) = @qExacto)`)
      valores.q = `%${filtros.q}%`
      valores.qExacto = filtros.q.replace('#', '')
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
    return db
      .prepare(`${SELECT_CON_DATOS} ${where} ORDER BY o.id DESC LIMIT 500`)
      .all(valores) as OrdenConDatos[]
  },

  buscarPorId(id: number): OrdenConDatos | undefined {
    return db.prepare(`${SELECT_CON_DATOS} WHERE o.id = ?`).get(id) as OrdenConDatos | undefined
  },

  crear(datos: Omit<Orden, 'id' | 'estado' | 'cerrada_en' | 'anulada_en' | 'motivo_anulacion'>): number {
    const r = db
      .prepare(`INSERT INTO ordenes (tipo, cliente_id, moto_id, km, diagnostico, notas, mecanico, fecha)
                VALUES (@tipo, @cliente_id, @moto_id, @km, @diagnostico, @notas, @mecanico, @fecha)`)
      .run(datos)
    return Number(r.lastInsertRowid)
  },

  actualizar(id: number, datos: Pick<Orden, 'cliente_id' | 'moto_id' | 'km' | 'diagnostico' | 'notas' | 'mecanico'>) {
    db.prepare(`UPDATE ordenes SET cliente_id = @cliente_id, moto_id = @moto_id, km = @km,
                  diagnostico = @diagnostico, notas = @notas, mecanico = @mecanico
                WHERE id = @id`)
      .run({ ...datos, id })
  },

  cerrar(id: number, fecha: string) {
    db.prepare(`UPDATE ordenes SET estado = 'cerrada', cerrada_en = ? WHERE id = ?`).run(fecha, id)
  },

  anular(id: number, fecha: string, motivo: string) {
    db.prepare(`UPDATE ordenes SET estado = 'anulada', anulada_en = ?, motivo_anulacion = ? WHERE id = ?`)
      .run(fecha, motivo, id)
  },

  marcarEntregada(id: number) {
    db.prepare(`UPDATE ordenes SET estado = 'entregada' WHERE id = ?`).run(id)
  },

  /** Nombres de mecánicos ya usados (para sugerirlos al escribir) */
  mecanicos(): string[] {
    return (db
      .prepare(`SELECT mecanico FROM ordenes WHERE mecanico IS NOT NULL
                GROUP BY mecanico COLLATE NOCASE ORDER BY MAX(id) DESC LIMIT 50`)
      .all() as { mecanico: string }[]).map(f => f.mecanico)
  },

  // ---- Líneas ----

  items(ordenId: number): OrdenItem[] {
    return db.prepare('SELECT * FROM orden_items WHERE orden_id = ? ORDER BY id').all(ordenId) as OrdenItem[]
  },

  buscarItem(itemId: number): OrdenItem | undefined {
    return db.prepare('SELECT * FROM orden_items WHERE id = ?').get(itemId) as OrdenItem | undefined
  },

  agregarItem(linea: NuevaLinea): number {
    const r = db
      .prepare(`INSERT INTO orden_items
                  (orden_id, tipo, repuesto_id, mano_obra_id, descripcion, cantidad,
                   precio_estandar, precio_unitario, descuento, cobrar, costo_unitario)
                VALUES
                  (@orden_id, @tipo, @repuesto_id, @mano_obra_id, @descripcion, @cantidad,
                   @precio_estandar, @precio_unitario, @descuento, @cobrar, @costo_unitario)`)
      .run(linea)
    return Number(r.lastInsertRowid)
  },

  actualizarItem(itemId: number, datos: Pick<OrdenItem, 'descripcion' | 'cantidad' | 'precio_unitario' | 'descuento' | 'cobrar'>) {
    db.prepare(`UPDATE orden_items SET descripcion = @descripcion, cantidad = @cantidad,
                  precio_unitario = @precio_unitario, descuento = @descuento, cobrar = @cobrar
                WHERE id = @id`)
      .run({ ...datos, id: itemId })
  },

  fijarCostoItem(itemId: number, costo: number) {
    db.prepare('UPDATE orden_items SET costo_unitario = ? WHERE id = ?').run(costo, itemId)
  },

  eliminarItem(itemId: number) {
    db.prepare('DELETE FROM orden_items WHERE id = ?').run(itemId)
  },

  /** Cuánto de un repuesto ya está en la orden (para no pedir más de lo que hay) */
  cantidadEnOrden(ordenId: number, repuestoId: number, exceptoItemId = 0): number {
    const fila = db
      .prepare(`SELECT IFNULL(SUM(cantidad), 0) AS total FROM orden_items
                WHERE orden_id = ? AND repuesto_id = ? AND id <> ?`)
      .get(ordenId, repuestoId, exceptoItemId) as { total: number }
    return fila.total
  },
}
