import { z } from 'zod'
import { textoRequerido } from '../../share/middleware/validar.js'

/** PIN elegido por el usuario: de 4 a 8 números (se aceptan espacios o guiones al escribirlo) */
export const pin = z
  .string({ error: 'El PIN es obligatorio' })
  .transform(v => v.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\d{4,8}$/, 'El PIN debe tener de 4 a 8 números'))

export const esquemaRegistro = z.object({
  usuario: textoRequerido('usuario').min(3, 'El usuario debe tener al menos 3 letras').toLowerCase(),
  nombre: textoRequerido('nombre'),
  clave: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  pin, // PIN de recuperación que elige el administrador
})

export const esquemaLogin = z.object({
  usuario: textoRequerido('usuario').toLowerCase(),
  clave: z.string().min(1, 'La contraseña es obligatoria'),
})

export const esquemaCambiarClave = z.object({
  // Sirve la contraseña actual o el PIN de recuperación
  claveActual: z.string().min(1, 'Escribe la contraseña actual o el PIN de recuperación'),
  claveNueva: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
})

// Crear o cambiar el PIN desde Mi cuenta (se confirma con la contraseña actual o el PIN actual)
export const esquemaCambiarPin = z.object({
  claveActual: z.string().min(1, 'Escribe la contraseña actual'),
  pinNuevo: pin,
})

// Recuperar desde el login, sin conocer la contraseña anterior
export const esquemaRecuperar = z.object({
  usuario: textoRequerido('usuario').toLowerCase(),
  pin,
  claveNueva: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
})

export type DatosRegistro = z.infer<typeof esquemaRegistro>
export type DatosLogin = z.infer<typeof esquemaLogin>
export type DatosCambiarClave = z.infer<typeof esquemaCambiarClave>
export type DatosCambiarPin = z.infer<typeof esquemaCambiarPin>
export type DatosRecuperar = z.infer<typeof esquemaRecuperar>
