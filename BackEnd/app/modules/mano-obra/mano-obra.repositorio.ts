// Único lugar del módulo mano-obra que escribe SQL
import { db } from '../../db/conexion.js'
import type { DatosManoObra } from './mano-obra.esquemas.js'
import type { ManoObra } from './mano-obra.tipos.js'

export const manoObraRepositorio = {
  listar(q?: string): ManoObra[] {
    return db
      .prepare(`SELECT * FROM mano_obra
                WHERE activo = 1 AND (@q IS NULL OR nombre LIKE @q OR IFNULL(descripcion,'') LIKE @q)
                ORDER BY nombre COLLATE NOCASE`)
      .all({ q: q ? `%${q}%` : null }) as ManoObra[]
  },

  buscarPorId(id: number): ManoObra | undefined {
    return db.prepare('SELECT * FROM mano_obra WHERE id = ?').get(id) as ManoObra | undefined
  },

  crear(datos: DatosManoObra, creadoEn: string): number {
    const r = db
      .prepare(`INSERT INTO mano_obra (nombre, descripcion, precio, creado_en)
                VALUES (@nombre, @descripcion, @precio, @creado_en)`)
      .run({ ...datos, creado_en: creadoEn })
    return Number(r.lastInsertRowid)
  },

  actualizar(id: number, datos: DatosManoObra) {
    db.prepare('UPDATE mano_obra SET nombre = @nombre, descripcion = @descripcion, precio = @precio WHERE id = @id')
      .run({ ...datos, id })
  },

  desactivar(id: number) {
    db.prepare('UPDATE mano_obra SET activo = 0 WHERE id = ?').run(id)
  },
}
