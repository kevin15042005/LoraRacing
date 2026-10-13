// =============================================================
// server.ts
// Enciende el servidor: aplica migraciones, programa respaldos
// y muestra las direcciones para entrar desde el PC y el celular.
// =============================================================
import os from 'node:os'
import { app } from './app.js'
import { config } from './config/env.js'
import { db } from './db/conexion.js'
import { migrar } from './db/migrar.js'
import { respaldosServicio } from './modules/respaldos/respaldos.servicio.js'

// 1. Crea o actualiza las tablas
migrar()

// 2. Respaldo automático diario
respaldosServicio.programarAutomatico()

// 3. Direcciones de este PC en la red Wi-Fi (para conectar el celular)
function direccionesRed(): string[] {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(i => i && i.family === 'IPv4' && !i.internal)
    .map(i => `http://${i!.address}:${config.puerto}`)
}

// 4. Encender
const servidor = app.listen(config.puerto, '0.0.0.0', () => {
  console.log('')
  console.log('  Taller LoraRacing - servidor listo')
  console.log(`  En este PC:      http://localhost:${config.puerto}`)
  for (const dir of direccionesRed()) console.log(`  Desde el celular: ${dir}`)
  console.log('')
})

// 5. Apagar ordenadamente con Ctrl + C
process.on('SIGINT', () => {
  servidor.close()
  db.close()
  console.log('Servidor apagado')
  process.exit(0)
})
