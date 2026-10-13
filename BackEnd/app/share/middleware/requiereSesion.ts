// =============================================================
// share/middleware/requiereSesion.ts
// Bloquea las rutas si no hay sesión iniciada.
// El FrontEnd debe enviar el encabezado:
//   Authorization: Bearer <token>
// =============================================================
import type { NextFunction, Request, Response } from 'express'
import { noAutorizado } from '../errores.js'
import { authServicio } from '../../modules/auth/auth.servicio.js'

export function requiereSesion(req: Request, res: Response, next: NextFunction) {
  const encabezado = req.headers.authorization ?? ''
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7).trim() : ''

  if (!token) throw noAutorizado()

  // Si el token no existe o venció, el servicio lanza un error 401
  const usuario = authServicio.validarToken(token)

  // Guardamos el usuario para que los controladores lo puedan usar
  res.locals.usuario = usuario
  res.locals.token = token
  next()
}
