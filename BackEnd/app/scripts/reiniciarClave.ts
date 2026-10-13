// =============================================================
// scripts/reiniciarClave.ts
// Para cuando se olvida la contraseña: borra el usuario administrador
// y sus sesiones. NO toca inventario, órdenes, clientes ni nada más.
// Al abrir la app, pedirá crear el administrador de nuevo.
// Uso: pnpm reiniciar-clave
// =============================================================
import { db } from '../db/conexion.js'
import { migrar } from '../db/migrar.js'

migrar()

const borrado = db.transaction(() => {
  db.prepare('DELETE FROM sesiones').run()
  return db.prepare('DELETE FROM usuarios').run().changes
})()

db.close()
console.log('')
console.log(borrado > 0 ? '  Listo: se borró el usuario administrador.' : '  No había ningún usuario creado.')
console.log('  Abre la app y crea el usuario y la contraseña de nuevo.')
console.log('  Los datos del taller (inventario, órdenes, clientes) siguen intactos.')
console.log('')
