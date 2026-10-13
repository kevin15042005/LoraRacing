// =============================================================
// app.ts
// Arma la aplicación: registra los módulos y los middlewares.
// No enciende nada (eso lo hace server.ts).
// =============================================================
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { config } from './config/env.js'
import { manejarErrores, rutaNoEncontrada } from './share/middleware/manejarErrores.js'
import { requiereSesion } from './share/middleware/requiereSesion.js'
import { ahora } from './share/utils/fechas.js'

import { authRutas } from './modules/auth/auth.rutas.js'
import { clientesRutas } from './modules/clientes/clientes.rutas.js'
import { entregasRutas } from './modules/entregas/entregas.rutas.js'
import { inventarioRutas } from './modules/inventario/inventario.rutas.js'
import { manoObraRutas } from './modules/mano-obra/mano-obra.rutas.js'
import { motosRutas } from './modules/motos/motos.rutas.js'
import { ordenesRutas } from './modules/ordenes/ordenes.rutas.js'
import { reportesRutas } from './modules/reportes/reportes.rutas.js'
import { repuestosRutas } from './modules/repuestos/repuestos.rutas.js'
import { respaldosRutas } from './modules/respaldos/respaldos.rutas.js'

export const app = express()

// Entiende JSON (2 MB de límite para que quepan las firmas)
app.use(express.json({ limit: '2mb' }))

// ---------- Rutas públicas ----------
app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok', mensaje: 'El servidor del taller está funcionando', hora: ahora() })
})
app.use('/api/auth', authRutas)

// ---------- Desde aquí, todo /api necesita sesión ----------
app.use('/api', requiereSesion)

app.use('/api/repuestos', repuestosRutas)
app.use('/api/repuestos', inventarioRutas) // /:id/entrada, /:id/ajuste, /:id/movimientos
app.use('/api/mano-obra', manoObraRutas)
app.use('/api/clientes', clientesRutas)
app.use('/api/motos', motosRutas)
app.use('/api/ordenes', ordenesRutas)
app.use('/api/entregas', entregasRutas)
app.use('/api/reportes', reportesRutas)
app.use('/api/respaldos', respaldosRutas)

// Cualquier otra dirección /api que no exista
app.use('/api', rutaNoEncontrada)

// ---------- App web (FrontEnd compilado), si existe ----------
if (fs.existsSync(config.carpetaFrontEnd)) {
  app.use(express.static(config.carpetaFrontEnd))
  // Cualquier dirección que no sea /api muestra la app (para que funcione React Router)
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(config.carpetaFrontEnd, 'index.html'))
  })
}

// ---------- Manejo de errores (siempre al final) ----------
app.use(manejarErrores)
