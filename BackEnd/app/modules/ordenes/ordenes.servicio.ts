// Reglas de las órdenes (ventas y mantenimientos)
import { db } from '../../db/conexion.js'
import { noEncontrado, solicitudInvalida } from '../../share/errores.js'
import { resumenCobro, valorBruto } from '../../share/utils/dinero.js'
import { ahora } from '../../share/utils/fechas.js'
import { clientesServicio } from '../clientes/clientes.servicio.js'
import { manoObraServicio } from '../mano-obra/mano-obra.servicio.js'
import { motosServicio } from '../motos/motos.servicio.js'
import { inventarioServicio } from '../inventario/inventario.servicio.js'
import { repuestosServicio } from '../repuestos/repuestos.servicio.js'
import { ordenesRepositorio, type NuevaLinea } from './ordenes.repositorio.js'
import type {
  DatosAgregarItem, DatosCrearOrden, DatosEditarItem, DatosEditarOrden,
} from './ordenes.esquemas.js'
import type { FiltrosOrdenes, OrdenConDatos, OrdenDetalle, OrdenItem, TipoOrden } from './ordenes.tipos.js'

// ---------- Funciones de apoyo (privadas del módulo) ----------

/** Solo las órdenes abiertas se pueden modificar */
function exigirAbierta(orden: OrdenConDatos) {
  if (orden.estado !== 'abierta') {
    throw solicitudInvalida(`La orden #${orden.id} está ${orden.estado} y ya no se puede modificar`)
  }
}

/** El descuento no puede ser mayor que el valor de la línea */
function validarDescuento(cantidad: number, precio: number, descuento: number) {
  const valor = valorBruto({ cantidad, precio_unitario: precio, descuento, cobrar: true })
  if (descuento > valor) {
    throw solicitudInvalida(`El descuento ($${descuento}) es mayor que el valor de la línea ($${valor})`)
  }
}

/** Verifica que haya stock para lo que se pide en la orden */
function validarStock(ordenId: number, repuestoId: number, cantidad: number, exceptoItemId = 0) {
  const repuesto = repuestosServicio.obtenerActivo(repuestoId)
  const yaEnOrden = ordenesRepositorio.cantidadEnOrden(ordenId, repuestoId, exceptoItemId)
  if (yaEnOrden + cantidad > repuesto.stock) {
    throw solicitudInvalida(
      `Stock insuficiente de "${repuesto.nombre}": hay ${repuesto.stock}` +
        (yaEnOrden ? `, ya hay ${yaEnOrden} en esta orden` : '') +
        ` y se piden ${cantidad}`,
    )
  }
  return repuesto
}

/** Revisa que cliente y moto existan y coincidan. Devuelve el cliente final. */
function resolverClienteYMoto(tipo: TipoOrden, clienteId: number | null, motoId: number | null) {
  if (motoId) {
    const moto = motosServicio.obtenerActiva(motoId)
    if (clienteId && clienteId !== moto.cliente_id) {
      throw solicitudInvalida(`La moto ${moto.placa} pertenece a otro cliente (${moto.cliente_nombre})`)
    }
    clienteId = moto.cliente_id // si no se indicó cliente, se toma el dueño de la moto
  } else if (tipo === 'mantenimiento') {
    throw solicitudInvalida('Un mantenimiento necesita una moto (moto_id)')
  }
  if (clienteId) clientesServicio.obtenerActivo(clienteId)
  return clienteId
}

// ---------- Servicio ----------

