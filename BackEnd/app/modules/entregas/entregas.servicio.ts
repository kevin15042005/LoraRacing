// Reglas de la entrega con firma del cliente
import fs from 'node:fs'
import path from 'node:path'
import { config } from '../../config/env.js'
import { db } from '../../db/conexion.js'
import { conflicto, noEncontrado, solicitudInvalida } from '../../share/errores.js'
import { ahora } from '../../share/utils/fechas.js'
import { motosServicio } from '../motos/motos.servicio.js'
import { ordenesServicio } from '../ordenes/ordenes.servicio.js'
import { entregasRepositorio } from './entregas.repositorio.js'
import { PREFIJO_PNG, type DatosEntrega } from './entregas.esquemas.js'
import type { Comprobante, Entrega } from './entregas.tipos.js'

const TAMANO_MAXIMO = 1024 * 1024 // 1 MB por firma
const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]) // los primeros bytes de todo PNG

/** Convierte el texto base64 en imagen y verifica que de verdad sea un PNG */
function decodificarFirma(texto: string): Buffer {
  const imagen = Buffer.from(texto.slice(PREFIJO_PNG.length), 'base64')
  if (imagen.length < 100 || !imagen.subarray(0, 4).equals(FIRMA_PNG)) {
    throw solicitudInvalida('La firma no es una imagen PNG válida')
  }
  if (imagen.length > TAMANO_MAXIMO) {
    throw solicitudInvalida('La imagen de la firma es demasiado grande (máximo 1 MB)')
  }
  return imagen
}

export const entregasServicio = {
  listar() {
    return entregasRepositorio.listar()
  },

  obtenerPorOrden(ordenId: number): Entrega {
    const entrega = entregasRepositorio.buscarPorOrden(ordenId)
    if (!entrega) throw noEncontrado(`Entrega de la orden #${ordenId}`)
    return entrega
  },

  /** Registra la entrega: guarda la firma, la constancia y marca la orden como entregada */
  registrar(datos: DatosEntrega): Comprobante {
    const orden = ordenesServicio.obtener(datos.orden_id)
    if (entregasRepositorio.buscarPorOrden(orden.id)) {
      throw conflicto(`La orden #${orden.id} ya tiene una entrega registrada`)
    }
    if (orden.estado !== 'cerrada') {
      throw solicitudInvalida(`Primero cierra la orden #${orden.id}. Ahora está ${orden.estado}.`)
    }

    const imagen = decodificarFirma(datos.firma)
    const fecha = ahora()
    const archivo = `orden-${orden.id}-${fecha.replace(/[-: ]/g, '')}.png`
    const ruta = path.join(config.carpetaFirmas, archivo)

    // 1. Guardar la imagen en datos/firmas
    fs.writeFileSync(ruta, imagen)

    try {
      // 2. Guardar la constancia y cambiar el estado, todo junto
      db.transaction(() => {
        entregasRepositorio.crear({
          orden_id: orden.id,
          recibe_nombre: datos.recibe_nombre,
          recibe_documento: datos.recibe_documento,
          km_entrega: datos.km_entrega,
          observaciones: datos.observaciones,
          firma_archivo: archivo,
          fecha,
        })
        ordenesServicio.marcarEntregada(orden.id)
        if (orden.moto_id && datos.km_entrega) motosServicio.actualizarKm(orden.moto_id, datos.km_entrega)
      })()
    } catch (error) {
      // Si falló la base de datos, se borra la imagen para no dejar basura
      fs.rmSync(ruta, { force: true })
      throw error
    }

    return this.comprobante(orden.id)
  },

  /** Datos completos para mostrar o imprimir el comprobante */
  comprobante(ordenId: number): Comprobante {
    const entrega = this.obtenerPorOrden(ordenId)
    return {
      entrega,
      orden: ordenesServicio.detalle(ordenId),
      firma_url: `/api/entregas/orden/${ordenId}/firma`,
    }
  },

  /** Ruta del archivo PNG de la firma */
  rutaFirma(ordenId: number): string {
    const entrega = this.obtenerPorOrden(ordenId)
    const ruta = path.join(config.carpetaFirmas, entrega.firma_archivo)
    if (!fs.existsSync(ruta)) throw noEncontrado('Archivo de la firma')
    return ruta
  },
}
