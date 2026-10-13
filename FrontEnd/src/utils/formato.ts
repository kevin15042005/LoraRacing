// Formatos para mostrar en pantalla

const formatoPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** 150000 → "$ 150.000" */
export const pesos = (valor: number) => formatoPesos.format(valor)

/** 1.5 → "1,5"   ·   3 → "3" */
export const cantidad = (valor: number) => valor.toLocaleString('es-CO', { maximumFractionDigits: 2 })

/** "2026-10-13 15:11:18" → "13 oct 2026, 3:11 p. m." */
export function fechaHora(texto: string | null | undefined): string {
  if (!texto) return ''
  const d = new Date(texto.replace(' ', 'T'))
  return d.toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** "2026-10-13 ..." → "13 oct 2026" */
export function fecha(texto: string | null | undefined): string {
  if (!texto) return ''
  const d = new Date(texto.slice(0, 10) + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Fecha de hoy "AAAA-MM-DD" en la hora del dispositivo */
export function hoy(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Convierte lo escrito en un campo a número ("" → undefined). Acepta coma decimal. */
export function numero(texto: FormDataEntryValue | string | null): number | undefined {
  if (texto === null) return undefined
  const limpio = String(texto).trim().replace(/\./g, '').replace(',', '.')
  if (limpio === '') return undefined
  const n = Number(limpio)
  return Number.isNaN(n) ? undefined : n
}

/** Igual que numero(), pero respeta el punto decimal (para cantidades: 1.5 litros) */
export function decimal(texto: FormDataEntryValue | string | null): number | undefined {
  if (texto === null) return undefined
  const limpio = String(texto).trim().replace(',', '.')
  if (limpio === '') return undefined
  const n = Number(limpio)
  return Number.isNaN(n) ? undefined : n
}

/** Texto de un formulario: "" → null */
export function texto(valor: FormDataEntryValue | null): string | null {
  const t = String(valor ?? '').trim()
  return t === '' ? null : t
}
