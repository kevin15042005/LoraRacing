// Comprobante de entrega imprimible (window.print)
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/cliente'
import type { Comprobante as TipoComprobante } from '../api/tipos'
import { Icono } from '../componentes/iconos'
import { AvisoError, Boton, Cargando } from '../componentes/ui'
import { cantidad, fechaHora, pesos } from '../utils/formato'

export function Comprobante() {
  const id = Number(useParams().id)
  const comprobante = useQuery({ queryKey: ['ordenes', 'comprobante', id], queryFn: () => api.get<TipoComprobante>(`/entregas/orden/${id}`) })
  const firmaUrl = useFirma(comprobante.data ? id : null)

  if (comprobante.isPending) return <Cargando />
  if (!comprobante.data) return <AvisoError error={comprobante.error} />
  const { entrega, orden } = comprobante.data

  return (
    <>
      <div className="no-imprimir mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link to={`/ordenes/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-suave">
          <Icono nombre="atras" className="size-4" /> Orden #{id}
        </Link>
        <Boton icono="imprimir" onClick={() => window.print()}>Imprimir</Boton>
      </div>

      <article className="imprimible mx-auto max-w-3xl rounded-2xl border border-borde bg-white p-6 text-sm">
        <header className="flex items-center justify-between gap-4 border-b-2 border-menu pb-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="size-16" />
            <div>
              <p className="text-xl font-black italic">LORA<span className="text-marca-oscuro">RACING</span></p>
              <p className="text-suave">Taller de motos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">Comprobante de entrega</p>
            <p>Orden #{orden.id}</p>
            <p className="text-suave">{fechaHora(entrega.fecha)}</p>
          </div>
        </header>

        <section className="grid gap-4 py-4 sm:grid-cols-2">
          <div>
            <p className="font-semibold uppercase text-suave">Cliente</p>
            <p>{orden.cliente_nombre ?? 'Cliente de mostrador'}</p>
            {orden.cliente_documento && <p>CC {orden.cliente_documento}</p>}
            {orden.cliente_telefono && <p>{orden.cliente_telefono}</p>}
          </div>
          {orden.placa && (
            <div>
              <p className="font-semibold uppercase text-suave">Moto</p>
              <p className="font-mono text-base font-bold">{orden.placa}</p>
              <p>{[orden.moto_marca, orden.moto_modelo].filter(Boolean).join(' ')}</p>
              {entrega.km_entrega && <p>{entrega.km_entrega.toLocaleString('es-CO')} km</p>}
            </div>
          )}
        </section>

        {orden.diagnostico && <p className="mb-1"><strong>Trabajo solicitado:</strong> {orden.diagnostico}</p>}
        {orden.mecanico && <p className="mb-3"><strong>Realizado por:</strong> {orden.mecanico}</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-borde text-left text-suave">
                <th className="py-2">Descripción</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">Precio</th>
                <th className="py-2 text-right">Desc.</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="cifras">
              {orden.items.map(i => (
                <tr key={i.id} className="border-b border-borde">
                  <td className="py-2">{i.descripcion}{!i.cobrar && ' (cortesía)'}</td>
                  <td className="py-2 text-right">{cantidad(i.cantidad)}</td>
                  <td className="py-2 text-right">{pesos(i.precio_unitario)}</td>
                  <td className="py-2 text-right">{i.descuento && i.cobrar ? pesos(i.descuento) : ''}</td>
                  <td className="py-2 text-right">{pesos(i.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="cifras">
              {orden.resumen.descuentos + orden.resumen.cortesias > 0 && (
                <tr>
                  <td colSpan={4} className="pt-2 text-right text-suave">Ahorro (descuentos y cortesías)</td>
                  <td className="pt-2 text-right text-suave">{pesos(orden.resumen.descuentos + orden.resumen.cortesias)}</td>
                </tr>
              )}
              <tr className="text-base font-bold">
                <td colSpan={4} className="pt-2 text-right">TOTAL</td>
                <td className="pt-2 text-right">{pesos(orden.resumen.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {entrega.observaciones && <p className="mt-4"><strong>Observaciones:</strong> {entrega.observaciones}</p>}

        <section className="mt-6 flex flex-col items-center">
          {firmaUrl ? <img src={firmaUrl} alt="Firma del cliente" className="h-32 object-contain" /> : <div className="h-32" />}
          <div className="w-72 border-t border-texto pt-1 text-center">
            <p className="font-semibold">{entrega.recibe_nombre}</p>
            {entrega.recibe_documento && <p>CC {entrega.recibe_documento}</p>}
            <p className="text-xs text-suave">Recibo el vehículo y el trabajo a satisfacción</p>
          </div>
        </section>
      </article>
    </>
  )
}

/** La firma necesita token, así que se pide con fetch y se muestra como blob */
function useFirma(ordenId: number | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (ordenId === null) return
    let enlace: string | null = null
    api
      .archivo(`/entregas/orden/${ordenId}/firma`)
      .then(blob => {
        enlace = URL.createObjectURL(blob)
        setUrl(enlace)
      })
      .catch(() => setUrl(null))
    return () => {
      if (enlace) URL.revokeObjectURL(enlace)
    }
  }, [ordenId])
  return url
}
