// Direcciones del módulo respaldos (todas empiezan por /api/respaldos)
import { Router } from 'express'
import { respaldosControlador as c } from './respaldos.controlador.js'

export const respaldosRutas = Router()

respaldosRutas.get('/', c.listar)               // lista de copias
respaldosRutas.post('/', c.crear)               // crear copia ahora
respaldosRutas.get('/:archivo', c.descargar)    // descargar una copia
