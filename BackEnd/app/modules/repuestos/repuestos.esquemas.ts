import { z } from 'zod'
import { pesos, textoOpcional, textoRequerido } from '../../share/middleware/validar.js'

// Datos para editar un repuesto (el stock NO se edita aquí: se usa entrada o ajuste)
export const esquemaEditarRepuesto = z.object({
  codigo: textoOpcional,
  nombre: textoRequerido('nombre'),
  categoria: textoOpcional,
  marca: textoOpcional,
  unidad: z.string().trim().min(1).default('unidad'),
  costo: pesos,
  precio_venta: pesos,
  stock_minimo: z.coerce.number().min(0, 'No puede ser negativo').default(1),
})

// Para crear se permite indicar el stock con el que arranca
export const esquemaCrearRepuesto = esquemaEditarRepuesto.extend({
  stock: z.coerce.number().min(0, 'No puede ser negativo').default(0),
})

// Filtros de la lista: /api/repuestos?q=freno&estado=agotado
export const esquemaFiltros = z.object({
  q: z.string().trim().optional(),
  estado: z.enum(['agotado', 'por_agotarse', 'suficiente']).optional().catch(undefined),
  categoria: z.string().trim().optional(),
})

export type DatosCrearRepuesto = z.infer<typeof esquemaCrearRepuesto>
export type DatosEditarRepuesto = z.infer<typeof esquemaEditarRepuesto>
