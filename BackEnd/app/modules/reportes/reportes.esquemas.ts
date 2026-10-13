import { z } from 'zod'
import { fechaTexto } from '../../share/middleware/validar.js'

// /api/reportes/ganancia?desde=2026-10-01&hasta=2026-10-15
export const esquemaRango = z
  .object({
    desde: fechaTexto,
    hasta: fechaTexto,
  })
  .refine(r => r.desde <= r.hasta, 'La fecha "desde" debe ser anterior o igual a "hasta"')

// /api/reportes/quincenas?meses=6
export const esquemaQuincenas = z.object({
  meses: z.coerce.number().int().min(1).max(36).default(6),
})

// /api/reportes/repuestos-mas-usados?desde=...&hasta=...&limite=10
export const esquemaMasUsados = z.object({
  desde: fechaTexto.optional(),
  hasta: fechaTexto.optional(),
  limite: z.coerce.number().int().min(1).max(100).default(10),
})
