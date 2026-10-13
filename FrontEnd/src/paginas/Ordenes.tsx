// Lista de órdenes (ventas y mantenimientos) con filtros, y creación de órdenes nuevas
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, consulta } from '../api/cliente'
import type { Cliente, EstadoOrden, Moto, Orden, OrdenDetalle, TipoOrden } from '../api/tipos'
import { CampoMecanico } from '../componentes/CampoMecanico'
import { AreaTexto, AvisoError, Boton, Buscador, Campo, Cargando, Encabezado, InsigniaOrden, Modal, Opciones, Vacio } from '../componentes/ui'
import { fechaHora, numero, pesos, texto } from '../utils/formato'

type FiltroEstado = '' | EstadoOrden
type FiltroTipo = '' | TipoOrden

export function Ordenes() {
  // Los filtros viven en la URL (?estado=abierta) para poder llegar desde el Inicio
  const [params, setParams] = useSearchParams()
  const estado = (params.get('estado') ?? '') as FiltroEstado
  const tipo = (params.get('tipo') ?? '') as FiltroTipo
  const [q, setQ] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const nuevaAbierta = params.get('nueva') === '1'
  const motoInicial = numero(params.get('moto_id'))

  function cambiarParam(clave: string, valor: string) {
    const nuevos = new URLSearchParams(params)
    if (valor) nuevos.set(clave, valor)
    else nuevos.delete(clave)
    setParams(nuevos, { replace: true })
  }

  function cerrarNueva() {
    const nuevos = new URLSearchParams(params)
    nuevos.delete('nueva')
    nuevos.delete('moto_id')
    setParams(nuevos, { replace: true })
  }

  const lista = useQuery({
    queryKey: ['ordenes', { estado, tipo, q, desde, hasta }],
    queryFn: () => api.get<Orden[]>(`/ordenes${consulta({ estado, tipo, q, desde, hasta })}`),
    placeholderData: anterior => anterior,
  })

  return (
    <>
      <Encabezado titulo="Órdenes" acciones={<Boton icono="mas2" onClick={() => cambiarParam('nueva', '1')}>Nueva orden</Boton>} />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Buscador valor={q} alCambiar={setQ} placeholder="Placa, cliente, mecánico o # de orden" />
        <div className="grid grid-cols-2 gap-2 sm:w-80">
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} aria-label="Desde" className="min-h-12 rounded-xl border border-borde bg-superficie px-2" />
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} aria-label="Hasta" className="min-h-12 rounded-xl border border-borde bg-superficie px-2" />
        </div>
      </div>
      <div className="mb-2">
        <Opciones<FiltroEstado>
          valor={estado}
          alCambiar={v => cambiarParam('estado', v)}
          opciones={[
            { valor: '', texto: 'Todas' },
            { valor: 'abierta', texto: 'Abiertas' },
            { valor: 'cerrada', texto: 'Por entregar' },
            { valor: 'entregada', texto: 'Entregadas' },
            { valor: 'anulada', texto: 'Anuladas' },
          ]}
        />
      </div>
      <div className="mb-4">
        <Opciones<FiltroTipo>
          valor={tipo}
          alCambiar={v => cambiarParam('tipo', v)}
          opciones={[
            { valor: '', texto: 'Ventas y mantenimientos' },
            { valor: 'mantenimiento', texto: 'Mantenimientos' },
            { valor: 'venta', texto: 'Ventas' },
          ]}
        />
      </div>

      <AvisoError error={lista.error} />
      {lista.isPending ? (
        <Cargando />
      ) : !lista.data?.length ? (
        <Vacio texto="No hay órdenes con estos filtros." />
      ) : (
        <ul className="space-y-2">
          {lista.data.map(o => (
            <li key={o.id}>
              <Link to={`/ordenes/${o.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie p-4 hover:border-marca">
                <div className="min-w-0">
                  <p className="font-semibold">
                    #{o.id} · <span className="capitalize">{o.tipo}</span>
                    {o.placa && <span className="ml-2 font-mono">{o.placa}</span>}
                  </p>
                  <p className="truncate text-sm text-suave">
                    {o.cliente_nombre ?? 'Cliente de mostrador'} · {fechaHora(o.fecha)}{o.mecanico ? ` · ${o.mecanico}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="cifras font-bold">{pesos(o.total)}</span>
                  <InsigniaOrden estado={o.estado} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal titulo="Nueva orden" abierto={nuevaAbierta} alCerrar={cerrarNueva}>
        <NuevaOrden motoInicial={motoInicial} />
      </Modal>
    </>
  )
}

// ---------- Crear orden ----------
function NuevaOrden({ motoInicial }: { motoInicial?: number }) {
  const navegar = useNavigate()
  const [tipo, setTipo] = useState<TipoOrden>('mantenimiento')
  const [busqueda, setBusqueda] = useState('')
  const [motoElegida, setMotoElegida] = useState<Moto | null>(null)
  const [clienteElegido, setClienteElegido] = useState<Cliente | null>(null)

  // Si se llegó con ?moto_id=, se carga esa moto
  const motoDeUrl = useQuery({
    queryKey: ['motos', 'detalle', motoInicial],
    queryFn: () => api.get<Moto>(`/motos/${motoInicial}`),
    enabled: motoInicial !== undefined,
  })
  const moto = motoElegida ?? motoDeUrl.data ?? null

  const motos = useQuery({
    queryKey: ['motos', busqueda],
    queryFn: () => api.get<Moto[]>(`/motos${consulta({ q: busqueda })}`),
    enabled: tipo === 'mantenimiento' && !moto && busqueda.length > 0,
  })
  const clientes = useQuery({
    queryKey: ['clientes', busqueda],
    queryFn: () => api.get<Cliente[]>(`/clientes${consulta({ q: busqueda })}`),
    enabled: tipo === 'venta' && !clienteElegido && busqueda.length > 0,
  })

  const crear = useMutation({
    mutationFn: (datos: object) => api.post<OrdenDetalle>('/ordenes', datos),
    onSuccess: orden => navegar(`/ordenes/${orden.id}`),
  })

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    crear.mutate({
      tipo,
      moto_id: tipo === 'mantenimiento' ? moto?.id : null,
      cliente_id: tipo === 'venta' ? clienteElegido?.id ?? null : null,
      km: numero(f.get('km')) ?? null,
      diagnostico: texto(f.get('diagnostico')),
      notas: texto(f.get('notas')),
      mecanico: texto(f.get('mecanico')),
    })
  }

  function cambiarTipo(nuevo: TipoOrden) {
    setTipo(nuevo)
    setBusqueda('')
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {(['mantenimiento', 'venta'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => cambiarTipo(t)}
            className={`min-h-16 rounded-xl border-2 font-semibold cursor-pointer ${tipo === t ? 'border-marca-oscuro bg-marca/20' : 'border-borde'}`}
          >
            {t === 'mantenimiento' ? 'Mantenimiento' : 'Venta de mostrador'}
          </button>
        ))}
      </div>

      <AvisoError error={crear.error} />

      {tipo === 'mantenimiento' ? (
        moto ? (
          <Elegido
            titulo={moto.placa}
            detalle={`${[moto.marca, moto.modelo].filter(Boolean).join(' ')} · ${moto.cliente_nombre ?? ''}`}
            alQuitar={() => { setMotoElegida(null); setBusqueda('') }}
            quitable={!motoDeUrl.data || motoElegida !== null}
          />
        ) : (
          <div>
            <Buscador valor={busqueda} alCambiar={setBusqueda} placeholder="Buscar moto por placa o dueño" />
            <ListaEleccion
              elementos={motos.data?.map(m => ({ id: m.id, titulo: m.placa, detalle: `${m.marca ?? ''} ${m.modelo ?? ''} · ${m.cliente_nombre}` })) ?? []}
              alElegir={id => setMotoElegida(motos.data!.find(m => m.id === id)!)}
              vacio={busqueda && motos.isFetched ? 'No se encontró. Regístrala primero en Motos o en el cliente.' : ''}
            />
          </div>
        )
      ) : clienteElegido ? (
        <Elegido titulo={clienteElegido.nombre} detalle={clienteElegido.telefono ?? ''} alQuitar={() => { setClienteElegido(null); setBusqueda('') }} quitable />
      ) : (
        <div>
          <Buscador valor={busqueda} alCambiar={setBusqueda} placeholder="Cliente (opcional)" />
          <ListaEleccion
            elementos={clientes.data?.map(c => ({ id: c.id, titulo: c.nombre, detalle: c.telefono ?? '' })) ?? []}
            alElegir={id => setClienteElegido(clientes.data!.find(c => c.id === id)!)}
            vacio=""
          />
        </div>
      )}

      {tipo === 'mantenimiento' && (
        <>
          <Campo etiqueta="Kilometraje al ingresar" name="km" inputMode="numeric" placeholder={moto?.km_actual ? `Último: ${moto.km_actual}` : ''} />
          <AreaTexto etiqueta="Diagnóstico / qué pide el cliente" name="diagnostico" />
        </>
      )}
      <CampoMecanico />
      <AreaTexto etiqueta="Notas" name="notas" />

      <Boton type="submit" className="w-full" cargando={crear.isPending} disabled={tipo === 'mantenimiento' && !moto}>
        Crear orden
      </Boton>
      {motoDeUrl.isPending && motoInicial !== undefined && <Cargando />}
    </form>
  )
}

function Elegido({ titulo, detalle, alQuitar, quitable }: { titulo: string; detalle: string; alQuitar: () => void; quitable: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border-2 border-marca-oscuro bg-marca/10 p-3">
      <div>
        <p className="font-mono text-lg font-bold">{titulo}</p>
        <p className="text-sm text-suave">{detalle}</p>
      </div>
      {quitable && <Boton pequeno variante="secundario" onClick={alQuitar}>Cambiar</Boton>}
    </div>
  )
}

function ListaEleccion({ elementos, alElegir, vacio }: { elementos: { id: number; titulo: string; detalle: string }[]; alElegir: (id: number) => void; vacio: string }) {
  if (!elementos.length) return vacio ? <p className="mt-2 text-sm text-suave">{vacio}</p> : null
  return (
    <ul className="mt-2 max-h-60 divide-y divide-borde overflow-y-auto rounded-xl border border-borde">
      {elementos.slice(0, 20).map(e => (
        <li key={e.id}>
          <button type="button" onClick={() => alElegir(e.id)} className="w-full px-3 py-3 text-left hover:bg-fondo cursor-pointer">
            <span className="font-semibold">{e.titulo}</span> <span className="text-sm text-suave">{e.detalle}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
