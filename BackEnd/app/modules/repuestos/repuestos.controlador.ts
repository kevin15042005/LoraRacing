// Recibe la petición, llama al servicio y responde. Sin lógica de negocio.
import type { Request, Response } from 'express'
import { leerId } from '../../share/middleware/validar.js'
import { esquemaFiltros } from './repuestos.esquemas.js'
import { repuestosServicio } from './repuestos.servicio.js'

export const repuestosControlador = {
  listar(req: Request, res: Response) {
    const filtros = esquemaFiltros.parse(req.query)
    res.json(repuestosServicio.listar(filtros))
  },

  obtener(req: Request, res: Response) {
    res.json(repuestosServicio.obtener(leerId(req.params.id)))
  },

  alertas(_req: Request, res: Response) {
    res.json(repuestosServicio.alertas())
  },

  categorias(_req: Request, res: Response) {
    res.json(repuestosServicio.categorias())
  },

  crear(req: Request, res: Response) {
    res.status(201).json(repuestosServicio.crear(req.body))
  },

  editar(req: Request, res: Response) {
    res.json(repuestosServicio.editar(leerId(req.params.id), req.body))
  },

  desactivar(req: Request, res: Response) {
    repuestosServicio.desactivar(leerId(req.params.id))
    res.json({ ok: true })
  },
}
