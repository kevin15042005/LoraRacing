// Único lugar del módulo clientes que escribe SQL
import { db } from '../../db/conexion.js'
import type { DatosCliente } from './clientes.esquemas.js'
import type { Cliente, ClienteResumen } from './clientes.tipos.js'

export const clientesRepositorio = {
  /** Busca por nombre, documento, teléfono o placa de alguna de sus motos */
  listar(q?: string): ClienteResumen[] {
    return db
      .prepare(`SELECT c.*,
                  (SELECT COUNT(*) FROM motos m WHERE m.cliente_id = c.id AND m.activo = 1) AS total_motos
                FROM clientes c
                WHERE c.activo = 1 AND (
                  @q IS NULL
                  OR c.nombre LIKE @q
                  OR IFNULL(c.documento,'') LIKE @q
                  OR IFNULL(c.telefono,'') LIKE @q
                  OR EXISTS (SELECT 1 FROM motos m WHERE m.cliente_id = c.id AND m.placa LIKE @q)
                )
                ORDER BY c.nombre COLLATE NOCASE
                LIMIT 500`)
      .all({ q: q ? `%${q}%` : null }) as ClienteResumen[]
  },

  buscarPorId(id: number): Cliente | undefined {
    return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id) as Cliente | undefined
  },

  crear(datos: DatosCliente, creadoEn: string): number {
    const r = db
      .prepare(`INSERT INTO clientes (nombre, documento, telefono, email, direccion, notas, creado_en)
                VALUES (@nombre, @documento, @telefono, @email, @direccion, @notas, @creado_en)`)
      .run({ ...datos, creado_en: creadoEn })
    return Number(r.lastInsertRowid)
  },

  actualizar(id: number, datos: DatosCliente) {
    db.prepare(`UPDATE clientes SET nombre = @nombre, documento = @documento, telefono = @telefono,
                  email = @email, direccion = @direccion, notas = @notas
                WHERE id = @id`)
      .run({ ...datos, id })
  },

  desactivar(id: number) {
    db.prepare('UPDATE clientes SET activo = 0 WHERE id = ?').run(id)
  },
}
