// Único lugar del módulo entregas que escribe SQL
import { db } from '../../db/conexion.js'
import type { Entrega, EntregaResumen } from './entregas.tipos.js'

export const entregasRepositorio = {
  listar(limite = 100): EntregaResumen[] {
    return db
      .prepare(`SELECT e.*, o.tipo, m.placa, c.nombre AS cliente_nombre
                FROM entregas e
                JOIN ordenes o ON o.id = e.orden_id
                LEFT JOIN motos m ON m.id = o.moto_id
                LEFT JOIN clientes c ON c.id = o.cliente_id
                ORDER BY e.id DESC LIMIT ?`)
      .all(limite) as EntregaResumen[]
  },

  buscarPorOrden(ordenId: number): Entrega | undefined {
    return db.prepare('SELECT * FROM entregas WHERE orden_id = ?').get(ordenId) as Entrega | undefined
  },

  crear(datos: Omit<Entrega, 'id'>): number {
    const r = db
      .prepare(`INSERT INTO entregas
                  (orden_id, recibe_nombre, recibe_documento, km_entrega, observaciones, firma_archivo, fecha)
                VALUES
                  (@orden_id, @recibe_nombre, @recibe_documento, @km_entrega, @observaciones, @firma_archivo, @fecha)`)
      .run(datos)
    return Number(r.lastInsertRowid)
  },
}
