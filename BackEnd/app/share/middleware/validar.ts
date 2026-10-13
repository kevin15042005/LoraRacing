// =============================================================
// share/middleware/validar.ts
// Revisa con Zod que los datos que llegan estén bien ANTES
// de que lleguen al controlador. Si algo está mal, responde 400.
// =============================================================
import type { NextFunction, Request, Response } from 'express'
import { z, type ZodType } from 'zod'
import { ErrorApp } from '../errores.js'

// Mensajes de error de Zod en español
z.config(z.locales.es())

/** Úsalo en las rutas: router.post('/', validar(esquemaCrear), controlador.crear) */
export function validar(esquema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const resultado = esquema.safeParse(req.body ?? {})
    if (!resultado.success) {
      throw new ErrorApp(400, mensajeDeZod(resultado.error))
    }
    // Reemplaza el body por la versión limpia (con textos recortados, números convertidos...)
    req.body = resultado.data
    next()
  }
}

/** Convierte el primer error de Zod en un mensaje legible: "nombre: Requerido" */
export function mensajeDeZod(error: z.ZodError): string {
  const problema = error.issues[0]
  const campo = problema.path.join('.')
  return campo ? `${campo}: ${problema.message}` : problema.message
}

/** Lee un id de la URL (/api/repuestos/5) y verifica que sea un número válido */
export function leerId(valor: unknown, nombre = 'id'): number {
  const id = Number(valor)
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorApp(400, `${nombre} inválido`)
  }
  return id
}

// ---- Piezas reutilizables para los esquemas de cada módulo ----

/** Texto opcional: "" o espacios se guardan como null */
export const textoOpcional = z
  .string()
  .trim()
  .nullish()
  .transform(v => (v ? v : null))

/** Texto obligatorio, sin espacios sobrantes */
export const textoRequerido = (campo: string) =>
  z.string({ error: `${campo} es obligatorio` }).trim().min(1, `${campo} es obligatorio`)

/** Valor en pesos: entero y no negativo */
export const pesos = z.coerce.number().int('Debe ser un valor entero en pesos').min(0, 'No puede ser negativo')

/** Cantidad positiva (puede tener decimales, ej. 0.5 litros) */
export const cantidadPositiva = z.coerce.number().positive('Debe ser mayor que cero')

/** Id numérico opcional (para relaciones) */
export const idOpcional = z.coerce.number().int().positive().nullish().transform(v => v ?? null)

/** Fecha "AAAA-MM-DD" */
export const fechaTexto = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha AAAA-MM-DD')
