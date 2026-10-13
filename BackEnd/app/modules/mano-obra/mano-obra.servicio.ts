// Reglas del catálogo de mano de obra
import { noEncontrado, solicitudInvalida } from '../../share/errores.js'
import { ahora } from '../../share/utils/fechas.js'
import { manoObraRepositorio } from './mano-obra.repositorio.js'
import type { DatosManoObra } from './mano-obra.esquemas.js'
import type { ManoObra } from './mano-obra.tipos.js'

export const manoObraServicio = {
  listar(q?: string) {
    return manoObraRepositorio.listar(q)
  },

  obtener(id: number): ManoObra {
    const item = manoObraRepositorio.buscarPorId(id)
    if (!item) throw noEncontrado('Mano de obra')
    return item
  },

  /** Exige que esté activa (para agregarla a una orden) */
  obtenerActiva(id: number): ManoObra {
    const item = this.obtener(id)
    if (!item.activo) throw solicitudInvalida(`La mano de obra "${item.nombre}" está desactivada`)
    return item
  },

  crear(datos: DatosManoObra): ManoObra {
    const id = manoObraRepositorio.crear(datos, ahora())
    return this.obtener(id)
  },

  editar(id: number, datos: DatosManoObra): ManoObra {
    this.obtener(id)
    manoObraRepositorio.actualizar(id, datos)
    return this.obtener(id)
  },

  desactivar(id: number) {
    this.obtener(id)
    manoObraRepositorio.desactivar(id)
  },
}
