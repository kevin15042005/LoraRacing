import { z } from 'zod'
import { pesos, textoOpcional, textoRequerido } from '../../share/middleware/validar.js'

export const esquemaManoObra = z.object({
  nombre: textoRequerido('nombre'),
  descripcion: textoOpcional,
  precio: pesos,
})

export type DatosManoObra = z.infer<typeof esquemaManoObra>
