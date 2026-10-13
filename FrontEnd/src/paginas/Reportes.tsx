// Reportes: ganancia por quincena, rango de fechas y repuestos más usados
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api, consulta } from '../api/cliente'
import type { FilaQuincena, RepuestoMasUsado, TotalesPeriodo } from '../api/tipos'
import { AvisoError, Boton, Cargando, Dato, Encabezado, Opciones, Tarjeta, Vacio } from '../componentes/ui'
import { cantidad, fecha, hoy, pesos } from '../utils/formato'

export function Reportes() {
  const [meses, setMeses] = useState<'3' | '6' | '12'>('6')
  const actual = useQuery({ queryKey: ['reportes', 'quincena-actual'], queryFn: () => api.get<FilaQuincena>('/reportes/quincena-actual') })
  const quincenas = useQuery({
    queryKey: ['reportes', 'quincenas', meses],
    queryFn: () => api.get<FilaQuincena[]>(`/reportes/quincenas?meses=${meses}`),
  })

  return (
    <>
      <Encabezado titulo="Reportes" subtitulo="Solo cuentan las órdenes cerradas o entregadas" />
      <AvisoError error={actual.error ?? quincenas.error} />

      {actual.data && <ResumenPeriodo titulo={actual.data.etiqueta} totales={actual.data} />}

      <Tarjeta className="mt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Ganancia por quincena</h2>
          <Opciones<'3' | '6' | '12'>
            valor={meses}
            alCambiar={setMeses}
            opciones={[
              { valor: '3', texto: '3 meses' },
              { valor: '6', texto: '6 meses' },
              { valor: '12', texto: '12 meses' },
            ]}
          />
        </div>
        {quincenas.isPending ? (
          <Cargando />
        ) : !quincenas.data?.length ? (
          <Vacio texto="Todavía no hay órdenes cerradas en este periodo." />
        ) : (
          <>
            <Grafica filas={[...quincenas.data].reverse()} />
            <TablaQuincenas filas={quincenas.data} />
          </>
        )}
      </Tarjeta>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Rango />
        <MasUsados />
      </div>
    </>
  )
}

function ResumenPeriodo({ titulo, totales }: { titulo: string; totales: TotalesPeriodo }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Tarjeta oscura>
        <p className="text-sm text-white/70">Ganancia · {titulo}</p>
        <p className="cifras mt-1 text-3xl font-black text-marca">{pesos(totales.ganancia)}</p>
      </Tarjeta>
      <Tarjeta>
        <p className="text-sm text-suave">Ingresos</p>
        <p className="cifras mt-1 text-2xl font-bold">{pesos(totales.ingresos)}</p>
        <p className="text-xs text-suave">{totales.ordenes} órdenes</p>
      </Tarjeta>
      <Tarjeta className="text-sm">
        <Dato etiqueta="Mano de obra" valor={pesos(totales.ingresos_mano_obra)} />
        <Dato etiqueta="Repuestos" valor={pesos(totales.ingresos_repuestos)} />
        <Dato etiqueta="Otros" valor={pesos(totales.ingresos_otros)} />
      </Tarjeta>
      <Tarjeta className="text-sm">
        <Dato etiqueta="Costo" valor={pesos(totales.costo)} />
        <Dato etiqueta="Descuentos" valor={pesos(totales.descuentos)} />
        <Dato etiqueta="Cortesías" valor={pesos(totales.cortesias)} />
      </Tarjeta>
    </div>
  )
}

