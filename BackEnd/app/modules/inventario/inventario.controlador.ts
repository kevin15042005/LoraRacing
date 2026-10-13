// Recibe la petición, llama al servicio y responde. Sin lógica de negocio.
import type { Request, Response } from 'express'
import { leerId } from '../../share/middleware/validar.js'
import { inventarioServicio } from './inventario.servicio.js'

export const inventarioControlador = {
  historial(req: Request, res: Response) {
    res.json(inventarioServicio.historial(leerId(req.params.id)))
  },

  entrada(req: Request, res: Response) {
    res.json(inventarioServicio.registrarEntrada(leerId(req.params.id), req.body))
  },

  ajuste(req: Request, res: Response) {
    res.json(inventarioServicio.ajustar(leerId(req.params.id), req.body))
  },
}
