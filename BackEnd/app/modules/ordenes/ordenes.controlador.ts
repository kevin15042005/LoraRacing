import type { Request, Response } from 'express'
import { leerId } from '../../share/middleware/validar.js'
import { esquemaFiltrosOrdenes } from './ordenes.esquemas.js'
import { ordenesServicio } from './ordenes.servicio.js'

export const ordenesControlador = {
  listar(req: Request, res: Response) {
    res.json(ordenesServicio.listar(esquemaFiltrosOrdenes.parse(req.query)))
  },

  mecanicos(_req: Request, res: Response) {
    res.json(ordenesServicio.mecanicos())
  },

  detalle(req: Request, res: Response) {
    res.json(ordenesServicio.detalle(leerId(req.params.id)))
  },

  crear(req: Request, res: Response) {
    res.status(201).json(ordenesServicio.crear(req.body))
  },

  editar(req: Request, res: Response) {
    res.json(ordenesServicio.editar(leerId(req.params.id), req.body))
  },

  agregarItem(req: Request, res: Response) {
    res.status(201).json(ordenesServicio.agregarItem(leerId(req.params.id), req.body))
  },

  editarItem(req: Request, res: Response) {
    res.json(ordenesServicio.editarItem(leerId(req.params.id), leerId(req.params.itemId, 'itemId'), req.body))
  },

  eliminarItem(req: Request, res: Response) {
    res.json(ordenesServicio.eliminarItem(leerId(req.params.id), leerId(req.params.itemId, 'itemId')))
  },

  cerrar(req: Request, res: Response) {
    res.json(ordenesServicio.cerrar(leerId(req.params.id)))
  },

  anular(req: Request, res: Response) {
    res.json(ordenesServicio.anular(leerId(req.params.id), req.body.motivo))
  },
}
