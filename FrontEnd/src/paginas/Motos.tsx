// Lista de motos: buscar por placa, marca o dueño
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, consulta } from '../api/cliente'
import type { Moto } from '../api/tipos'
import { Desactivar } from '../componentes/Desactivar'
import { FormMoto } from '../componentes/Formularios'
import { AvisoError, Boton, Buscador, Cargando, Encabezado, Modal, Vacio } from '../componentes/ui'

export function Motos() {
  const [q, setQ] = useState('')
  // undefined = cerrado · null = creando · objeto = editando
  const [editando, setEditando] = useState<Moto | null | undefined>(undefined)

  const lista = useQuery({
    queryKey: ['motos', q],
    queryFn: () => api.get<Moto[]>(`/motos${consulta({ q })}`),
    placeholderData: anterior => anterior,
  })

  return (
    <>
      <Encabezado titulo="Motos" acciones={<Boton icono="mas2" onClick={() => setEditando(null)}>Registrar moto</Boton>} />
      <div className="mb-4 flex">
        <Buscador valor={q} alCambiar={setQ} placeholder="Placa, marca, modelo o dueño" />
      </div>
      <AvisoError error={lista.error} />
      {lista.isPending ? (
        <Cargando />
      ) : !lista.data?.length ? (
        <Vacio texto={q ? 'Ninguna moto coincide.' : 'Todavía no hay motos registradas.'} />
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {lista.data.map(m => (
            <li key={m.id} className="rounded-2xl border border-borde bg-superficie p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xl font-bold">{m.placa}</p>
                  <p className="text-sm text-suave">{[m.marca, m.modelo, m.anio].filter(Boolean).join(' ') || 'Sin detalles'}</p>
                  <Link to={`/clientes/${m.cliente_id}`} className="text-sm font-semibold text-marca-oscuro">{m.cliente_nombre}</Link>
                </div>
                <Boton pequeno variante="secundario" icono="editar" onClick={() => setEditando(m)} aria-label={`Editar ${m.placa}`} />
              </div>
              <Link to={`/ordenes?nueva=1&moto_id=${m.id}`} className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-fondo font-semibold hover:bg-marca">
                Nueva orden
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal titulo={editando ? `Editar ${editando.placa}` : 'Registrar moto'} abierto={editando !== undefined} alCerrar={() => setEditando(undefined)}>
        <FormMoto moto={editando ?? undefined} alTerminar={() => setEditando(undefined)} />
        {editando && <Desactivar ruta={`/motos/${editando.id}`} que="moto" invalidar={['motos', 'clientes']} alTerminar={() => setEditando(undefined)} />}
      </Modal>
    </>
  )
}
