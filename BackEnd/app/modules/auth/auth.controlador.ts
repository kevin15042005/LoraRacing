// Recibe la petición, llama al servicio y responde. Sin lógica de negocio.
import type { Request, Response } from 'express'
import { authServicio } from './auth.servicio.js'

export const authControlador = {
  estado(_req: Request, res: Response) {
    res.json(authServicio.estado())
  },

  registro(req: Request, res: Response) {
    res.status(201).json(authServicio.registrarInicial(req.body))
  },

  login(req: Request, res: Response) {
    res.json(authServicio.login(req.body))
  },

  recuperar(req: Request, res: Response) {
    res.json(authServicio.recuperar(req.body))
  },

  cambiarPin(req: Request, res: Response) {
    authServicio.cambiarPin(res.locals.usuario.id, req.body)
    res.json({ ok: true, mensaje: 'PIN de recuperación guardado.' })
  },

  logout(_req: Request, res: Response) {
    authServicio.logout(res.locals.token)
    res.json({ ok: true })
  },

  yo(_req: Request, res: Response) {
    res.json(res.locals.usuario)
  },

  cambiarClave(req: Request, res: Response) {
    authServicio.cambiarClave(res.locals.usuario.id, res.locals.token, req.body)
    res.json({ ok: true, mensaje: 'Contraseña actualizada. Las otras sesiones se cerraron.' })
  },
}
