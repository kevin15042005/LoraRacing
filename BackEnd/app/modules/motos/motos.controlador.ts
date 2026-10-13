import type { Request, Response } from 'express'
import { leerId } from '../../share/middleware/validar.js'
import { motosServicio } from './motos.servicio.js'

export const motosControlador = {
  listar(req: Request, res: Response) {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined
    res.json(motosServicio.listar(q))
  },

  obtener(req: Request, res: Response) {
    res.json(motosServicio.obtener(leerId(req.params.id)))
  },

  porPlaca(req: Request, res: Response) {
    res.json(motosServicio.buscarPorPlaca(String(req.params.placa)))
  },

  crear(req: Request, res: Response) {
    res.status(201).json(motosServicio.crear(req.body))
  },

  editar(req: Request, res: Response) {
    res.json(motosServicio.editar(leerId(req.params.id), req.body))
  },

  desactivar(req: Request, res: Response) {
    motosServicio.desactivar(leerId(req.params.id))
    res.json({ ok: true })
  },
}
