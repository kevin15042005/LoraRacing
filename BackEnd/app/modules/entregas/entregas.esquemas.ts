import { z } from 'zod'
import { textoOpcional, textoRequerido } from '../../share/middleware/validar.js'

export const PREFIJO_PNG = 'data:image/png;base64,'

export const esquemaEntrega = z.object({
  orden_id: z.coerce.number({ error: 'orden_id es obligatorio' }).int().positive(),
  recibe_nombre: textoRequerido('Nombre de quien recibe'),
  recibe_documento: textoOpcional,
  km_entrega: z.coerce.number().int().min(0).nullish().transform(v => v ?? null),
  observaciones: textoOpcional,
  // La firma llega como imagen PNG en texto (canvas.toDataURL('image/png') en el FrontEnd)
  firma: z
    .string({ error: 'La firma es obligatoria' })
    .startsWith(PREFIJO_PNG, 'La firma debe ser una imagen PNG en base64'),
})

export type DatosEntrega = z.infer<typeof esquemaEntrega>
