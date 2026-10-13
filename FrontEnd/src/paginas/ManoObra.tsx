// Catálogo de mano de obra con su precio estándar
import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api, consulta } from '../api/cliente'
import type { ManoObra as TipoManoObra } from '../api/tipos'
import { useGuardar } from '../api/useGuardar'
import { Desactivar } from '../componentes/Desactivar'
import { AvisoError, AreaTexto, Boton, Buscador, Campo, Cargando, Encabezado, Modal, Vacio } from '../componentes/ui'
import { numero, pesos, texto } from '../utils/formato'

export function ManoObra() {
  const [q, setQ] = useState('')
  // undefined = cerrado · null = creando · objeto = editando
  const [editando, setEditando] = useState<TipoManoObra | null | undefined>(undefined)

  const lista = useQuery({
    queryKey: ['mano-obra', q],
    queryFn: () => api.get<TipoManoObra[]>(`/mano-obra${consulta({ q })}`),
    placeholderData: anterior => anterior,
  })

  return (
    <>
      <Encabezado titulo="Mano de obra" subtitulo="Trabajos con precio estándar" acciones={<Boton icono="mas2" onClick={() => setEditando(null)}>Nuevo trabajo</Boton>} />
      <div className="mb-4 flex">
        <Buscador valor={q} alCambiar={setQ} placeholder="Buscar trabajo" />
      </div>
      <AvisoError error={lista.error} />
      {lista.isPending ? (
        <Cargando />
      ) : !lista.data?.length ? (
        <Vacio texto="No hay trabajos registrados." />
      ) : (
        <ul className="divide-y divide-borde rounded-2xl border border-borde bg-superficie">
          {lista.data.map(m => (
            <li key={m.id}>
              <button type="button" onClick={() => setEditando(m)} className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-fondo cursor-pointer">
                <span className="min-w-0">
                  <span className="block font-semibold">{m.nombre}</span>
                  {m.descripcion && <span className="block truncate text-sm text-suave">{m.descripcion}</span>}
                </span>
                <span className="cifras shrink-0 font-semibold">{pesos(m.precio)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal titulo={editando ? 'Editar trabajo' : 'Nuevo trabajo'} abierto={editando !== undefined} alCerrar={() => setEditando(undefined)}>
        <FormManoObra trabajo={editando ?? undefined} alTerminar={() => setEditando(undefined)} />
      </Modal>
    </>
  )
}

function FormManoObra({ trabajo, alTerminar }: { trabajo?: TipoManoObra; alTerminar: () => void }) {
  const guardar = useGuardar(
    (datos: object) => (trabajo ? api.put(`/mano-obra/${trabajo.id}`, datos) : api.post('/mano-obra', datos)),
    { invalidar: ['mano-obra'], alTerminar },
  )

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    guardar.mutate({ nombre: texto(f.get('nombre')), descripcion: texto(f.get('descripcion')), precio: numero(f.get('precio')) ?? 0 })
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <AvisoError error={guardar.error} />
      <Campo etiqueta="Nombre *" name="nombre" required defaultValue={trabajo?.nombre} placeholder="Cambio de aceite" />
      <Campo etiqueta="Precio estándar *" name="precio" inputMode="numeric" required defaultValue={trabajo?.precio} />
      <AreaTexto etiqueta="Descripción" name="descripcion" defaultValue={trabajo?.descripcion ?? ''} />
      <Boton type="submit" cargando={guardar.isPending} className="w-full">{trabajo ? 'Guardar cambios' : 'Crear trabajo'}</Boton>
      {trabajo && <Desactivar ruta={`/mano-obra/${trabajo.id}`} que="trabajo" invalidar={['mano-obra']} alTerminar={alTerminar} />}
    </form>
  )
}
