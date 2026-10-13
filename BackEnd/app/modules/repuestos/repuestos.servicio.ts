// Reglas del catálogo de repuestos.
// El stock (compras, ajustes, salidas) lo maneja el módulo inventario.
import { db } from '../../db/conexion.js'
import { noEncontrado, solicitudInvalida } from '../../share/errores.js'
import { ahora } from '../../share/utils/fechas.js'
import { inventarioServicio } from '../inventario/inventario.servicio.js'
import { repuestosRepositorio } from './repuestos.repositorio.js'
import type { DatosCrearRepuesto, DatosEditarRepuesto } from './repuestos.esquemas.js'
import type { FiltrosRepuestos, RepuestoConEstado } from './repuestos.tipos.js'

export const repuestosServicio = {
  listar(filtros: FiltrosRepuestos) {
    return repuestosRepositorio.listar(filtros)
  },

  obtener(id: number): RepuestoConEstado {
    const repuesto = repuestosRepositorio.buscarPorId(id)
    if (!repuesto) throw noEncontrado('Repuesto')
    return repuesto
  },

  /** Igual que obtener, pero exige que el repuesto esté activo (para venderlo) */
  obtenerActivo(id: number): RepuestoConEstado {
    const repuesto = this.obtener(id)
    if (!repuesto.activo) throw solicitudInvalida(`El repuesto "${repuesto.nombre}" está desactivado`)
    return repuesto
  },

  alertas() {
    return repuestosRepositorio.alertas()
  },

  contarPorEstado() {
    return repuestosRepositorio.contarPorEstado()
  },

  categorias() {
    return repuestosRepositorio.categorias()
  },

  /** Crea el repuesto y, si trae stock inicial, el inventario deja registrado el movimiento */
  crear(datos: DatosCrearRepuesto): RepuestoConEstado {
    const id = db.transaction(() => {
      const fecha = ahora()
      const { stock, ...catalogo } = datos
      const nuevoId = repuestosRepositorio.crear(catalogo, fecha)
      if (stock > 0) inventarioServicio.registrarStockInicial(nuevoId, stock, datos.costo, fecha)
      return nuevoId
    })()
    return this.obtener(id)
  },

  editar(id: number, datos: DatosEditarRepuesto): RepuestoConEstado {
    this.obtener(id)
    repuestosRepositorio.actualizar(id, datos)
    return this.obtener(id)
  },

  /** No se borra para no perder el historial: solo se oculta */
  desactivar(id: number) {
    this.obtener(id)
    repuestosRepositorio.desactivar(id)
  },
}
