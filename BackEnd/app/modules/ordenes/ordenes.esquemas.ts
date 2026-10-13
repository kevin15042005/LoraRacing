import { z } from 'zod'
import {
  cantidadPositiva, fechaTexto, idOpcional, pesos, textoOpcional, textoRequerido,
} from '../../share/middleware/validar.js'

const kmOpcional = z.coerce.number().int().min(0).nullish().transform(v => v ?? null)

export const esquemaCrearOrden = z.object({
  tipo: z.enum(['venta', 'mantenimiento'], { error: 'tipo debe ser "venta" o "mantenimiento"' }),
  cliente_id: idOpcional,
  moto_id: idOpcional,
  km: kmOpcional,
  diagnostico: textoOpcional,
  notas: textoOpcional,
  mecanico: textoOpcional, // quién realiza el trabajo
})

export const esquemaEditarOrden = esquemaCrearOrden.omit({ tipo: true })

// ---- Líneas de la orden ----
// Campos comunes: si no envías precio_unitario se usa el precio estándar del catálogo
const comunes = {
  cantidad: cantidadPositiva.default(1),
  precio_unitario: pesos.optional(),   // precio manual (si se omite, el estándar)
  descuento: pesos.default(0),         // descuento en pesos
  cobrar: z.boolean().default(true),   // false = no se cobra (cortesía)
}

export const esquemaAgregarItem = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('repuesto'),
    repuesto_id: z.coerce.number().int().positive(),
    ...comunes,
  }),
  z.object({
    tipo: z.literal('mano_obra'),
    mano_obra_id: z.coerce.number().int().positive(),
    ...comunes,
  }),
  z.object({
    tipo: z.literal('otro'), // algo fuera del catálogo: tornería, pintura externa...
    descripcion: textoRequerido('descripcion'),
    cantidad: cantidadPositiva.default(1),
    precio_unitario: pesos,
    costo_unitario: pesos.default(0),
    descuento: pesos.default(0),
    cobrar: z.boolean().default(true),
  }),
], { error: 'tipo debe ser "repuesto", "mano_obra" u "otro"' })

export const esquemaEditarItem = z
  .object({
    descripcion: z.string().trim().min(1).optional(),
    cantidad: cantidadPositiva.optional(),
    precio_unitario: pesos.optional(),
    descuento: pesos.optional(),
    cobrar: z.boolean().optional(),
  })
  .refine(d => Object.values(d).some(v => v !== undefined), 'Envía al menos un campo para cambiar')

export const esquemaAnular = z.object({
  motivo: textoRequerido('motivo'),
})

// Filtros: /api/ordenes?estado=abierta&desde=2026-10-01&q=ABC12D
export const esquemaFiltrosOrdenes = z.object({
  estado: z.enum(['abierta', 'cerrada', 'entregada', 'anulada']).optional(),
  tipo: z.enum(['venta', 'mantenimiento']).optional(),
  cliente_id: z.coerce.number().int().positive().optional(),
  moto_id: z.coerce.number().int().positive().optional(),
  desde: fechaTexto.optional(),
  hasta: fechaTexto.optional(),
  q: z.string().trim().optional(),
  mecanico: z.string().trim().optional(),
})

export type DatosCrearOrden = z.infer<typeof esquemaCrearOrden>
export type DatosEditarOrden = z.infer<typeof esquemaEditarOrden>
export type DatosAgregarItem = z.infer<typeof esquemaAgregarItem>
export type DatosEditarItem = z.infer<typeof esquemaEditarItem>
