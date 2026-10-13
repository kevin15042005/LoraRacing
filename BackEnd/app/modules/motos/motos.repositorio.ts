// Único lugar del módulo motos que escribe SQL
import { db } from '../../db/conexion.js'
import type { DatosMoto } from './motos.esquemas.js'
import type { Moto, MotoConCliente } from './motos.tipos.js'

const SELECT_CON_CLIENTE = `
  SELECT m.*, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono
  FROM motos m JOIN clientes c ON c.id = m.cliente_id`

export const motosRepositorio = {
  listar(q?: string): MotoConCliente[] {
    return db
      .prepare(`${SELECT_CON_CLIENTE}
                WHERE m.activo = 1 AND (
                  @q IS NULL OR m.placa LIKE @q OR IFNULL(m.marca,'') LIKE @q
                  OR IFNULL(m.modelo,'') LIKE @q OR c.nombre LIKE @q
                )
                ORDER BY m.placa
                LIMIT 500`)
      .all({ q: q ? `%${q}%` : null }) as MotoConCliente[]
  },

  listarPorCliente(clienteId: number): Moto[] {
    return db
      .prepare('SELECT * FROM motos WHERE cliente_id = ? AND activo = 1 ORDER BY placa')
      .all(clienteId) as Moto[]
  },

  buscarPorId(id: number): MotoConCliente | undefined {
    return db.prepare(`${SELECT_CON_CLIENTE} WHERE m.id = ?`).get(id) as MotoConCliente | undefined
  },

  buscarPorPlaca(placa: string): MotoConCliente | undefined {
    return db.prepare(`${SELECT_CON_CLIENTE} WHERE m.placa = ?`).get(placa) as MotoConCliente | undefined
  },

  crear(datos: DatosMoto, creadoEn: string): number {
    const r = db
      .prepare(`INSERT INTO motos (cliente_id, placa, marca, modelo, anio, cilindraje, color, km_actual, notas, creado_en)
                VALUES (@cliente_id, @placa, @marca, @modelo, @anio, @cilindraje, @color, @km_actual, @notas, @creado_en)`)
      .run({ ...datos, creado_en: creadoEn })
    return Number(r.lastInsertRowid)
  },

  actualizar(id: number, datos: DatosMoto) {
    db.prepare(`UPDATE motos SET cliente_id = @cliente_id, placa = @placa, marca = @marca, modelo = @modelo,
                  anio = @anio, cilindraje = @cilindraje, color = @color, km_actual = @km_actual, notas = @notas
                WHERE id = @id`)
      .run({ ...datos, id })
  },

  /** Solo sube el kilometraje (nunca lo baja por error) */
  actualizarKm(id: number, km: number) {
    db.prepare('UPDATE motos SET km_actual = ? WHERE id = ? AND (km_actual IS NULL OR km_actual < ?)')
      .run(km, id, km)
  },

  desactivar(id: number) {
    db.prepare('UPDATE motos SET activo = 0 WHERE id = ?').run(id)
  },
}
