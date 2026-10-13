// Inventario de repuestos: lista con filtros, crear/editar, compra, ajuste e historial
import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api, consulta } from '../api/cliente'
import type { EstadoStock, Movimiento, Repuesto } from '../api/tipos'
import { useGuardar } from '../api/useGuardar'
import { Desactivar } from '../componentes/Desactivar'
import { AvisoError, Boton, Buscador, Campo, Cargando, Encabezado, InsigniaStock, Modal, Opciones, Selector, Vacio } from '../componentes/ui'
import { cantidad, decimal, fechaHora, numero, pesos, texto } from '../utils/formato'

type FiltroEstado = '' | EstadoStock

export function Inventario() {
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState<FiltroEstado>('')
  const [categoria, setCategoria] = useState('')
  const [seleccionado, setSeleccionado] = useState<Repuesto | null>(null)
  const [creando, setCreando] = useState(false)

  const lista = useQuery({
    queryKey: ['repuestos', { q, estado, categoria }],
    queryFn: () => api.get<Repuesto[]>(`/repuestos${consulta({ q, estado, categoria })}`),
    placeholderData: anterior => anterior, // mientras busca, deja ver la lista anterior
  })
  const categorias = useQuery({ queryKey: ['repuestos', 'categorias'], queryFn: () => api.get<string[]>('/repuestos/categorias') })

  return (
    <>
      <Encabezado
        titulo="Inventario"
        subtitulo={lista.data ? `${lista.data.length} repuestos` : undefined}
        acciones={<Boton icono="mas2" onClick={() => setCreando(true)}>Nuevo repuesto</Boton>}
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Buscador valor={q} alCambiar={setQ} placeholder="Buscar por nombre, código o marca" />
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className="min-h-12 rounded-xl border border-borde bg-superficie px-3 sm:w-56"
          aria-label="Categoría"
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="mb-4">
        <Opciones<FiltroEstado>
          valor={estado}
          alCambiar={setEstado}
          opciones={[
            { valor: '', texto: 'Todos' },
            { valor: 'agotado', texto: 'Agotados' },
            { valor: 'por_agotarse', texto: 'Por agotarse' },
            { valor: 'suficiente', texto: 'Suficientes' },
          ]}
        />
      </div>

      <AvisoError error={lista.error} />
      {lista.isPending ? (
        <Cargando />
      ) : lista.data?.length === 0 ? (
        <Vacio texto={q || estado || categoria ? 'Ningún repuesto coincide con la búsqueda.' : 'Todavía no hay repuestos. Crea el primero.'} />
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {lista.data?.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSeleccionado(r)}
              className="rounded-2xl border border-borde bg-superficie p-4 text-left hover:border-marca cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{r.nombre}</p>
                  <p className="truncate text-sm text-suave">
                    {[r.codigo, r.marca, r.categoria].filter(Boolean).join(' · ') || 'Sin detalles'}
                  </p>
                </div>
                <InsigniaStock estado={r.estado} />
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="cifras text-2xl font-bold">
                  {cantidad(r.stock)} <span className="text-sm font-normal text-suave">{r.unidad}</span>
                </p>
                <p className="cifras font-semibold">{pesos(r.precio_venta)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal titulo="Nuevo repuesto" abierto={creando} alCerrar={() => setCreando(false)}>
        <FormRepuesto alTerminar={() => setCreando(false)} categorias={categorias.data ?? []} />
      </Modal>

      {seleccionado && (
        <DetalleRepuesto
          id={seleccionado.id}
          categorias={categorias.data ?? []}
          alCerrar={() => setSeleccionado(null)}
        />
      )}
    </>
  )
}

// ---------- Formulario crear / editar ----------
function FormRepuesto({ repuesto, categorias, alTerminar }: { repuesto?: Repuesto; categorias: string[]; alTerminar: () => void }) {
  const guardar = useGuardar(
    (datos: object) => (repuesto ? api.put(`/repuestos/${repuesto.id}`, datos) : api.post('/repuestos', datos)),
    { invalidar: ['repuestos', 'reportes'], alTerminar },
  )

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    guardar.mutate({
      codigo: texto(f.get('codigo')),
      nombre: texto(f.get('nombre')),
      categoria: texto(f.get('categoria')),
      marca: texto(f.get('marca')),
      unidad: texto(f.get('unidad')) ?? 'unidad',
      costo: numero(f.get('costo')) ?? 0,
      precio_venta: numero(f.get('precio_venta')) ?? 0,
      stock_minimo: decimal(f.get('stock_minimo')) ?? 1,
      ...(repuesto ? {} : { stock: decimal(f.get('stock')) ?? 0 }),
    })
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <AvisoError error={guardar.error} />
      <Campo etiqueta="Nombre *" name="nombre" required defaultValue={repuesto?.nombre} />
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Código" name="codigo" defaultValue={repuesto?.codigo ?? ''} />
        <Campo etiqueta="Marca" name="marca" defaultValue={repuesto?.marca ?? ''} />
        <Campo etiqueta="Categoría" name="categoria" list="lista-categorias" defaultValue={repuesto?.categoria ?? ''} />
        <Selector etiqueta="Unidad" name="unidad" defaultValue={repuesto?.unidad ?? 'unidad'}>
          {['unidad', 'litro', 'galón', 'juego', 'par', 'metro', 'kit'].map(u => <option key={u}>{u}</option>)}
        </Selector>
        <Campo etiqueta="Costo (lo que te cuesta)" name="costo" inputMode="numeric" defaultValue={repuesto?.costo ?? ''} placeholder="0" />
        <Campo etiqueta="Precio de venta" name="precio_venta" inputMode="numeric" defaultValue={repuesto?.precio_venta ?? ''} placeholder="0" />
        {!repuesto && <Campo etiqueta="Stock inicial" name="stock" inputMode="decimal" placeholder="0" />}
        <Campo etiqueta="Stock mínimo" name="stock_minimo" inputMode="decimal" defaultValue={repuesto?.stock_minimo ?? 1} ayuda="Avisa cuando quede esto o menos" />
      </div>
      <datalist id="lista-categorias">
        {categorias.map(c => <option key={c} value={c} />)}
      </datalist>
      <Boton type="submit" cargando={guardar.isPending} className="w-full">
        {repuesto ? 'Guardar cambios' : 'Crear repuesto'}
      </Boton>
    </form>
  )
}

// ---------- Detalle con pestañas ----------
type Pestana = 'compra' | 'ajuste' | 'historial' | 'editar'

function DetalleRepuesto({ id, categorias, alCerrar }: { id: number; categorias: string[]; alCerrar: () => void }) {
  const [pestana, setPestana] = useState<Pestana>('compra')
  const repuesto = useQuery({ queryKey: ['repuestos', id], queryFn: () => api.get<Repuesto>(`/repuestos/${id}`) })
  const r = repuesto.data

  return (
    <Modal titulo={r?.nombre ?? 'Repuesto'} abierto alCerrar={alCerrar}>
      {!r ? (
        <Cargando />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between rounded-xl bg-fondo p-3">
            <div>
              <p className="text-sm text-suave">Stock actual</p>
              <p className="cifras text-2xl font-bold">{cantidad(r.stock)} {r.unidad}</p>
            </div>
            <div className="text-right">
              <InsigniaStock estado={r.estado} />
              <p className="cifras mt-1 text-sm text-suave">Costo {pesos(r.costo)} · Venta {pesos(r.precio_venta)}</p>
            </div>
          </div>
          <div className="mb-4">
            <Opciones<Pestana>
              valor={pestana}
              alCambiar={setPestana}
              opciones={[
                { valor: 'compra', texto: 'Compra' },
                { valor: 'ajuste', texto: 'Ajuste' },
                { valor: 'historial', texto: 'Historial' },
                { valor: 'editar', texto: 'Editar' },
              ]}
            />
          </div>
          {pestana === 'compra' && <FormCompra repuesto={r} />}
          {pestana === 'ajuste' && <FormAjuste repuesto={r} />}
          {pestana === 'historial' && <Historial id={r.id} unidad={r.unidad} />}
          {pestana === 'editar' && (
            <>
              <FormRepuesto repuesto={r} categorias={categorias} alTerminar={() => setPestana('compra')} />
              <Desactivar ruta={`/repuestos/${r.id}`} que="repuesto" invalidar={['repuestos', 'reportes']} alTerminar={alCerrar} />
            </>
          )}
        </>
      )}
    </Modal>
  )
}

function FormCompra({ repuesto }: { repuesto: Repuesto }) {
  const [listo, setListo] = useState(false)
  const guardar = useGuardar((datos: object) => api.post(`/repuestos/${repuesto.id}/entrada`, datos), {
    invalidar: ['repuestos', 'reportes'],
    alTerminar: () => setListo(true),
  })

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setListo(false)
    guardar.mutate({ cantidad: decimal(f.get('cantidad')), costo: numero(f.get('costo')), nota: texto(f.get('nota')) })
    e.currentTarget.reset()
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <p className="text-sm text-suave">Registra la mercancía que llegó. Se suma al stock.</p>
      <AvisoError error={guardar.error} />
      {listo && <p className="rounded-xl bg-suficiente/10 p-3 text-sm text-suficiente">Compra registrada.</p>}
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta={`Cantidad (${repuesto.unidad}) *`} name="cantidad" inputMode="decimal" required />
        <Campo etiqueta="Costo unitario" name="costo" inputMode="numeric" placeholder={String(repuesto.costo)} ayuda="Vacío = el mismo de antes" />
      </div>
      <Campo etiqueta="Nota" name="nota" placeholder="Proveedor, factura..." />
      <Boton type="submit" cargando={guardar.isPending} className="w-full">Registrar compra</Boton>
    </form>
  )
}

function FormAjuste({ repuesto }: { repuesto: Repuesto }) {
  const [listo, setListo] = useState(false)
  const guardar = useGuardar((datos: object) => api.post(`/repuestos/${repuesto.id}/ajuste`, datos), {
    invalidar: ['repuestos', 'reportes'],
    alTerminar: () => setListo(true),
  })

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setListo(false)
    guardar.mutate({ stock_real: decimal(f.get('stock_real')), nota: texto(f.get('nota')) })
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <p className="text-sm text-suave">Después de contar en bodega, escribe cuánto hay realmente. El sistema registra la diferencia.</p>
      <AvisoError error={guardar.error} />
      {listo && <p className="rounded-xl bg-suficiente/10 p-3 text-sm text-suficiente">Stock ajustado.</p>}
      <Campo etiqueta={`Cantidad contada (${repuesto.unidad}) *`} name="stock_real" inputMode="decimal" required defaultValue={repuesto.stock} />
      <Campo etiqueta="Motivo *" name="nota" required placeholder="Conteo mensual, daño, pérdida..." />
      <Boton type="submit" cargando={guardar.isPending} className="w-full">Ajustar stock</Boton>
    </form>
  )
}

const NOMBRE_MOVIMIENTO = { entrada: 'Entrada', salida: 'Salida', ajuste: 'Ajuste', devolucion: 'Devolución' }

function Historial({ id, unidad }: { id: number; unidad: string }) {
  const movimientos = useQuery({ queryKey: ['repuestos', id, 'movimientos'], queryFn: () => api.get<Movimiento[]>(`/repuestos/${id}/movimientos`) })
  if (movimientos.isPending) return <Cargando />
  if (!movimientos.data?.length) return <Vacio texto="Sin movimientos todavía." />
  return (
    <ul className="divide-y divide-borde">
      {movimientos.data.map(m => (
        <li key={m.id} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="font-medium">{NOMBRE_MOVIMIENTO[m.tipo]}</p>
            <p className="truncate text-xs text-suave">{fechaHora(m.fecha)}{m.nota ? ` · ${m.nota}` : ''}</p>
          </div>
          <span className={`cifras shrink-0 font-semibold ${m.cantidad < 0 ? 'text-agotado' : 'text-suficiente'}`}>
            {m.cantidad > 0 ? '+' : ''}{cantidad(m.cantidad)} {unidad}
          </span>
        </li>
      ))}
    </ul>
  )
}
