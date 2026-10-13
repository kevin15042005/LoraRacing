// Copias de seguridad de la base de datos
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api, descargar } from '../api/cliente'
import type { Respaldo } from '../api/tipos'
import { useGuardar } from '../api/useGuardar'
import { AvisoError, Boton, Cargando, Encabezado, Tarjeta, Vacio } from '../componentes/ui'
import { fechaHora } from '../utils/formato'

export function Respaldos() {
  const [errorDescarga, setErrorDescarga] = useState<unknown>(null)
  const lista = useQuery({ queryKey: ['respaldos'], queryFn: () => api.get<Respaldo[]>('/respaldos') })
  const crear = useGuardar(() => api.post<Respaldo>('/respaldos'), { invalidar: ['respaldos'] })

  async function bajar(archivo: string) {
    setErrorDescarga(null)
    try {
      await descargar(`/respaldos/${encodeURIComponent(archivo)}`, archivo)
    } catch (e) {
      setErrorDescarga(e)
    }
  }

  return (
    <>
      <Encabezado
        titulo="Respaldos"
        subtitulo="Cada día se crea uno automático (se guardan los últimos 30)"
        acciones={<Boton icono="respaldos" cargando={crear.isPending} onClick={() => crear.mutate(undefined)}>Crear respaldo ahora</Boton>}
      />
      <AvisoError error={lista.error ?? crear.error ?? errorDescarga} />

      <Tarjeta className="mb-4 text-sm">
        <p className="font-semibold">Cómo restaurar un respaldo</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-suave">
          <li>Apaga el servidor (Ctrl + C en la ventana del BackEnd).</li>
          <li>Copia el archivo de la carpeta <code>BackEnd\backup</code> y pégalo como <code>BackEnd\datos\taller.db</code> (reemplazando).</li>
          <li>Vuelve a encender el servidor.</li>
        </ol>
        <p className="mt-2 text-suave">Consejo: descarga un respaldo cada semana a una memoria USB o a tu correo.</p>
      </Tarjeta>

      {lista.isPending ? (
        <Cargando />
      ) : !lista.data?.length ? (
        <Vacio texto="Todavía no hay respaldos." />
      ) : (
        <ul className="divide-y divide-borde rounded-2xl border border-borde bg-superficie">
          {lista.data.map(r => (
            <li key={r.archivo} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold">{fechaHora(r.fecha)}</p>
                <p className="text-sm text-suave">{r.motivo === 'manual' ? 'Manual' : 'Automático'} · {r.tamano_kb.toLocaleString('es-CO')} KB</p>
              </div>
              <Boton pequeno variante="secundario" icono="descargar" onClick={() => bajar(r.archivo)}>Descargar</Boton>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
