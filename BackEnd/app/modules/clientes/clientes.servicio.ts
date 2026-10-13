// Reglas de clientes
import { noEncontrado, solicitudInvalida } from '../../share/errores.js'
import { ahora } from '../../share/utils/fechas.js'
import { motosServicio } from '../motos/motos.servicio.js'
import { clientesRepositorio } from './clientes.repositorio.js'
import type { DatosCliente } from './clientes.esquemas.js'
import type { Cliente, ClienteDetalle } from './clientes.tipos.js'

export const clientesServicio = {
  listar(q?: string) {
    return clientesRepositorio.listar(q)
  },

  obtener(id: number): Cliente {
    const cliente = clientesRepositorio.buscarPorId(id)
    if (!cliente) throw noEncontrado('Cliente')
    return cliente
  },

  obtenerActivo(id: number): Cliente {
    const cliente = this.obtener(id)
    if (!cliente.activo) throw solicitudInvalida(`El cliente "${cliente.nombre}" está desactivado`)
    return cliente
  },

  /** Cliente con todas sus motos */
  detalle(id: number): ClienteDetalle {
    const cliente = this.obtener(id)
    return { ...cliente, motos: motosServicio.listarPorCliente(id) }
  },

  crear(datos: DatosCliente): ClienteDetalle {
    const id = clientesRepositorio.crear(datos, ahora())
    return this.detalle(id)
  },

  editar(id: number, datos: DatosCliente): ClienteDetalle {
    this.obtener(id)
    clientesRepositorio.actualizar(id, datos)
    return this.detalle(id)
  },

  desactivar(id: number) {
    this.obtener(id)
    clientesRepositorio.desactivar(id)
  },
}
