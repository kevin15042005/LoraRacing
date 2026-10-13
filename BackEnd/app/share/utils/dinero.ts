// =============================================================
// share/utils/dinero.ts
// Cálculos de dinero. Todo se maneja en pesos enteros (sin decimales).
// =============================================================

/** Lo mínimo que necesita una línea de una orden para calcular su valor */
export interface LineaCobro {
  cantidad: number
  precio_unitario: number
  descuento: number
  cobrar: number | boolean // 1/true = se cobra, 0/false = cortesía
}

/** Valor de la línea antes de descuentos: cantidad × precio */
export function valorBruto(linea: LineaCobro): number {
  return Math.round(linea.cantidad * linea.precio_unitario)
}

/** Lo que realmente se cobra por la línea */
export function totalLinea(linea: LineaCobro): number {
  if (!linea.cobrar) return 0
  return Math.max(valorBruto(linea) - linea.descuento, 0)
}

export interface ResumenCobro {
  bruto: number // suma de cantidad × precio de todas las líneas
  descuentos: number // total descontado en líneas que sí se cobran
  cortesias: number // valor de lo que no se cobró
  total: number // lo que paga el cliente
}

/** Resumen de una orden completa */
export function resumenCobro(lineas: LineaCobro[]): ResumenCobro {
  let bruto = 0
  let descuentos = 0
  let cortesias = 0
  let total = 0

  for (const linea of lineas) {
    const valor = valorBruto(linea)
    bruto += valor
    if (!linea.cobrar) {
      cortesias += valor
    } else {
      descuentos += Math.min(linea.descuento, valor)
      total += totalLinea(linea)
    }
  }

  return { bruto, descuentos, cortesias, total }
}

/** 150000 → "$ 150.000" */
export function formatearPesos(valor: number): string {
  return valor.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
}
