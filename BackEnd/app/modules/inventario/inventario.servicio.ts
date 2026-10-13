// Reglas del inventario: compras, ajustes por conteo, salidas y devoluciones
import { db } from '../../db/conexion.js'
import { solicitudInvalida } from '../../share/errores.js'
import { ahora } from '../../share/utils/fechas.js'
import { repuestosServicio } from '../repuestos/repuestos.servicio.js'
import type { RepuestoConEstado } from '../repuestos/repuestos.tipos.js'
import { inventarioRepositorio } from './inventario.repositorio.js'
import type { DatosAjuste, DatosEntrada } from './inventario.esquemas.js'

export const inventarioServicio = {
  /** Historial de entradas, salidas y ajustes de un repuesto */
  historial(repuestoId: number) {
    repuestosServicio.obtener(repuestoId)
    return inventarioRepositorio.movimientos(repuestoId)
  },

  /** Stock con el que arranca un repuesto nuevo (lo llama repuestos al crear, dentro de su transacción) */
  registrarStockInicial(repuestoId: number, cantidad: number, costo: number, fecha: string) {
    inventarioRepositorio.sumarStock(repuestoId, cantidad)
    inventarioRepositorio.registrarMovimiento({
      repuesto_id: repuestoId, tipo: 'entrada', cantidad,
      costo_unitario: costo, orden_id: null, nota: 'Stock inicial', fecha,
    })
  },

  /** Compra de mercancía */
  registrarEntrada(repuestoId: number, datos: DatosEntrada): RepuestoConEstado {
    const repuesto = repuestosServicio.obtenerActivo(repuestoId)
    const costo = datos.costo ?? repuesto.costo
    db.transaction(() => {
      inventarioRepositorio.sumarStock(repuestoId, datos.cantidad)
      if (costo !== repuesto.costo) inventarioRepositorio.actualizarCosto(repuestoId, costo)
      inventarioRepositorio.registrarMovimiento({
        repuesto_id: repuestoId, tipo: 'entrada', cantidad: datos.cantidad,
        costo_unitario: costo, orden_id: null, nota: datos.nota, fecha: ahora(),
      })
    })()
    return repuestosServicio.obtener(repuestoId)
  },

  /** Conteo físico: deja el stock igual a lo que realmente hay en bodega */
  ajustar(repuestoId: number, datos: DatosAjuste): RepuestoConEstado {
    const repuesto = repuestosServicio.obtenerActivo(repuestoId)
    const diferencia = datos.stock_real - repuesto.stock
    if (diferencia !== 0) {
      db.transaction(() => {
        inventarioRepositorio.fijarStock(repuestoId, datos.stock_real)
        inventarioRepositorio.registrarMovimiento({
          repuesto_id: repuestoId, tipo: 'ajuste', cantidad: diferencia,
          costo_unitario: repuesto.costo, orden_id: null, nota: datos.nota, fecha: ahora(),
        })
      })()
    }
    return repuestosServicio.obtener(repuestoId)
  },

  // ---- Usadas por el módulo ordenes (dentro de su transacción) ----

  /** Descuenta stock al cerrar una orden. Falla si no alcanza. */
  registrarSalida(repuestoId: number, cantidad: number, ordenId: number) {
    const repuesto = repuestosServicio.obtener(repuestoId)
    if (repuesto.stock < cantidad) {
      throw solicitudInvalida(
        `Stock insuficiente de "${repuesto.nombre}": hay ${repuesto.stock} y se necesitan ${cantidad}`,
      )
    }
    inventarioRepositorio.sumarStock(repuestoId, -cantidad)
    inventarioRepositorio.registrarMovimiento({
      repuesto_id: repuestoId, tipo: 'salida', cantidad: -cantidad,
      costo_unitario: repuesto.costo, orden_id: ordenId, nota: `Orden #${ordenId}`, fecha: ahora(),
    })
  },

  /** Devuelve stock cuando se anula una orden ya cerrada */
  registrarDevolucion(repuestoId: number, cantidad: number, ordenId: number) {
    const repuesto = repuestosServicio.obtener(repuestoId)
    inventarioRepositorio.sumarStock(repuestoId, cantidad)
    inventarioRepositorio.registrarMovimiento({
      repuesto_id: repuestoId, tipo: 'devolucion', cantidad,
      costo_unitario: repuesto.costo, orden_id: ordenId, nota: `Anulación orden #${ordenId}`, fecha: ahora(),
    })
  },
}
