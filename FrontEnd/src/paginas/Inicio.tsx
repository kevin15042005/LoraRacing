// Pantalla de inicio: ganancia de la quincena, stock y órdenes pendientes
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api/cliente'
import type { Orden, Repuesto, ResumenInicio } from '../api/tipos'
import { useSesion } from '../auth/contexto'
import { Icono } from '../componentes/iconos'
import { AvisoError, Cargando, Encabezado, InsigniaOrden, InsigniaStock, Tarjeta } from '../componentes/ui'
import { cantidad, pesos } from '../utils/formato'

export function Inicio() {
  const { usuario } = useSesion()
  const resumen = useQuery({ queryKey: ['reportes', 'resumen'], queryFn: () => api.get<ResumenInicio>('/reportes/resumen') })
  const alertas = useQuery({ queryKey: ['repuestos', 'alertas'], queryFn: () => api.get<Repuesto[]>('/repuestos/alertas') })
  const pendientes = useQuery({
    queryKey: ['ordenes', 'pendientes'],
    queryFn: async () => {
      const [abiertas, cerradas] = await Promise.all([
        api.get<Orden[]>('/ordenes?estado=abierta'),
        api.get<Orden[]>('/ordenes?estado=cerrada'),
      ])
      return [...cerradas, ...abiertas]
    },
  })

  const q = resumen.data?.quincena_actual

  return (
    <>
      <Encabezado
        titulo={`Hola, ${usuario?.nombre.split(' ')[0] ?? ''}`}
        subtitulo={q?.etiqueta}
        acciones={
          <Link to="/ordenes?nueva=1" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-marca px-4 font-semibold hover:bg-marca-oscuro hover:text-white">
            <Icono nombre="mas2" /> Nueva orden
          </Link>
        }
      />
      <AvisoError error={resumen.error} />

      {resumen.isPending ? (
        <Cargando />
      ) : q ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tarjeta oscura className="sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-white/70">Ganancia de la quincena</p>
            <p className="cifras mt-1 text-3xl font-black text-marca">{pesos(q.ganancia)}</p>
            <p className="mt-1 text-xs text-white/60">{q.ordenes} órdenes cerradas</p>
          </Tarjeta>
          <Tarjeta>
            <p className="text-sm text-suave">Ingresos de la quincena</p>
            <p className="cifras mt-1 text-2xl font-bold">{pesos(q.ingresos)}</p>
            <p className="cifras mt-1 text-xs text-suave">Costo repuestos: {pesos(q.costo)}</p>
          </Tarjeta>
          <Link to="/ordenes?estado=abierta">
            <Tarjeta className="h-full hover:border-marca">
              <p className="text-sm text-suave">Órdenes abiertas</p>
              <p className="mt-1 text-2xl font-bold">{resumen.data?.ordenes_abiertas}</p>
            </Tarjeta>
          </Link>
          <Link to="/ordenes?estado=cerrada">
            <Tarjeta className="h-full hover:border-marca">
              <p className="text-sm text-suave">Por entregar (sin firma)</p>
              <p className="mt-1 text-2xl font-bold">{resumen.data?.ordenes_por_entregar}</p>
            </Tarjeta>
          </Link>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Tarjeta>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Stock que requiere atención</h2>
            <Link to="/inventario" className="text-sm font-semibold text-marca-oscuro">Ver inventario</Link>
          </div>
          {resumen.data && (
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <ConteoStock color="text-agotado" texto="Agotados" valor={resumen.data.stock.agotado} />
              <ConteoStock color="text-yellow-700" texto="Por agotarse" valor={resumen.data.stock.por_agotarse} />
              <ConteoStock color="text-suficiente" texto="Suficientes" valor={resumen.data.stock.suficiente} />
            </div>
          )}
          {alertas.data?.length === 0 && <p className="text-sm text-suave">Todo el inventario tiene stock suficiente.</p>}
          <ul className="divide-y divide-borde">
            {alertas.data?.slice(0, 8).map(r => (
              <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0 truncate">{r.nombre}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="cifras text-sm text-suave">{cantidad(r.stock)} {r.unidad}</span>
                  <InsigniaStock estado={r.estado} />
                </span>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Órdenes pendientes</h2>
            <Link to="/ordenes" className="text-sm font-semibold text-marca-oscuro">Ver todas</Link>
          </div>
          {pendientes.data?.length === 0 && <p className="text-sm text-suave">No hay órdenes pendientes.</p>}
          <ul className="divide-y divide-borde">
            {pendientes.data?.slice(0, 8).map(o => (
              <li key={o.id}>
                <Link to={`/ordenes/${o.id}`} className="flex items-center justify-between gap-2 py-2 hover:bg-fondo">
                  <span className="min-w-0">
                    <span className="font-semibold">#{o.id}</span>{' '}
                    <span className="text-suave">{o.placa ?? o.cliente_nombre ?? 'Venta de mostrador'}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="cifras text-sm">{pesos(o.total)}</span>
                    <InsigniaOrden estado={o.estado} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
    </>
  )
}

function ConteoStock({ color, texto, valor }: { color: string; texto: string; valor: number }) {
  return (
    <div className="rounded-xl bg-fondo p-2">
      <p className={`text-2xl font-bold ${color}`}>{valor}</p>
      <p className="text-xs text-suave">{texto}</p>
    </div>
  )
}
