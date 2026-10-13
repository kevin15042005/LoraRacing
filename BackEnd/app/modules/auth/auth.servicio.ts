// Reglas del inicio de sesión y del PIN de recuperación
import crypto from 'node:crypto'
import { config } from '../../config/env.js'
import { db } from '../../db/conexion.js'
import { conflicto, ErrorApp, noAutorizado, noEncontrado, solicitudInvalida } from '../../share/errores.js'
import { ahora, sumarDias, sumarMinutos } from '../../share/utils/fechas.js'
import { authRepositorio } from './auth.repositorio.js'
import type { DatosCambiarClave, DatosCambiarPin, DatosLogin, DatosRecuperar, DatosRegistro } from './auth.esquemas.js'
import type { RespuestaLogin, Usuario, UsuarioConClave } from './auth.tipos.js'

const MAX_INTENTOS_PIN = 5 // después de 5 PIN incorrectos...
const MINUTOS_BLOQUEO = 15 // ...se bloquea la recuperación 15 minutos

/** Cifra la contraseña (o el PIN) con scrypt (incluido en Node, no necesita librerías) */
function cifrar(clave: string, sal: string): string {
  return crypto.scryptSync(clave, sal, 64).toString('hex')
}

/** Compara un texto con su versión cifrada sin revelar información por el tiempo de respuesta */
function coincide(texto: string, hash: string, sal: string): boolean {
  const calculado = Buffer.from(cifrar(texto, sal), 'hex')
  const guardado = Buffer.from(hash, 'hex')
  return calculado.length === guardado.length && crypto.timingSafeEqual(calculado, guardado)
}

const claveCorrecta = (clave: string, u: UsuarioConClave) => coincide(clave, u.hash, u.sal)
const pinCorrecto = (pin: string, u: UsuarioConClave) => !!u.pin_hash && !!u.pin_sal && coincide(pin, u.pin_hash, u.pin_sal)

/** Quita los campos secretos antes de devolver el usuario */
function sinClave(u: UsuarioConClave): Usuario {
  return { id: u.id, usuario: u.usuario, nombre: u.nombre, creado_en: u.creado_en, tiene_pin: !!u.pin_hash }
}

function iniciarSesion(usuario: UsuarioConClave): RespuestaLogin {
  const token = crypto.randomBytes(32).toString('hex')
  const creada = ahora()
  const expira = sumarDias(creada, config.diasSesion)
  authRepositorio.crearSesion(token, usuario.id, creada, expira)
  return { token, expira_en: expira, usuario: sinClave(usuario) }
}

/** Guarda el PIN que eligió el usuario (cifrado, igual que la contraseña) */
function guardarPin(usuarioId: number, pin: string) {
  const sal = crypto.randomBytes(16).toString('hex')
  authRepositorio.guardarPin(usuarioId, cifrar(pin, sal), sal)
}

/** ¿El texto es la contraseña actual o el PIN actual? */
function confirmaIdentidad(texto: string, usuario: UsuarioConClave): boolean {
  const comoPin = texto.replace(/[\s-]/g, '')
  return claveCorrecta(texto, usuario) || (/^\d{4,8}$/.test(comoPin) && pinCorrecto(comoPin, usuario))
}

function guardarClave(usuarioId: number, claveNueva: string) {
  const sal = crypto.randomBytes(16).toString('hex')
  authRepositorio.actualizarClave(usuarioId, cifrar(claveNueva, sal), sal)
}

