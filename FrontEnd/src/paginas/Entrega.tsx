// Entrega del trabajo: datos de quien recibe + firma del cliente en pantalla
import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/cliente'
import type { OrdenDetalle } from '../api/tipos'
import { useGuardar } from '../api/useGuardar'
import { Firma } from '../componentes/Firma'
import { Icono } from '../componentes/iconos'
import { AreaTexto, AvisoError, Boton, Campo, Cargando, Dato, Encabezado, Tarjeta } from '../componentes/ui'
import { numero, pesos, texto } from '../utils/formato'

export function Entrega() {
  const id = Number(useParams().id)
  const navegar = useNavigate()
  const [firma, setFirma] = useState<string | null>(null)

  const orden = useQuery({ queryKey: ['ordenes', 'detalle', id], queryFn: () => api.get<OrdenDetalle>(`/ordenes/${id}`) })
  const entregar = useGuardar((datos: object) => api.post('/entregas', datos), {
    invalidar: ['ordenes', 'reportes', 'motos'],
    alTerminar: () => navegar(`/ordenes/${id}/comprobante`, { replace: true }),
  })

  if (orden.isPending) return <Cargando />
  if (!orden.data) return <AvisoError error={orden.error} />
  const o = orden.data
  if (o.estado === 'entregada') return <Navigate to={`/ordenes/${id}/comprobante`} replace />

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    entregar.mutate({
      orden_id: id,
      recibe_nombre: texto(f.get('recibe_nombre')),
      recibe_documento: texto(f.get('recibe_documento')),
      km_entrega: numero(f.get('km_entrega')) ?? null,
      observaciones: texto(f.get('observaciones')),
      firma,
    })
  }

  return (
    <>
      <Link to={`/ordenes/${id}`} className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-suave">
        <Icono nombre="atras" className="size-4" /> Orden #{id}
      </Link>
      <Encabezado titulo="Entrega del trabajo" subtitulo={`${o.placa ?? ''} ${o.cliente_nombre ?? ''}`} />

      {o.estado !== 'cerrada' && (
        <AvisoError error={`La orden está ${o.estado}. Primero ciérrala para poder entregarla.`} />
      )}

      <form onSubmit={enviar} className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <Tarjeta className="space-y-3">
            <h2 className="font-bold">Quién recibe</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo etiqueta="Nombre *" name="recibe_nombre" required defaultValue={o.cliente_nombre ?? ''} />
              <Campo etiqueta="Cédula" name="recibe_documento" inputMode="numeric" defaultValue={o.cliente_documento ?? ''} />
              {o.moto_id && <Campo etiqueta="Kilometraje de entrega" name="km_entrega" inputMode="numeric" defaultValue={o.km ?? ''} />}
            </div>
            <AreaTexto etiqueta="Observaciones" name="observaciones" placeholder="Recomendaciones, próximo cambio de aceite..." />
          </Tarjeta>

          <Tarjeta>
            <h2 className="mb-1 font-bold">Firma del cliente</h2>
            <p className="mb-3 text-sm text-suave">Al firmar, el cliente declara recibir el vehículo y el trabajo a satisfacción.</p>
            <Firma alCambiar={setFirma} />
          </Tarjeta>
        </div>

        <div className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <Tarjeta>
            {o.items.map(i => (
              <Dato key={i.id} etiqueta={i.descripcion} valor={i.cobrar ? pesos(i.total) : 'Cortesía'} />
            ))}
            <div className="my-2 border-t border-borde" />
            <Dato etiqueta="Total" valor={pesos(o.resumen.total)} fuerte />
          </Tarjeta>
          <AvisoError error={entregar.error} />
          <Boton type="submit" icono="firma" className="w-full" cargando={entregar.isPending} disabled={!firma || o.estado !== 'cerrada'}>
            Confirmar entrega
          </Boton>
          {!firma && <p className="text-center text-sm text-suave">Falta la firma</p>}
        </div>
      </form>
    </>
  )
}
