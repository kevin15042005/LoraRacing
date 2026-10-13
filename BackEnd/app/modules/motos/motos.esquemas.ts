import { z } from 'zod'
import { textoOpcional } from '../../share/middleware/validar.js'

/** Placa en mayúsculas y sin espacios ni guiones: "abc-12d" → "ABC12D" */
export const placa = z
  .string({ error: 'placa es obligatoria' })
  .transform(v => v.toUpperCase().replace(/[\s-]/g, ''))
  .pipe(z.string().min(5, 'Placa no válida').max(8, 'Placa no válida'))

const enteroOpcional = z.coerce.number().int().min(0).nullish().transform(v => v ?? null)

export const esquemaMoto = z.object({
  cliente_id: z.coerce.number({ error: 'cliente_id es obligatorio' }).int().positive(),
  placa,
  marca: textoOpcional,
  modelo: textoOpcional,
  anio: z.coerce.number().int().min(1950).max(2100).nullish().transform(v => v ?? null),
  cilindraje: enteroOpcional,
  color: textoOpcional,
  km_actual: enteroOpcional,
  notas: textoOpcional,
})

export type DatosMoto = z.infer<typeof esquemaMoto>