export const authServicio = {
  /** Indica si todavía hay que crear el primer usuario */
  estado() {
    return { necesitaRegistro: authRepositorio.contarUsuarios() === 0 }
  },

  /** Crea el primer y único administrador, con el PIN de recuperación que él elige */
  registrarInicial(datos: DatosRegistro): RespuestaLogin {
    if (authRepositorio.contarUsuarios() > 0) {
      throw conflicto('El administrador ya fue creado. Inicia sesión.')
    }
    return db.transaction(() => {
      const sal = crypto.randomBytes(16).toString('hex')
      const id = authRepositorio.crear({
        usuario: datos.usuario,
        nombre: datos.nombre,
        hash: cifrar(datos.clave, sal),
        sal,
        creado_en: ahora(),
      })
      guardarPin(id, datos.pin)
      return iniciarSesion(authRepositorio.buscarPorId(id)!)
    })()
  },

  login(datos: DatosLogin): RespuestaLogin {
    const usuario = authRepositorio.buscarPorUsuario(datos.usuario)
    // Mismo mensaje si el usuario no existe o la clave está mal (más seguro)
    if (!usuario || !claveCorrecta(datos.clave, usuario)) {
      throw noAutorizado('Usuario o contraseña incorrectos')
    }
    authRepositorio.borrarSesionesVencidas(ahora())
    return iniciarSesion(usuario)
  },

  /**
   * Olvidé la contraseña: con el usuario y su PIN se crea una contraseña nueva.
   * El PIN sigue siendo el mismo. Se cierran las sesiones de todos los aparatos.
   */
  recuperar(datos: DatosRecuperar): RespuestaLogin {
    const usuario = authRepositorio.buscarPorUsuario(datos.usuario)
    if (!usuario) throw noAutorizado('Usuario o PIN incorrectos')

    const momento = ahora()
    if (usuario.bloqueado_hasta && usuario.bloqueado_hasta > momento) {
      throw new ErrorApp(429, `Demasiados intentos con PIN incorrecto. Espera hasta las ${usuario.bloqueado_hasta.slice(11, 16)} e intenta de nuevo.`)
    }
    if (usuario.bloqueado_hasta) authRepositorio.reiniciarIntentosPin(usuario.id) // el bloqueo ya pasó

    if (!usuario.pin_hash) {
      throw solicitudInvalida('Este usuario no tiene PIN de recuperación. En el PC del taller usa "Olvide la clave.bat".')
    }
    if (!pinCorrecto(datos.pin, usuario)) {
      authRepositorio.registrarFalloPin(usuario.id, MAX_INTENTOS_PIN, sumarMinutos(momento, MINUTOS_BLOQUEO))
      const restantes = MAX_INTENTOS_PIN - (usuario.bloqueado_hasta ? 0 : usuario.intentos_pin) - 1
      throw noAutorizado(
        restantes > 0
          ? `Usuario o PIN incorrectos. ${restantes === 1 ? 'Te queda 1 intento' : `Te quedan ${restantes} intentos`}.`
          : `PIN incorrecto. La recuperación queda bloqueada ${MINUTOS_BLOQUEO} minutos.`,
      )
    }

    return db.transaction(() => {
      guardarClave(usuario.id, datos.claveNueva)
      authRepositorio.borrarSesionesDeUsuario(usuario.id, '') // cierra la sesión en todos los aparatos
      authRepositorio.reiniciarIntentosPin(usuario.id)
      return iniciarSesion(usuario)
    })()
  },

  /** Crear o cambiar el PIN desde Mi cuenta (se confirma con la contraseña o el PIN actual) */
  cambiarPin(usuarioId: number, datos: DatosCambiarPin) {
    const usuario = authRepositorio.buscarPorId(usuarioId)
    if (!usuario) throw noEncontrado('Usuario')
    if (!confirmaIdentidad(datos.claveActual, usuario)) {
      // 400 y no 401: un 401 haría que la app crea que la sesión venció y te saque
      throw solicitudInvalida('La contraseña actual no es correcta')
    }
    guardarPin(usuarioId, datos.pinNuevo)
  },

  /** Usado por el middleware requiereSesion */
  validarToken(token: string): Usuario {
    const usuario = authRepositorio.usuarioDeSesion(token, ahora())
    if (!usuario) throw noAutorizado('La sesión no existe o venció. Inicia sesión de nuevo.')
    return usuario
  },

  logout(token: string) {
    authRepositorio.borrarSesion(token)
  },

  /**
   * Cambia la contraseña. Se puede confirmar con la contraseña actual o con el PIN.
   * Cierra las sesiones de los otros dispositivos.
   */
  cambiarClave(usuarioId: number, tokenActual: string, datos: DatosCambiarClave) {
    const usuario = authRepositorio.buscarPorId(usuarioId)
    if (!usuario) throw noEncontrado('Usuario')
    if (!confirmaIdentidad(datos.claveActual, usuario)) {
      // 400 y no 401: un 401 haría que la app crea que la sesión venció y te saque
      throw solicitudInvalida('La contraseña actual o el PIN no son correctos')
    }
    guardarClave(usuarioId, datos.claveNueva)
    authRepositorio.borrarSesionesDeUsuario(usuarioId, tokenActual)
  },
}
