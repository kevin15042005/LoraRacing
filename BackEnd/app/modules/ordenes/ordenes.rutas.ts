// Direcciones del módulo ordenes (todas empiezan por /api/ordenes)
import { Router } from 'express'
import { validar } from '../../share/middleware/validar.js'
import { ordenesControlador as c } from './ordenes.controlador.js'
import {
  esquemaAgregarItem, esquemaAnular, esquemaCrearOrden, esquemaEditarItem, esquemaEditarOrden,
} from './ordenes.esquemas.js'

export const ordenesRutas = Router()

ordenesRutas.get('/', c.listar)            // ?estado= &tipo= &cliente_id= &moto_id= &desde= &hasta= &q= &mecanico=
ordenesRutas.get('/mecanicos', c.mecanicos)  // nombres usados (va ANTES de /:id)
ordenesRutas.get('/:id', c.detalle)        // orden + líneas + totales + ganancia
ordenesRutas.post('/', validar(esquemaCrearOrden), c.crear)
ordenesRutas.put('/:id', validar(esquemaEditarOrden), c.editar)

// Líneas de la orden
ordenesRutas.post('/:id/items', validar(esquemaAgregarItem), c.agregarItem)
ordenesRutas.put('/:id/items/:itemId', validar(esquemaEditarItem), c.editarItem)
ordenesRutas.delete('/:id/items/:itemId', c.eliminarItem)

// Cambios de estado
ordenesRutas.post('/:id/cerrar', c.cerrar)                          // descuenta stock
ordenesRutas.post('/:id/anular', validar(esquemaAnular), c.anular)  // devuelve stock si estaba cerrada
