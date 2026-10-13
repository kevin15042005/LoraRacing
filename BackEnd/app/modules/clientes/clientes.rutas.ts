// Direcciones del módulo clientes (todas empiezan por /api/clientes)
import { Router } from 'express'
import { validar } from '../../share/middleware/validar.js'
import { clientesControlador as c } from './clientes.controlador.js'
import { esquemaCliente } from './clientes.esquemas.js'

export const clientesRutas = Router()

clientesRutas.get('/', c.listar)          // ?q=juan  (también busca por placa)
clientesRutas.get('/:id', c.detalle)      // cliente + sus motos
clientesRutas.post('/', validar(esquemaCliente), c.crear)
clientesRutas.put('/:id', validar(esquemaCliente), c.editar)
clientesRutas.delete('/:id', c.desactivar)
