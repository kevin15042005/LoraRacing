// Direcciones del módulo repuestos (todas empiezan por /api/repuestos)
import { Router } from 'express'
import { validar } from '../../share/middleware/validar.js'
import { repuestosControlador as c } from './repuestos.controlador.js'
import { esquemaCrearRepuesto, esquemaEditarRepuesto } from './repuestos.esquemas.js'

export const repuestosRutas = Router()

// Las rutas fijas (/alertas, /categorias) van ANTES de /:id
repuestosRutas.get('/', c.listar)                       // lista con filtros ?q= &estado= &categoria=
repuestosRutas.get('/alertas', c.alertas)               // agotados y por agotarse
repuestosRutas.get('/categorias', c.categorias)         // categorías usadas
repuestosRutas.get('/:id', c.obtener)

repuestosRutas.post('/', validar(esquemaCrearRepuesto), c.crear)
repuestosRutas.put('/:id', validar(esquemaEditarRepuesto), c.editar)
repuestosRutas.delete('/:id', c.desactivar)

// Movimientos de stock (/:id/entrada, /:id/ajuste, /:id/movimientos): ver módulo inventario
