// Direcciones del módulo auth (todas empiezan por /api/auth)
import { Router } from 'express'
import { requiereSesion } from '../../share/middleware/requiereSesion.js'
import { validar } from '../../share/middleware/validar.js'
import { authControlador } from './auth.controlador.js'
import { esquemaCambiarClave, esquemaCambiarPin, esquemaLogin, esquemaRecuperar, esquemaRegistro } from './auth.esquemas.js'

export const authRutas = Router()

// Públicas (no necesitan sesión)
authRutas.get('/estado', authControlador.estado)                                  // ¿falta crear el admin?
authRutas.post('/registro', validar(esquemaRegistro), authControlador.registro)   // crear el primer admin
authRutas.post('/login', validar(esquemaLogin), authControlador.login)            // iniciar sesión
authRutas.post('/recuperar', validar(esquemaRecuperar), authControlador.recuperar) // olvidé la contraseña (con PIN)

// Protegidas (necesitan sesión)
authRutas.post('/logout', requiereSesion, authControlador.logout)
authRutas.get('/yo', requiereSesion, authControlador.yo)
authRutas.put('/clave', requiereSesion, validar(esquemaCambiarClave), authControlador.cambiarClave)
authRutas.put('/pin', requiereSesion, validar(esquemaCambiarPin), authControlador.cambiarPin) // crear o cambiar el PIN
