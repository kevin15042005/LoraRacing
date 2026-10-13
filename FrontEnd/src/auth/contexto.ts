// El "contexto" deja la sesión disponible en cualquier pantalla con useSesion()
import { createContext, useContext } from 'react'
import type { RespuestaLogin, Usuario } from '../api/tipos'

export interface Sesion {
  usuario: Usuario | null
  cargando: boolean
  /** Guarda el token después de login o registro */
  iniciar: (respuesta: RespuestaLogin) => void
  salir: () => Promise<void>
}

export const ContextoSesion = createContext<Sesion | null>(null)

export function useSesion(): Sesion {
  const sesion = useContext(ContextoSesion)
  if (!sesion) throw new Error('useSesion debe usarse dentro de <ProveedorSesion>')
  return sesion
}
