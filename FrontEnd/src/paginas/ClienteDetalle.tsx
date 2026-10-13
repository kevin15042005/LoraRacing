// Ficha de un cliente: datos, motos y órdenes
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/cliente'
import type { ClienteDetalle as TipoClienteDetalle, Orden } from '../api/tipos'
import { Desactivar } from '../componentes/Desactivar'
import { FormCliente, FormMoto } from '../componentes/Formularios'
import { Icono } from '../componentes/iconos'
import { AvisoError, Boton, Cargando, Encabezado, InsigniaOrden, Modal, Tarjeta, Vacio } from '../componentes/ui'
import { fecha, pesos } from '../utils/formato'

export function ClienteDetalle() {
  const id = Number(useParams().id)
  const navegar = useNavigate()
  const [editando, setEditando] = useState(false)
  const [nuevaMoto, setNuevaMoto] = useState(false)

  const cliente = useQuery({ queryKey: ['clientes', 'detalle', id], queryFn: () => api.get<TipoClienteDetalle>(`/clientes/${id}`) })
  const ordenes = useQuery({ queryKey: ['ordenes', 'cliente', id], queryFn: () => api.get<Orden[]>(`/ordenes?cliente_id=${id}`) })

  if (cliente.isPending) return <Cargando />
  if (!cliente.data) return <AvisoError error={cliente.error} />
  const c = cliente.data

  return (
    <>
      <Link to="/clientes" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-suave">
        <Icono nombre="atras" className="size-4" /> Clientes
      </Link>
      <Encabezado
        titulo={c.nombre}
        subtitulo={[c.documento && `CC ${c.documento}`, c.telefono].filter(Boolean).join(' · ')}
        acciones={<Boton variante="secundario" icono="editar" onClick={() => setEditando(true)}>Editar</Boton>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Tarjeta>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Motos</h2>
            <Boton pequeno icono="mas2" onClick={() => setNuevaMoto(true)}>Agregar moto</Boton>
          </div>
          {c.motos.length === 0 ? (
            <p className="text-sm text-suave">Este cliente no tiene motos registradas.</p>
          ) : (
            <ul className="divide-y divide-borde">
              {c.motos.map(m => (
                <li key={m.id} className="flex items-center justify-between gap-2 py-2">
                  <div>
                    <p className="font-mono text-lg font-bold">{m.placa}</p>
                    <p className="text-sm text-suave">{[m.marca, m.modelo, m.anio].filter(Boolean).join(' ')}</p>
                  </div>
                  <Link to={`/ordenes?nueva=1&moto_id=${m.id}`} className="rounded-xl border border-borde px-3 py-2 text-sm font-semibold hover:bg-fondo">
                    Nueva orden
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {(c.email || c.direccion || c.notas) && (
            <div className="mt-4 space-y-1 border-t border-borde pt-3 text-sm text-suave">
              {c.email && <p>{c.email}</p>}
              {c.direccion && <p>{c.direccion}</p>}
              {c.notas && <p>{c.notas}</p>}
            </div>
          )}
        </Tarjeta>

        <Tarjeta>
          <h2 className="mb-3 font-bold">Historial de órdenes</h2>
          {ordenes.data?.length === 0 && <Vacio texto="Sin órdenes todavía." />}
          <ul className="divide-y divide-borde">
            {ordenes.data?.map(o => (
              <li key={o.id}>
                <Link to={`/ordenes/${o.id}`} className="flex items-center justify-between gap-2 py-2 hover:bg-fondo">
                  <span>
                    <span className="font-semibold">#{o.id}</span> <span className="text-sm text-suave">{fecha(o.fecha)} · {o.placa ?? 'venta'}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="cifras text-sm">{pesos(o.total)}</span>
                    <InsigniaOrden estado={o.estado} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>

      <Modal titulo="Editar cliente" abierto={editando} alCerrar={() => setEditando(false)}>
        <FormCliente cliente={c} alTerminar={() => setEditando(false)} />
        <Desactivar ruta={`/clientes/${c.id}`} que="cliente" invalidar={['clientes']} alTerminar={() => navegar('/clientes')} />
      </Modal>
      <Modal titulo="Agregar moto" abierto={nuevaMoto} alCerrar={() => setNuevaMoto(false)}>
        <FormMoto clienteId={c.id} alTerminar={() => setNuevaMoto(false)} />
      </Modal>
    </>
  )
}
