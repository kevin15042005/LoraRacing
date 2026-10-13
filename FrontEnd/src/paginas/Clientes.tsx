// Lista de clientes con búsqueda (también encuentra por placa)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, consulta } from '../api/cliente'
import type { Cliente } from '../api/tipos'
import { FormCliente } from '../componentes/Formularios'
import { AvisoError, Boton, Buscador, Cargando, Encabezado, Modal, Vacio } from '../componentes/ui'

export function Clientes() {
  const [q, setQ] = useState('')
  const [creando, setCreando] = useState(false)
  const navegar = useNavigate()

  const lista = useQuery({
    queryKey: ['clientes', q],
    queryFn: () => api.get<Cliente[]>(`/clientes${consulta({ q })}`),
    placeholderData: anterior => anterior,
  })

  return (
    <>
      <Encabezado titulo="Clientes" acciones={<Boton icono="mas2" onClick={() => setCreando(true)}>Nuevo cliente</Boton>} />
      <div className="mb-4 flex">
        <Buscador valor={q} alCambiar={setQ} placeholder="Buscar por nombre, cédula, teléfono o placa" />
      </div>
      <AvisoError error={lista.error} />
      {lista.isPending ? (
        <Cargando />
      ) : !lista.data?.length ? (
        <Vacio texto={q ? 'Ningún cliente coincide.' : 'Todavía no hay clientes.'} />
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {lista.data.map(c => (
            <li key={c.id}>
              <Link to={`/clientes/${c.id}`} className="block rounded-2xl border border-borde bg-superficie p-4 hover:border-marca">
                <p className="font-semibold">{c.nombre}</p>
                <p className="text-sm text-suave">
                  {[c.telefono, c.documento].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                  {' · '}
                  {c.total_motos ?? 0} {c.total_motos === 1 ? 'moto' : 'motos'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal titulo="Nuevo cliente" abierto={creando} alCerrar={() => setCreando(false)}>
        <FormCliente alTerminar={c => navegar(`/clientes/${c.id}`)} />
      </Modal>
    </>
  )
}