/** Barras de ganancia (una serie). Al tocar o pasar el mouse muestra el detalle. */
function Grafica({ filas }: { filas: FilaQuincena[] }) {
  const [activa, setActiva] = useState<number | null>(null)
  const maximo = Math.max(...filas.map(f => Math.abs(f.ganancia)), 1)
  const fila = activa !== null ? filas[activa] : filas[filas.length - 1]

  return (
    <div className="mb-4">
      <div className="mb-2 min-h-12 rounded-xl bg-fondo px-3 py-2 text-sm">
        <span className="font-semibold">{fila.etiqueta}</span>
        <span className="cifras ml-2">Ganancia {pesos(fila.ganancia)} · Ingresos {pesos(fila.ingresos)}</span>
      </div>
      <div className="flex h-48 items-end gap-0.5 border-b border-borde" onMouseLeave={() => setActiva(null)}>
        {filas.map((f, i) => (
          <button
            key={`${f.mes}-${f.quincena}`}
            type="button"
            onMouseEnter={() => setActiva(i)}
            onFocus={() => setActiva(i)}
            onClick={() => setActiva(i)}
            aria-label={`${f.etiqueta}: ganancia ${pesos(f.ganancia)}`}
            className="flex h-full min-w-6 flex-1 items-end justify-center cursor-pointer"
          >
            <span
              className={`w-full max-w-12 rounded-t ${f.ganancia < 0 ? 'bg-agotado' : 'bg-marca-oscuro'} ${activa === i ? 'opacity-100' : 'opacity-80'}`}
              style={{ height: `${Math.max((Math.abs(f.ganancia) / maximo) * 100, 1)}%` }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-suave">
        <span>{filas[0].etiqueta}</span>
        {filas.length > 1 && <span>{filas[filas.length - 1].etiqueta}</span>}
      </div>
    </div>
  )
}

function TablaQuincenas({ filas }: { filas: FilaQuincena[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-sm">
        <thead>
          <tr className="border-b border-borde text-left text-suave">
            <th className="py-2">Quincena</th>
            <th className="py-2 text-right">Órdenes</th>
            <th className="py-2 text-right">Ingresos</th>
            <th className="py-2 text-right">Costo</th>
            <th className="py-2 text-right">Ganancia</th>
          </tr>
        </thead>
        <tbody className="cifras">
          {filas.map(f => (
            <tr key={`${f.mes}-${f.quincena}`} className="border-b border-borde">
              <td className="py-2">{f.etiqueta}</td>
              <td className="py-2 text-right">{f.ordenes}</td>
              <td className="py-2 text-right">{pesos(f.ingresos)}</td>
              <td className="py-2 text-right">{pesos(f.costo)}</td>
              <td className="py-2 text-right font-semibold">{pesos(f.ganancia)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Rango() {
  const [desde, setDesde] = useState(hoy().slice(0, 8) + '01')
  const [hasta, setHasta] = useState(hoy())
  const [pedido, setPedido] = useState<{ desde: string; hasta: string } | null>(null)

  const ganancia = useQuery({
    queryKey: ['reportes', 'ganancia', pedido],
    queryFn: () => api.get<TotalesPeriodo>(`/reportes/ganancia${consulta(pedido!)}`),
    enabled: pedido !== null,
  })

  return (
    <Tarjeta>
      <h2 className="mb-3 font-bold">Ganancia entre fechas</h2>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={desde} onChange={e => setDesde(e.target.value)} aria-label="Desde" className="min-h-12 rounded-xl border border-borde px-2" />
        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} aria-label="Hasta" className="min-h-12 rounded-xl border border-borde px-2" />
      </div>
      <Boton className="mt-2 w-full" onClick={() => setPedido({ desde, hasta })}>Calcular</Boton>
      <div className="mt-3">
        <AvisoError error={ganancia.error} />
        {ganancia.isFetching && <Cargando />}
        {ganancia.data && pedido && (
          <>
            <p className="mb-1 text-sm text-suave">{fecha(pedido.desde)} a {fecha(pedido.hasta)} · {ganancia.data.ordenes} órdenes</p>
            <Dato etiqueta="Ingresos" valor={pesos(ganancia.data.ingresos)} />
            <Dato etiqueta="Costo" valor={pesos(ganancia.data.costo)} />
            <Dato etiqueta="Descuentos" valor={pesos(ganancia.data.descuentos)} />
            <Dato etiqueta="Cortesías" valor={pesos(ganancia.data.cortesias)} />
            <Dato etiqueta="Ganancia" valor={pesos(ganancia.data.ganancia)} fuerte />
          </>
        )}
      </div>
    </Tarjeta>
  )
}

function MasUsados() {
  const usados = useQuery({
    queryKey: ['reportes', 'mas-usados'],
    queryFn: () => api.get<{ desde: string; hasta: string; repuestos: RepuestoMasUsado[] }>('/reportes/repuestos-mas-usados?limite=10'),
  })
  return (
    <Tarjeta>
      <h2 className="font-bold">Repuestos más usados</h2>
      {usados.data && <p className="mb-3 text-sm text-suave">Quincena actual ({fecha(usados.data.desde)} a {fecha(usados.data.hasta)})</p>}
      {usados.data?.repuestos.length === 0 && <p className="text-sm text-suave">Sin repuestos vendidos en esta quincena.</p>}
      <ol className="divide-y divide-borde">
        {usados.data?.repuestos.map((r, i) => (
          <li key={r.repuesto_id} className="flex items-center justify-between gap-2 py-2">
            <span className="min-w-0 truncate"><span className="text-suave">{i + 1}.</span> {r.nombre}</span>
            <span className="cifras shrink-0 text-sm">{cantidad(r.cantidad)} · {pesos(r.ingresos)}</span>
          </li>
        ))}
      </ol>
    </Tarjeta>
  )
}
