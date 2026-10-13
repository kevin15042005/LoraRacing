import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { api, cuandoSePierdaLaSesion, token } from '../api/cliente'
import type { RespuestaLogin, Usuario } from '../api/tipos'
import { Cargando } from '../componentes/ui'
import { ContextoSesion, useSesion } from './contexto'

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  // Si hay un token guardado, hay que preguntarle al servidor si sigue siendo válido
  const [cargando, setCargando] = useState(() => token.leer() !== null)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Si el servidor responde 401 en cualquier pantalla, se vuelve al login
    cuandoSePierdaLaSesion(() => {
      setUsuario(null)
      queryClient.clear()
    })

    if (!token.leer()) return
    api
      .get<Usuario>('/auth/yo')
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false))
  }, [queryClient])

  function iniciar(respuesta: RespuestaLogin) {
    token.guardar(respuesta.token)
    setUsuario(respuesta.usuario)
  }

  async function salir() {
    await api.post('/auth/logout').catch(() => {})
    token.borrar()
    setUsuario(null)
    queryClient.clear()
  }

  return (
    <ContextoSesion.Provider value={{ usuario, cargando, iniciar, salir }}>
      {children}
    </ContextoSesion.Provider>
  )
}

/** Envuelve las rutas privadas: sin sesión, manda al login */
export function RutaProtegida() {
  const { usuario, cargando } = useSesion()
  const ubicacion = useLocation()
  if (cargando) return <Cargando texto="Revisando sesión..." />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  return <Outlet />
}
