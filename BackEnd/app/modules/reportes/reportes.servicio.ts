// Reportes: ganancia por quincena, repuestos más usados y resumen del inicio
import { finDelDia, hoy, inicioDelDia, quincenaDe } from '../../share/utils/fechas.js'
import { repuestosServicio } from '../repuestos/repuestos.servicio.js'
import { reportesRepositorio } from './reportes.repositorio.js'
import type { FilaQuincena, ResumenInicio } from './reportes.tipos.js'

/** Fecha "AAAA-MM-01" de hace N meses (incluyendo el actual) */
function inicioHaceMeses(meses: number): string {
  const [anio, mes] = hoy().split('-').map(Number)
  const d = new Date(Date.UTC(anio, mes - 1 - (meses - 1), 1))
  return d.toISOString().slice(0, 10)
}

export const reportesServicio = {
  /** Totales entre dos fechas */
  ganancia(desde: string, hasta: string) {
    return { desde, hasta, ...reportesRepositorio.totales(inicioDelDia(desde), finDelDia(hasta)) }
  },

  /** Quincena en curso con sus totales */
  quincenaActual(): FilaQuincena {
    const q = quincenaDe()
    return {
      mes: q.inicio.slice(0, 7),
      quincena: q.numero,
      etiqueta: q.etiqueta,
      inicio: q.inicio,
      fin: q.fin,
      ...reportesRepositorio.totales(inicioDelDia(q.inicio), finDelDia(q.fin)),
    }
  },

  /** Lista de quincenas de los últimos N meses (solo las que tuvieron movimiento) */
  quincenas(meses: number): FilaQuincena[] {
    return reportesRepositorio.porQuincena(inicioDelDia(inicioHaceMeses(meses))).map(fila => {
      const q = quincenaDe(`${fila.mes}-${fila.quincena === 1 ? '01' : '16'}`)
      return { ...fila, etiqueta: q.etiqueta, inicio: q.inicio, fin: q.fin }
    })
  },

  /** Si no se indican fechas, usa la quincena actual */
  repuestosMasUsados(desde: string | undefined, hasta: string | undefined, limite: number) {
    const q = quincenaDe()
    const d = desde ?? q.inicio
    const h = hasta ?? q.fin
    return {
      desde: d,
      hasta: h,
      repuestos: reportesRepositorio.repuestosMasUsados(inicioDelDia(d), finDelDia(h), limite),
    }
  },

  /** Conteo por estado + lista de repuestos agotados o por agotarse */
  stock() {
    return { resumen: repuestosServicio.contarPorEstado(), alertas: repuestosServicio.alertas() }
  },

  /** Todo lo que muestra la pantalla de inicio */
  resumen(): ResumenInicio {
    const ordenes = reportesRepositorio.contarOrdenesPorEstado()
    return {
      quincena_actual: this.quincenaActual(),
      stock: repuestosServicio.contarPorEstado(),
      ordenes_abiertas: ordenes.abierta,
      ordenes_por_entregar: ordenes.cerrada,
    }
  },
}
