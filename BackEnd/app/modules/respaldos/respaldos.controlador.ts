import type { Request, Response } from 'express'
import { respaldosServicio } from './respaldos.servicio.js'

export const respaldosControlador = {
  listar(_req: Request, res: Response) {
    res.json(respaldosServicio.listar())
  },

  // async: Express 5 atrapa solo los errores de funciones async
  async crear(_req: Request, res: Response) {
    res.status(201).json(await respaldosServicio.crear('manual'))
  },

  descargar(req: Request, res: Response) {
    const archivo = String(req.params.archivo)
    res.download(respaldosServicio.rutaArchivo(archivo), archivo)
  },
}
