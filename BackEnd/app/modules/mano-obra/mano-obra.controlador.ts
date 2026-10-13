import type { Request, Response } from 'express'
import { leerId } from '../../share/middleware/validar.js'
import { manoObraServicio } from './mano-obra.servicio.js'

export const manoObraControlador = {
  listar(req: Request, res: Response) {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined
    res.json(manoObraServicio.listar(q))
  },

  obtener(req: Request, res: Response) {
    res.json(manoObraServicio.obtener(leerId(req.params.id)))
  },

  crear(req: Request, res: Response) {
    res.status(201).json(manoObraServicio.crear(req.body))
  },

  editar(req: Request, res: Response) {
    res.json(manoObraServicio.editar(leerId(req.params.id), req.body))
  },

  desactivar(req: Request, res: Response) {
    manoObraServicio.desactivar(leerId(req.params.id))
    res.json({ ok: true })
  },
}
