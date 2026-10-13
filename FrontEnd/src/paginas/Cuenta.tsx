// Mi cuenta: cambiar contraseña, PIN de recuperación y cerrar sesión
import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../api/cliente'
import { useSesion } from '../auth/contexto'
import { CamposPin } from '../componentes/CamposPin'
import { Icono } from '../componentes/iconos'
import { AvisoError, Boton, Campo, Encabezado, Tarjeta } from '../componentes/ui'

export function Cuenta() {
  const { usuario, salir } = useSesion()
  const [pinGuardado, setPinGuardado] = useState(false)
  const [errorPin, setErrorPin] = useState<string | null>(null)

  const cambiarClave = useMutation({
    mutationFn: (datos: object) => api.put<{ mensaje: string }>('/auth/clave', datos),
  })
  const cambiarPin = useMutation({
    mutationFn: (datos: object) => api.put<{ mensaje: string }>('/auth/pin', datos),
    onSuccess: () => setPinGuardado(true),
  })

  function enviarClave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formulario = e.currentTarget
    const f = new FormData(formulario)
    cambiarClave.mutate(
      { claveActual: f.get('claveActual'), claveNueva: f.get('claveNueva') },
      { onSuccess: () => formulario.reset() },
    )
  }

  function enviarPin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formulario = e.currentTarget
    const f = new FormData(formulario)
    if (f.get('pin') !== f.get('confirmarPin')) {
      setErrorPin('Los dos PIN no coinciden')
      return
    }
    setErrorPin(null)
    cambiarPin.mutate({ claveActual: f.get('claveActual'), pinNuevo: f.get('pin') }, { onSuccess: () => formulario.reset() })
  }

  const tienePin = usuario?.tiene_pin || pinGuardado

  return (
    <>
      <Encabezado titulo="Mi cuenta" subtitulo={`${usuario?.nombre} (${usuario?.usuario})`} />

      {!tienePin && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-por-agotarse/50 bg-por-agotarse/15 p-3 text-sm">
          <Icono nombre="alerta" className="mt-0.5 size-5 shrink-0" />
          <span>No tienes PIN de recuperación. Créalo abajo: sin él, si olvidas la contraseña solo se puede reiniciar desde el PC del taller.</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Tarjeta>
          <h2 className="mb-3 font-bold">{tienePin ? 'Cambiar PIN de recuperación' : 'Crear PIN de recuperación'}</h2>
          <form onSubmit={enviarPin} className="space-y-3">
            <AvisoError error={errorPin ?? cambiarPin.error} />
            {cambiarPin.data && <p className="rounded-xl bg-suficiente/10 p-3 text-sm text-suficiente">{cambiarPin.data.mensaje}</p>}
            <Campo etiqueta="Contraseña actual" name="claveActual" type="password" required autoComplete="current-password" />
            <CamposPin etiqueta="PIN nuevo" />
            <Boton type="submit" cargando={cambiarPin.isPending} className="w-full">Guardar PIN</Boton>
          </form>
        </Tarjeta>

        <Tarjeta>
          <h2 className="mb-3 font-bold">Cambiar contraseña</h2>
          <form onSubmit={enviarClave} className="space-y-3">
            <AvisoError error={cambiarClave.error} />
            {cambiarClave.data && <p className="rounded-xl bg-suficiente/10 p-3 text-sm text-suficiente">{cambiarClave.data.mensaje}</p>}
            <Campo
              etiqueta="Contraseña actual o PIN de recuperación"
              name="claveActual"
              type="password"
              required
              autoComplete="current-password"
              ayuda="Si no recuerdas la contraseña, escribe tu PIN"
            />
            <Campo etiqueta="Nueva contraseña" name="claveNueva" type="password" required minLength={6} autoComplete="new-password" ayuda="Mínimo 6 caracteres" />
            <Boton type="submit" cargando={cambiarClave.isPending} className="w-full">Cambiar contraseña</Boton>
          </form>
        </Tarjeta>

        <Tarjeta>
          <h2 className="mb-2 font-bold">Sesión</h2>
          <p className="mb-3 text-sm text-suave">La sesión dura 30 días en cada dispositivo. Ciérrala si prestas el celular o la tablet.</p>
          <Boton variante="oscuro" icono="salir" className="w-full" onClick={salir}>Cerrar sesión</Boton>
        </Tarjeta>
      </div>
    </>
  )
}
