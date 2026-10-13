// Direcciones del módulo motos (todas empiezan por /api/motos)
import { Router } from 'express'
import { validar } from '../../share/middleware/validar.js'
import { motosControlador as c } from './motos.controlador.js'
import { esquemaMoto } from './motos.esquemas.js'

export const motosRutas = Router()

motosRutas.get('/', c.listar)                 // ?q=ABC  (placa, marca, modelo o dueño)
motosRutas.get('/placa/:placa', c.porPlaca)   // búsqueda exacta por placa
motosRutas.get('/:id', c.obtener)
motosRutas.post('/', validar(esquemaMoto), c.crear)
motosRutas.put('/:id', validar(esquemaMoto), c.editar)
motosRutas.delete('/:id', c.desactivar)
