// Botón para desactivar (ocultar) un registro, con confirmación en la misma pantalla
import { useState } from 'react'
import { api } from '../api/cliente'
import { useGuardar } from '../api/useGuardar'
import { AvisoError, Boton } from './ui'

export function Desactivar({ ruta, que, invalidar, alTerminar }: {
  ruta: string // ej. "/repuestos/5"
  que: string // ej. "repuesto"
  invalidar: string[]
  alTerminar: () => void
}) {
  const [confirmar, setConfirmar] = useState(false)
  const borrar = useGuardar(() => api.delete(ruta), { invalidar, alTerminar })

  return (
    <div className="mt-4 border-t border-borde pt-4">
      <AvisoError error={borrar.error} />
      {!confirmar ? (
        <Boton variante="secundario" icono="basura" className="w-full !text-agotado" onClick={() => setConfirmar(true)}>
          Desactivar {que}
        </Boton>
      ) : (
        <>
          <p className="text-sm">¿Seguro? Se ocultará de las listas, pero su historial se conserva.</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Boton variante="secundario" onClick={() => setConfirmar(false)}>Cancelar</Boton>
            <Boton variante="peligro" cargando={borrar.isPending} onClick={() => borrar.mutate(undefined)}>Sí, desactivar</Boton>
          </div>
        </>
      )}
    </div>
  )
}