export const ordenesServicio = {
  listar(filtros: FiltrosOrdenes) {
    return ordenesRepositorio.listar(filtros)
  },

  mecanicos() {
    return ordenesRepositorio.mecanicos()
  },

  obtener(id: number): OrdenConDatos {
    const orden = ordenesRepositorio.buscarPorId(id)
    if (!orden) throw noEncontrado(`Orden #${id}`)
    return orden
  },

  /** Orden completa con líneas, totales, costo y ganancia */
  detalle(id: number): OrdenDetalle {
    const orden = this.obtener(id)
    const items = ordenesRepositorio.items(id)
    const cobro = resumenCobro(items)
    const costo = items.reduce((suma, i) => suma + Math.round(i.cantidad * i.costo_unitario), 0)
    return { ...orden, items, resumen: { ...cobro, costo, ganancia: cobro.total - costo } }
  },

  crear(datos: DatosCrearOrden): OrdenDetalle {
    const clienteId = resolverClienteYMoto(datos.tipo, datos.cliente_id, datos.moto_id)
    const id = ordenesRepositorio.crear({
      tipo: datos.tipo,
      cliente_id: clienteId,
      moto_id: datos.moto_id,
      km: datos.km,
      diagnostico: datos.diagnostico,
      notas: datos.notas,
      mecanico: datos.mecanico,
      fecha: ahora(),
    })
    return this.detalle(id)
  },

  editar(id: number, datos: DatosEditarOrden): OrdenDetalle {
    const orden = this.obtener(id)
    exigirAbierta(orden)
    const clienteId = resolverClienteYMoto(orden.tipo, datos.cliente_id, datos.moto_id)
    ordenesRepositorio.actualizar(id, { ...datos, cliente_id: clienteId })
    return this.detalle(id)
  },

  // ---------- Líneas ----------

  agregarItem(ordenId: number, datos: DatosAgregarItem): OrdenDetalle {
    exigirAbierta(this.obtener(ordenId))

    let linea: NuevaLinea

    if (datos.tipo === 'repuesto') {
      const repuesto = validarStock(ordenId, datos.repuesto_id, datos.cantidad)
      const precio = datos.precio_unitario ?? repuesto.precio_venta
      linea = {
        orden_id: ordenId, tipo: 'repuesto', repuesto_id: repuesto.id, mano_obra_id: null,
        descripcion: repuesto.nombre, cantidad: datos.cantidad,
        precio_estandar: repuesto.precio_venta, precio_unitario: precio,
        descuento: datos.descuento, cobrar: datos.cobrar ? 1 : 0, costo_unitario: repuesto.costo,
      }
    } else if (datos.tipo === 'mano_obra') {
      const trabajo = manoObraServicio.obtenerActiva(datos.mano_obra_id)
      const precio = datos.precio_unitario ?? trabajo.precio
      linea = {
        orden_id: ordenId, tipo: 'mano_obra', repuesto_id: null, mano_obra_id: trabajo.id,
        descripcion: trabajo.nombre, cantidad: datos.cantidad,
        precio_estandar: trabajo.precio, precio_unitario: precio,
        descuento: datos.descuento, cobrar: datos.cobrar ? 1 : 0, costo_unitario: 0,
      }
    } else {
      linea = {
        orden_id: ordenId, tipo: 'otro', repuesto_id: null, mano_obra_id: null,
        descripcion: datos.descripcion, cantidad: datos.cantidad,
        precio_estandar: datos.precio_unitario, precio_unitario: datos.precio_unitario,
        descuento: datos.descuento, cobrar: datos.cobrar ? 1 : 0, costo_unitario: datos.costo_unitario,
      }
    }

    validarDescuento(linea.cantidad, linea.precio_unitario, linea.descuento)
    ordenesRepositorio.agregarItem(linea)
    return this.detalle(ordenId)
  },

  editarItem(ordenId: number, itemId: number, datos: DatosEditarItem): OrdenDetalle {
    exigirAbierta(this.obtener(ordenId))
    const actual = this.obtenerItem(ordenId, itemId)

    const nuevo = {
      descripcion: datos.descripcion ?? actual.descripcion,
      cantidad: datos.cantidad ?? actual.cantidad,
      precio_unitario: datos.precio_unitario ?? actual.precio_unitario,
      descuento: datos.descuento ?? actual.descuento,
      cobrar: datos.cobrar === undefined ? actual.cobrar : datos.cobrar ? 1 : 0,
    }

    if (actual.tipo === 'repuesto' && actual.repuesto_id && nuevo.cantidad !== actual.cantidad) {
      validarStock(ordenId, actual.repuesto_id, nuevo.cantidad, itemId)
    }
    validarDescuento(nuevo.cantidad, nuevo.precio_unitario, nuevo.descuento)

    ordenesRepositorio.actualizarItem(itemId, nuevo)
    return this.detalle(ordenId)
  },

  eliminarItem(ordenId: number, itemId: number): OrdenDetalle {
    exigirAbierta(this.obtener(ordenId))
    this.obtenerItem(ordenId, itemId)
    ordenesRepositorio.eliminarItem(itemId)
    return this.detalle(ordenId)
  },

  obtenerItem(ordenId: number, itemId: number): OrdenItem {
    const item = ordenesRepositorio.buscarItem(itemId)
    if (!item || item.orden_id !== ordenId) throw noEncontrado(`Línea ${itemId} en la orden #${ordenId}`)
    return item
  },

  // ---------- Cambios de estado ----------

  /** Cierra la orden: descuenta el stock y la deja lista para cobrar/entregar */
  cerrar(id: number): OrdenDetalle {
    const orden = this.obtener(id)
    exigirAbierta(orden)
    const items = ordenesRepositorio.items(id)
    if (items.length === 0) throw solicitudInvalida('No se puede cerrar una orden sin líneas')

    // Todo dentro de una transacción: si un repuesto no alcanza, no se guarda nada
    db.transaction(() => {
      for (const item of items) {
        if (item.tipo !== 'repuesto' || !item.repuesto_id) continue
        const repuesto = repuestosServicio.obtener(item.repuesto_id)
        ordenesRepositorio.fijarCostoItem(item.id, repuesto.costo) // costo vigente al cerrar
        inventarioServicio.registrarSalida(item.repuesto_id, item.cantidad, id)
      }
      ordenesRepositorio.cerrar(id, ahora())
      if (orden.moto_id && orden.km) motosServicio.actualizarKm(orden.moto_id, orden.km)
    })()

    return this.detalle(id)
  },

  /** Anula la orden. Si ya estaba cerrada, devuelve los repuestos al inventario. */
  anular(id: number, motivo: string): OrdenDetalle {
    const orden = this.obtener(id)
    if (orden.estado === 'anulada') throw solicitudInvalida(`La orden #${id} ya está anulada`)
    if (orden.estado === 'entregada') {
      throw solicitudInvalida(`La orden #${id} ya fue entregada y firmada; no se puede anular`)
    }

    db.transaction(() => {
      if (orden.estado === 'cerrada') {
        for (const item of ordenesRepositorio.items(id)) {
          if (item.tipo === 'repuesto' && item.repuesto_id) {
            inventarioServicio.registrarDevolucion(item.repuesto_id, item.cantidad, id)
          }
        }
      }
      ordenesRepositorio.anular(id, ahora(), motivo)
    })()

    return this.detalle(id)
  },

  /** Usado por el módulo entregas cuando el cliente firma */
  marcarEntregada(id: number) {
    const orden = this.obtener(id)
    if (orden.estado !== 'cerrada') {
      throw solicitudInvalida(`Solo se entregan órdenes cerradas. La orden #${id} está ${orden.estado}`)
    }
    ordenesRepositorio.marcarEntregada(id)
  },
}
