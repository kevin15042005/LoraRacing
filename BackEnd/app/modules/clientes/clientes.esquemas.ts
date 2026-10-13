import { z } from 'zod'
import { textoOpcional, textoRequerido } from '../../share/middleware/validar.js'

export const esquemaCliente = z.object({
  nombre: textoRequerido('nombre'),
  documento: textoOpcional,
  telefono: textoOpcional,
  email: z
    .string()
    .trim()
    .nullish()
    .transform(v => (v ? v.toLowerCase() : null))
    .refine(v => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo no válido'),
  direccion: textoOpcional,
  notas: textoOpcional,
})

export type DatosCliente = z.infer<typeof esquemaCliente>
