// Direcciones del módulo reportes (todas empiezan por /api/reportes)
import { Router } from 'express'
import { reportesControlador as c } from './reportes.controlador.js'

export const reportesRutas = Router()

reportesRutas.get('/resumen', c.resumen)                         // pantalla de inicio
reportesRutas.get('/quincena-actual', c.quincenaActual)          // ganancia de la quincena en curso
reportesRutas.get('/quincenas', c.quincenas)                     // ?meses=6
reportesRutas.get('/ganancia', c.ganancia)                       // ?desde=2026-10-01&hasta=2026-10-15
reportesRutas.get('/repuestos-mas-usados', c.repuestosMasUsados) // ?desde= &hasta= &limite=10
reportesRutas.get('/stock', c.stock)                             // conteo por estado + alertas
