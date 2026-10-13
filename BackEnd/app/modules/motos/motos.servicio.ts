// Reglas de motos
import { noEncontrado, solicitudInvalida } from '../../share/errores.js'
import { ahora } from '../../share/utils/fechas.js'
import { clientesServicio } from '../clientes/clientes.servicio.js'
import { motosRepositorio } from './motos.repositorio.js'
import { placa as esquemaPlaca, type DatosMoto } from './motos.esquemas.js'
import type { MotoConCliente } from './motos.tipos.js'

export const motosServicio = {
  listar(q?: string) {
    return motosRepositorio.listar(q)
  },

  listarPorCliente(clienteId: number) {
    return motosRepositorio.listarPorCliente(clienteId)
  },

  obtener(id: number): MotoConCliente {
    const moto = motosRepositorio.buscarPorId(id)
    if (!moto) throw noEncontrado('Moto')
    return moto
  },

  obtenerActiva(id: number): MotoConCliente {
    const moto = this.obtener(id)
    if (!moto.activo) throw solicitudInvalida(`La moto ${moto.placa} está desactivada`)
    return moto
  },

  /** Búsqueda exacta por placa: GET /api/motos/placa/ABC12D */
  buscarPorPlaca(texto: string): MotoConCliente {
    const placa = esquemaPlaca.parse(texto)
    const moto = motosRepositorio.buscarPorPlaca(placa)
    if (!moto) throw noEncontrado(`Moto con placa ${placa}`)
    return moto
  },

  crear(datos: DatosMoto): MotoConCliente {
    clientesServicio.obtenerActivo(datos.cliente_id) // el dueño debe existir
    const id = motosRepositorio.crear(datos, ahora())
    return this.obtener(id)
  },

  editar(id: number, datos: DatosMoto): MotoConCliente {
    this.obtener(id)
    clientesServicio.obtenerActivo(datos.cliente_id)
    motosRepositorio.actualizar(id, datos)
    return this.obtener(id)
  },

  /** Usado por ordenes al cerrar un mantenimiento */
  actualizarKm(id: number, km: number) {
    motosRepositorio.actualizarKm(id, km)
  },

  desactivar(id: number) {
    this.obtener(id)
    motosRepositorio.desactivar(id)
  },
}
