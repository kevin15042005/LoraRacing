// Único lugar del módulo reportes que escribe SQL.
// Solo cuentan las órdenes cerradas o entregadas (las anuladas y abiertas no).
import { db } from '../../db/conexion.js'
import type { RepuestoMasUsado, TotalesPeriodo } from './reportes.tipos.js'

const ORDENES_VALIDAS = `o.estado IN ('cerrada','entregada')`

// Columnas de totales, reutilizadas en varias consultas
const COLUMNAS_TOTALES = `
  COUNT(DISTINCT o.id) AS ordenes,
  IFNULL(SUM(i.total), 0) AS ingresos,
  IFNULL(SUM(CASE WHEN i.tipo = 'mano_obra' THEN i.total END), 0) AS ingresos_mano_obra,
  IFNULL(SUM(CASE WHEN i.tipo = 'repuesto' THEN i.total END), 0) AS ingresos_repuestos,
  IFNULL(SUM(CASE WHEN i.tipo = 'otro' THEN i.total END), 0) AS ingresos_otros,
  IFNULL(SUM(ROUND(i.cantidad * i.costo_unitario)), 0) AS costo,
  IFNULL(SUM(CASE WHEN i.cobrar = 1
                  THEN MIN(i.descuento, ROUND(i.cantidad * i.precio_unitario)) END), 0) AS descuentos,
  IFNULL(SUM(CASE WHEN i.cobrar = 0 THEN ROUND(i.cantidad * i.precio_unitario) END), 0) AS cortesias`

type FilaTotales = Omit<TotalesPeriodo, 'ganancia'>

function conGanancia<T extends FilaTotales>(fila: T): T & { ganancia: number } {
  return { ...fila, ganancia: fila.ingresos - fila.costo }
}

export const reportesRepositorio = {
  /** Totales entre dos momentos ("2026-10-01 00:00:00" a "2026-10-15 23:59:59") */
  totales(desde: string, hasta: string): TotalesPeriodo {
    const fila = db
      .prepare(`SELECT ${COLUMNAS_TOTALES}
                FROM ordenes o JOIN orden_items i ON i.orden_id = o.id
                WHERE ${ORDENES_VALIDAS} AND o.cerrada_en BETWEEN ? AND ?`)
      .get(desde, hasta) as FilaTotales
    return conGanancia(fila)
  },

  /** Totales agrupados por quincena desde una fecha */
  porQuincena(desde: string) {
    const filas = db
      .prepare(`SELECT
                  substr(o.cerrada_en, 1, 7) AS mes,
                  CASE WHEN CAST(substr(o.cerrada_en, 9, 2) AS INTEGER) <= 15 THEN 1 ELSE 2 END AS quincena,
                  ${COLUMNAS_TOTALES}
                FROM ordenes o JOIN orden_items i ON i.orden_id = o.id
                WHERE ${ORDENES_VALIDAS} AND o.cerrada_en >= ?
                GROUP BY 1, 2
                ORDER BY 1 DESC, 2 DESC`)
      .all(desde) as (FilaTotales & { mes: string; quincena: 1 | 2 })[]
    return filas.map(conGanancia)
  },

  repuestosMasUsados(desde: string, hasta: string, limite: number): RepuestoMasUsado[] {
    return db
      .prepare(`SELECT i.repuesto_id, r.nombre,
                  SUM(i.cantidad) AS cantidad,
                  SUM(i.total) AS ingresos,
                  SUM(ROUND(i.cantidad * i.costo_unitario)) AS costo
                FROM orden_items i
                JOIN ordenes o ON o.id = i.orden_id
                JOIN repuestos r ON r.id = i.repuesto_id
                WHERE ${ORDENES_VALIDAS} AND i.tipo = 'repuesto' AND o.cerrada_en BETWEEN ? AND ?
                GROUP BY i.repuesto_id
                ORDER BY cantidad DESC
                LIMIT ?`)
      .all(desde, hasta, limite) as RepuestoMasUsado[]
  },

  contarOrdenesPorEstado(): Record<string, number> {
    const filas = db
      .prepare('SELECT estado, COUNT(*) AS total FROM ordenes GROUP BY estado')
      .all() as { estado: string; total: number }[]
    const resultado: Record<string, number> = { abierta: 0, cerrada: 0, entregada: 0, anulada: 0 }
    for (const f of filas) resultado[f.estado] = f.total
    return resultado
  },
}
