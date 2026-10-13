// Inicio de sesión. Si todavía no hay administrador, muestra el registro inicial.
// También permite recuperar la contraseña con el PIN que eligió el administrador.
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/cliente'
import type { RespuestaLogin } from '../api/tipos'
import { useSesion } from '../auth/contexto'
import { CamposPin } from '../componentes/CamposPin'
import { AvisoError, Boton, Campo, Cargando } from '../componentes/ui'

type Modo = 'entrar' | 'recuperar'

export function Login() {
  const { usuario, iniciar } = useSesion()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/'
  const [modo, setModo] = useState<Modo>('entrar')
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  const estado = useQuery({
    queryKey: ['auth-estado'],
    queryFn: () => api.get<{ necesitaRegistro: boolean }>('/auth/estado'),
  })
  const esRegistro = estado.data?.necesitaRegistro ?? false

  const enviarDatos = useMutation({
    mutationFn: (datos: Record<string, string>) => {
      const ruta = esRegistro ? '/auth/registro' : modo === 'recuperar' ? '/auth/recuperar' : '/auth/login'
      return api.post<RespuestaLogin>(ruta, datos)
    },
    onSuccess: respuesta => {
      iniciar(respuesta)
      navegar(destino, { replace: true })
    },
  })

  if (usuario) return <Navigate to={destino} replace />

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const datos = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    // Revisar que lo que se escribe dos veces coincida
    if (datos.confirmarClave !== undefined && datos.confirmarClave !== (datos.clave ?? datos.claveNueva)) {
      setErrorLocal('Las dos contraseñas no coinciden')
      return
    }
    if (datos.confirmarPin !== undefined && datos.confirmarPin !== datos.pin) {
      setErrorLocal('Los dos PIN no coinciden')
      return
    }
    setErrorLocal(null)
    enviarDatos.mutate(datos)
  }

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo)
    setErrorLocal(null)
    enviarDatos.reset()
  }

  const recuperando = modo === 'recuperar' && !esRegistro
  const titulo = esRegistro ? 'Crear administrador' : recuperando ? 'Recuperar contraseña' : 'Iniciar sesión'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-menu p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-white">
          <img src="/logo.png" alt="Logo LoraRacing" className="size-36" />
          <p className="mt-3 text-sm font-semibold italic text-acento">PA' DAR LORA!</p>
        </div>

        <form key={`${modo}-${esRegistro}`} onSubmit={enviar} className="space-y-4 rounded-2xl bg-superficie p-5">
          {estado.isPending ? (
            <Cargando />
          ) : (
            <>
              <h1 className="text-xl font-bold">{titulo}</h1>
              {esRegistro && (
                <p className="text-sm text-suave">
                  Es la primera vez que se usa el sistema. Crea el usuario que va a administrar el taller.
                </p>
              )}
              {recuperando && (
                <p className="text-sm text-suave">Escribe tu usuario y tu PIN de recuperación. Luego elige una contraseña nueva.</p>
              )}
              <AvisoError error={errorLocal ?? estado.error ?? enviarDatos.error} />

              {esRegistro && <Campo etiqueta="Tu nombre" name="nombre" required autoComplete="name" />}
              <Campo etiqueta="Usuario" name="usuario" required autoCapitalize="none" autoComplete="username" />

              {esRegistro && (
                <>
                  <Campo etiqueta="Contraseña" name="clave" type="password" required minLength={6} autoComplete="new-password" ayuda="Mínimo 6 caracteres" />
                  <Campo etiqueta="Repite la contraseña" name="confirmarClave" type="password" required minLength={6} autoComplete="new-password" />
                  <CamposPin />
                </>
              )}

              {recuperando && (
                <>
                  <Campo etiqueta="PIN de recuperación" name="pin" type="password" required inputMode="numeric" autoComplete="off" maxLength={8} />
                  <Campo etiqueta="Contraseña nueva" name="claveNueva" type="password" required minLength={6} autoComplete="new-password" ayuda="Mínimo 6 caracteres" />
                  <Campo etiqueta="Repite la contraseña nueva" name="confirmarClave" type="password" required minLength={6} autoComplete="new-password" />
                </>
              )}

              {!esRegistro && !recuperando && (
                <Campo etiqueta="Contraseña" name="clave" type="password" required autoComplete="current-password" />
              )}

              <Boton type="submit" cargando={enviarDatos.isPending} className="w-full">
                {esRegistro ? 'Crear y entrar' : recuperando ? 'Cambiar contraseña y entrar' : 'Entrar'}
              </Boton>

              {!esRegistro && (
                <button
                  type="button"
                  onClick={() => cambiarModo(modo === 'entrar' ? 'recuperar' : 'entrar')}
                  className="w-full py-2 text-sm font-semibold text-marca-oscuro cursor-pointer"
                >
                  {modo === 'entrar' ? '¿Olvidaste tu contraseña?' : 'Volver a iniciar sesión'}
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  )
}
