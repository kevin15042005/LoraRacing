// Único lugar del módulo auth que escribe SQL
import { db } from '../../db/conexion.js'
import type { Usuario, UsuarioConClave } from './auth.tipos.js'

export const authRepositorio = {
  contarUsuarios(): number {
    const fila = db.prepare('SELECT COUNT(*) AS total FROM usuarios').get() as { total: number }
    return fila.total
  },

  buscarPorUsuario(usuario: string): UsuarioConClave | undefined {
    return db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario) as UsuarioConClave | undefined
  },

  buscarPorId(id: number): UsuarioConClave | undefined {
    return db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id) as UsuarioConClave | undefined
  },

  crear(datos: { usuario: string; nombre: string; hash: string; sal: string; creado_en: string }): number {
    const r = db
      .prepare(`INSERT INTO usuarios (usuario, nombre, hash, sal, creado_en)
                VALUES (@usuario, @nombre, @hash, @sal, @creado_en)`)
      .run(datos)
    return Number(r.lastInsertRowid)
  },

  actualizarClave(id: number, hash: string, sal: string) {
    db.prepare('UPDATE usuarios SET hash = ?, sal = ? WHERE id = ?').run(hash, sal, id)
  },

  // ---- PIN de recuperación ----

  /** Guarda un PIN nuevo y borra los intentos fallidos */
  guardarPin(id: number, pinHash: string, pinSal: string) {
    db.prepare(`UPDATE usuarios SET pin_hash = ?, pin_sal = ?, intentos_pin = 0, bloqueado_hasta = NULL
                WHERE id = ?`)
      .run(pinHash, pinSal, id)
  },

  /** Suma un intento fallido; si se pasa del límite, bloquea hasta la fecha indicada */
  registrarFalloPin(id: number, maxIntentos: number, bloquearHasta: string) {
    db.prepare(`UPDATE usuarios SET
                  intentos_pin = intentos_pin + 1,
                  bloqueado_hasta = CASE WHEN intentos_pin + 1 >= ? THEN ? ELSE bloqueado_hasta END
                WHERE id = ?`)
      .run(maxIntentos, bloquearHasta, id)
  },

  /** Después de un bloqueo, se vuelve a contar desde cero */
  reiniciarIntentosPin(id: number) {
    db.prepare('UPDATE usuarios SET intentos_pin = 0, bloqueado_hasta = NULL WHERE id = ?').run(id)
  },

  // ---- Sesiones ----

  crearSesion(token: string, usuarioId: number, creadaEn: string, expiraEn: string) {
    db.prepare('INSERT INTO sesiones (token, usuario_id, creada_en, expira_en) VALUES (?, ?, ?, ?)')
      .run(token, usuarioId, creadaEn, expiraEn)
  },

  /** Devuelve el usuario dueño del token si la sesión no ha vencido */
  usuarioDeSesion(token: string, ahora: string): Usuario | undefined {
    const fila = db
      .prepare(`SELECT u.id, u.usuario, u.nombre, u.creado_en, (u.pin_hash IS NOT NULL) AS tiene_pin
                FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
                WHERE s.token = ? AND s.expira_en > ?`)
      .get(token, ahora) as (Omit<Usuario, 'tiene_pin'> & { tiene_pin: number }) | undefined
    return fila && { ...fila, tiene_pin: fila.tiene_pin === 1 }
  },

  borrarSesion(token: string) {
    db.prepare('DELETE FROM sesiones WHERE token = ?').run(token)
  },

  /** Cierra las sesiones del usuario en los otros dispositivos ('' = en todos) */
  borrarSesionesDeUsuario(usuarioId: number, exceptoToken: string) {
    db.prepare('DELETE FROM sesiones WHERE usuario_id = ? AND token <> ?').run(usuarioId, exceptoToken)
  },

  borrarSesionesVencidas(ahora: string) {
    db.prepare('DELETE FROM sesiones WHERE expira_en <= ?').run(ahora)
  },
}
