// =============================================================
// share/middleware/manejarErrores.ts
// Atrapa cualquier error que ocurra en rutas, controladores o
// servicios y lo convierte en una respuesta JSON clara:
//   { "error": "Repuesto no encontrado" }
// Debe registrarse AL FINAL en app.ts.
// =============================================================
import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { ErrorApp } from '../errores.js'
import { mensajeDeZod } from './validar.js'

export function manejarErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // 1. Errores que lanzamos nosotros a propósito
  if (err instanceof ErrorApp) {
    res.status(err.status).json({ error: err.message })
    return
  }

  // 2. Errores de validación de Zod (por ejemplo, en filtros de la URL)
  if (err instanceof ZodError) {
    res.status(400).json({ error: mensajeDeZod(err) })
    return
  }

  const e = err as { code?: string; type?: string; message?: string }

  // 3. JSON mal escrito o demasiado grande
  if (e.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'El JSON enviado está mal formado' })
    return
  }
  if (e.type === 'entity.too.large') {
    res.status(413).json({ error: 'Los datos enviados son demasiado grandes' })
    return
  }

  // 4. Reglas de la base de datos que no se cumplieron
  if (e.code?.startsWith('SQLITE_CONSTRAINT')) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const campo = e.message?.split('.').pop() ?? 'campo'
      res.status(409).json({ error: `Ya existe un registro con ese ${campo}` })
      return
    }
    if (e.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      res.status(409).json({ error: 'El registro está relacionado con otros datos' })
      return
    }
    res.status(400).json({ error: 'Los datos no cumplen las reglas de la base de datos' })
    return
  }

  // 5. Cualquier otro error: se registra en consola y se responde genérico
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
}

/** Respuesta para rutas /api que no existen */
export function rutaNoEncontrada(req: Request, res: Response) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
}
