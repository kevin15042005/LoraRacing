import { z } from 'zod'
import { cantidadPositiva, pesos, textoOpcional, textoRequerido } from '../../share/middleware/validar.js'

// Compra de mercancía: suma stock y (opcionalmente) actualiza el costo
export const esquemaEntrada = z.object({
  cantidad: cantidadPositiva,
  costo: pesos.optional(),
  nota: textoOpcional,
})

// Conteo físico: deja el stock en lo que realmente hay
export const esquemaAjuste = z.object({
  stock_real: z.coerce.number().min(0, 'No puede ser negativo'),
  nota: textoRequerido('motivo del ajuste'),
})

export type DatosEntrada = z.infer<typeof esquemaEntrada>
export type DatosAjuste = z.infer<typeof esquemaAjuste>
