import type { Request, Response } from 'express'
import { leerId } from '../../share/middleware/validar.js'
import { clientesServicio } from './clientes.servicio.js'

export const clientesControlador = {
  listar(req: Request, res: Response) {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined
    res.json(clientesServicio.listar(q))
  },

  detalle(req: Request, res: Response) {
    res.json(clientesServicio.detalle(leerId(req.params.id)))
  },

  crear(req: Request, res: Response) {
    res.status(201).json(clientesServicio.crear(req.body))
  },

  editar(req: Request, res: Response) {
    res.json(clientesServicio.editar(leerId(req.params.id), req.body))
  },

  desactivar(req: Request, res: Response) {
    clientesServicio.desactivar(leerId(req.params.id))
    res.json({ ok: true })
  },
}
