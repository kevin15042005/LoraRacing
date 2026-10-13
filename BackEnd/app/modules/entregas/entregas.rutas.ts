// Direcciones del módulo entregas (todas empiezan por /api/entregas)
import { Router } from 'express'
import { validar } from '../../share/middleware/validar.js'
import { entregasControlador as c } from './entregas.controlador.js'
import { esquemaEntrega } from './entregas.esquemas.js'

export const entregasRutas = Router()

entregasRutas.get('/', c.listar)                                // últimas entregas
entregasRutas.post('/', validar(esquemaEntrega), c.registrar)   // registrar entrega con firma
entregasRutas.get('/orden/:ordenId', c.comprobante)             // datos del comprobante
entregasRutas.get('/orden/:ordenId/firma', c.firma)             // imagen PNG de la firma
