import type { Request, Response } from 'express'
import { esquemaMasUsados, esquemaQuincenas, esquemaRango } from './reportes.esquemas.js'
import { reportesServicio } from './reportes.servicio.js'

export const reportesControlador = {
  resumen(_req: Request, res: Response) {
    res.json(reportesServicio.resumen())
  },

  quincenaActual(_req: Request, res: Response) {
    res.json(reportesServicio.quincenaActual())
  },

  quincenas(req: Request, res: Response) {
    const { meses } = esquemaQuincenas.parse(req.query)
    res.json(reportesServicio.quincenas(meses))
  },

  ganancia(req: Request, res: Response) {
    const { desde, hasta } = esquemaRango.parse(req.query)
    res.json(reportesServicio.ganancia(desde, hasta))
  },

  repuestosMasUsados(req: Request, res: Response) {
    const { desde, hasta, limite } = esquemaMasUsados.parse(req.query)
    res.json(reportesServicio.repuestosMasUsados(desde, hasta, limite))
  },

  stock(_req: Request, res: Response) {
    res.json(reportesServicio.stock())
  },
}
