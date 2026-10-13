import type { Request, Response } from 'express'
import { leerId } from '../../share/middleware/validar.js'
import { entregasServicio } from './entregas.servicio.js'

export const entregasControlador = {
  listar(_req: Request, res: Response) {
    res.json(entregasServicio.listar())
  },

  registrar(req: Request, res: Response) {
    res.status(201).json(entregasServicio.registrar(req.body))
  },

  comprobante(req: Request, res: Response) {
    res.json(entregasServicio.comprobante(leerId(req.params.ordenId, 'ordenId')))
  },

  firma(req: Request, res: Response) {
    res.sendFile(entregasServicio.rutaFirma(leerId(req.params.ordenId, 'ordenId')))
  },
}
