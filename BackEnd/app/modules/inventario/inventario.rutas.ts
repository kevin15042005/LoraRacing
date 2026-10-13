// Direcciones del inventario. Se montan en /api/repuestos porque
// cada movimiento pertenece a un repuesto: /api/repuestos/5/entrada
import { Router } from 'express'
import { validar } from '../../share/middleware/validar.js'
import { inventarioControlador as c } from './inventario.controlador.js'
import { esquemaAjuste, esquemaEntrada } from './inventario.esquemas.js'

export const inventarioRutas = Router()

inventarioRutas.get('/:id/movimientos', c.historial)                     // historial
inventarioRutas.post('/:id/entrada', validar(esquemaEntrada), c.entrada) // compra
inventarioRutas.post('/:id/ajuste', validar(esquemaAjuste), c.ajuste)    // conteo físico
