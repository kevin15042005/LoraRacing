// Único lugar del módulo inventario que escribe SQL.
// Este módulo es el dueño del stock: solo él lo sube o lo baja.
import { db } from '../../db/conexion.js'
import type { Movimiento, NuevoMovimiento } from './inventario.tipos.js'

export const inventarioRepositorio = {
  /** Suma (o resta, si es negativa) una cantidad al stock */
  sumarStock(repuestoId: number, cantidad: number) {
    db.prepare('UPDATE repuestos SET stock = stock + ? WHERE id = ?').run(cantidad, repuestoId)
  },

  fijarStock(repuestoId: number, stock: number) {
    db.prepare('UPDATE repuestos SET stock = ? WHERE id = ?').run(stock, repuestoId)
  },

  actualizarCosto(repuestoId: number, costo: number) {
    db.prepare('UPDATE repuestos SET costo = ? WHERE id = ?').run(costo, repuestoId)
  },

  registrarMovimiento(mov: NuevoMovimiento) {
    db.prepare(`INSERT INTO movimientos (repuesto_id, tipo, cantidad, costo_unitario, orden_id, nota, fecha)
                VALUES (@repuesto_id, @tipo, @cantidad, @costo_unitario, @orden_id, @nota, @fecha)`)
      .run(mov)
  },

  movimientos(repuestoId: number, limite = 200): Movimiento[] {
    return db
      .prepare('SELECT * FROM movimientos WHERE repuesto_id = ? ORDER BY id DESC LIMIT ?')
      .all(repuestoId, limite) as Movimiento[]
  },
}
