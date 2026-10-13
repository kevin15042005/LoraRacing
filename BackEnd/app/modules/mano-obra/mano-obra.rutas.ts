// Direcciones del módulo mano de obra (todas empiezan por /api/mano-obra)
import { Router } from 'express'
import { validar } from '../../share/middleware/validar.js'
import { manoObraControlador as c } from './mano-obra.controlador.js'
import { esquemaManoObra } from './mano-obra.esquemas.js'

export const manoObraRutas = Router()

manoObraRutas.get('/', c.listar)          // ?q=aceite
manoObraRutas.get('/:id', c.obtener)
manoObraRutas.post('/', validar(esquemaManoObra), c.crear)
manoObraRutas.put('/:id', validar(esquemaManoObra), c.editar)
manoObraRutas.delete('/:id', c.desactivar)
