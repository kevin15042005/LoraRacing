// Único lugar del módulo repuestos que escribe SQL
import { db } from '../../db/conexion.js'
import type { DatosEditarRepuesto } from './repuestos.esquemas.js'
import type { FiltrosRepuestos, RepuestoConEstado } from './repuestos.tipos.js'

// Cálculo del estado del stock, reutilizado en varias consultas
const ESTADO_SQL = `CASE
  WHEN stock <= 0 THEN 'agotado'
  WHEN stock <= stock_minimo THEN 'por_agotarse'
  ELSE 'suficiente' END`

export const repuestosRepositorio = {
  listar(filtros: FiltrosRepuestos): RepuestoConEstado[] {
    const condiciones = ['activo = 1']
    const valores: Record<string, unknown> = {}

    if (filtros.q) {
      condiciones.push(`(nombre LIKE @q OR IFNULL(codigo,'') LIKE @q OR IFNULL(marca,'') LIKE @q)`)
      valores.q = `%${filtros.q}%`
    }
    if (filtros.categoria) {
      condiciones.push('categoria = @categoria')
      valores.categoria = filtros.categoria
    }
    if (filtros.estado) {
      condiciones.push(`${ESTADO_SQL} = @estado`)
      valores.estado = filtros.estado
    }

    return db
      .prepare(`SELECT *, ${ESTADO_SQL} AS estado FROM repuestos
                WHERE ${condiciones.join(' AND ')}
                ORDER BY nombre COLLATE NOCASE`)
      .all(valores) as RepuestoConEstado[]
  },

  buscarPorId(id: number): RepuestoConEstado | undefined {
    return db
      .prepare(`SELECT *, ${ESTADO_SQL} AS estado FROM repuestos WHERE id = ?`)
      .get(id) as RepuestoConEstado | undefined
  },

  /** Repuestos agotados o por agotarse, los más críticos primero */
  alertas(): RepuestoConEstado[] {
    return db
      .prepare(`SELECT *, ${ESTADO_SQL} AS estado FROM repuestos
                WHERE activo = 1 AND stock <= stock_minimo
                ORDER BY stock - stock_minimo, nombre COLLATE NOCASE`)
      .all() as RepuestoConEstado[]
  },

  contarPorEstado(): Record<string, number> {
    const filas = db
      .prepare(`SELECT ${ESTADO_SQL} AS estado, COUNT(*) AS total
                FROM repuestos WHERE activo = 1 GROUP BY 1`)
      .all() as { estado: string; total: number }[]
    const resultado: Record<string, number> = { agotado: 0, por_agotarse: 0, suficiente: 0 }
    for (const f of filas) resultado[f.estado] = f.total
    return resultado
  },

  categorias(): string[] {
    return (db
      .prepare(`SELECT DISTINCT categoria FROM repuestos
                WHERE activo = 1 AND categoria IS NOT NULL ORDER BY categoria COLLATE NOCASE`)
      .all() as { categoria: string }[]).map(f => f.categoria)
  },

  crear(datos: DatosEditarRepuesto, creadoEn: string): number {
    const r = db
      .prepare(`INSERT INTO repuestos
                  (codigo, nombre, categoria, marca, unidad, costo, precio_venta, stock_minimo, creado_en)
                VALUES
                  (@codigo, @nombre, @categoria, @marca, @unidad, @costo, @precio_venta, @stock_minimo, @creado_en)`)
      .run({ ...datos, creado_en: creadoEn })
    return Number(r.lastInsertRowid)
  },

  actualizar(id: number, datos: DatosEditarRepuesto) {
    db.prepare(`UPDATE repuestos SET
                  codigo = @codigo, nombre = @nombre, categoria = @categoria, marca = @marca,
                  unidad = @unidad, costo = @costo, precio_venta = @precio_venta, stock_minimo = @stock_minimo
                WHERE id = @id`)
      .run({ ...datos, id })
  },

  desactivar(id: number) {
    db.prepare('UPDATE repuestos SET activo = 0 WHERE id = ?').run(id)
  },
}
