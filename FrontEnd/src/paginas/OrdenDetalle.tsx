// Detalle de una orden: agregar líneas, precio manual, descuento, cortesía, cerrar y anular
import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, consulta } from '../api/cliente'
import type { ManoObra, OrdenDetalle as TipoOrdenDetalle, OrdenItem, Repuesto } from '../api/tipos'
import { useGuardar } from '../api/useGuardar'
import { CampoMecanico } from '../componentes/CampoMecanico'
import { Icono } from '../componentes/iconos'
import {
  AreaTexto, AvisoError, Boton, Buscador, Campo, Cargando, Dato, Encabezado, InsigniaOrden, InsigniaStock,
  Interruptor, Modal, Opciones, Tarjeta,
} from '../componentes/ui'
import { cantidad, decimal, fechaHora, numero, pesos, texto } from '../utils/formato'

// Lo que se invalida cada vez que cambia una orden
const AFECTA = ['ordenes', 'repuestos', 'reportes', 'clientes']

export function OrdenDetalle() {
  const id = Number(useParams().id)
  const [editandoDatos, setEditandoDatos] = useState(false)
  const [editandoLinea, setEditandoLinea] = useState<OrdenItem | null>(null)
  const [cerrando, setCerrando] = useState(false)
  const [anulando, setAnulando] = useState(false)

  const orden = useQuery({ queryKey: ['ordenes', 'detalle', id], queryFn: () => api.get<TipoOrdenDetalle>(`/ordenes/${id}`) })

  const cambiarCobro = useGuardar(
    (item: OrdenItem) => api.put(`/ordenes/${id}/items/${item.id}`, { cobrar: !item.cobrar }),
    { invalidar: AFECTA },
  )
  const quitar = useGuardar((item: OrdenItem) => api.delete(`/ordenes/${id}/items/${item.id}`), { invalidar: AFECTA })

  if (orden.isPending) return <Cargando />
  if (!orden.data) return <AvisoError error={orden.error} />
  const o = orden.data
  const abierta = o.estado === 'abierta'

  return (
    <>
      <Link to="/ordenes" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-suave">
        <Icono nombre="atras" className="size-4" /> Órdenes
      </Link>
      <Encabezado
        titulo={`Orden #${o.id}`}
        subtitulo={`${o.tipo === 'venta' ? 'Venta' : 'Mantenimiento'} · ${fechaHora(o.fecha)}`}
        acciones={<InsigniaOrden estado={o.estado} />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {/* Datos de la moto y el cliente */}
          <Tarjeta>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {o.placa && <p className="font-mono text-2xl font-bold">{o.placa}</p>}
                <p className="text-suave">{[o.moto_marca, o.moto_modelo].filter(Boolean).join(' ')}</p>
                {o.cliente_id ? (
                  <Link to={`/clientes/${o.cliente_id}`} className="font-semibold text-marca-oscuro">
                    {o.cliente_nombre}
                  </Link>
                ) : (
                  <p className="font-semibold">Cliente de mostrador</p>
                )}
                {o.cliente_telefono && <p className="text-sm text-suave">{o.cliente_telefono}</p>}
              </div>
              {abierta && <Boton pequeno variante="secundario" icono="editar" onClick={() => setEditandoDatos(true)}>Editar</Boton>}
            </div>
            {(o.km || o.diagnostico || o.notas || o.mecanico) && (
              <div className="mt-3 space-y-1 border-t border-borde pt-3 text-sm">
                {o.mecanico && <p><span className="text-suave">Realizado por:</span> <strong>{o.mecanico}</strong></p>}
                {o.km && <p><span className="text-suave">Kilometraje:</span> {o.km.toLocaleString('es-CO')} km</p>}
                {o.diagnostico && <p><span className="text-suave">Diagnóstico:</span> {o.diagnostico}</p>}
                {o.notas && <p><span className="text-suave">Notas:</span> {o.notas}</p>}
              </div>
            )}
            {o.estado === 'anulada' && (
              <p className="mt-3 rounded-xl bg-gray-100 p-3 text-sm">Anulada el {fechaHora(o.anulada_en)}. Motivo: {o.motivo_anulacion}</p>
            )}
          </Tarjeta>

          {/* Líneas */}
          <Tarjeta>
            <h2 className="mb-2 font-bold">Repuestos y trabajos</h2>
            <AvisoError error={cambiarCobro.error ?? quitar.error} />
            {o.items.length === 0 ? (
              <p className="py-4 text-center text-suave">Todavía no hay líneas. Agrégalas abajo.</p>
            ) : (
              <ul className="divide-y divide-borde">
                {o.items.map(item => (
                  <Linea
                    key={item.id}
                    item={item}
                    editable={abierta}
                    alEditar={() => setEditandoLinea(item)}
                    alCambiarCobro={() => cambiarCobro.mutate(item)}
                    alQuitar={() => quitar.mutate(item)}
                  />
                ))}
              </ul>
            )}
          </Tarjeta>

          {abierta && <AgregarLinea ordenId={o.id} />}
        </div>

        {/* Totales y acciones */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Tarjeta>
            <Dato etiqueta="Valor sin descuentos" valor={pesos(o.resumen.bruto)} />
            <Dato etiqueta="Descuentos" valor={`− ${pesos(o.resumen.descuentos)}`} />
            <Dato etiqueta="Cortesías (no cobradas)" valor={`− ${pesos(o.resumen.cortesias)}`} />
            <div className="my-2 border-t border-borde" />
            <Dato etiqueta="Total a cobrar" valor={pesos(o.resumen.total)} fuerte />
            <div className="mt-3 rounded-xl bg-fondo p-3 text-sm">
              <Dato etiqueta="Costo de repuestos y otros" valor={pesos(o.resumen.costo)} />
              <Dato etiqueta="Ganancia" valor={<span className={o.resumen.ganancia < 0 ? 'text-agotado' : 'text-marca-oscuro'}>{pesos(o.resumen.ganancia)}</span>} />
            </div>
          </Tarjeta>

          <div className="space-y-2">
            {abierta && (
              <Boton className="w-full" icono="check" disabled={o.items.length === 0} onClick={() => setCerrando(true)}>
                Cerrar orden
              </Boton>
            )}
            {o.estado === 'cerrada' && (
              <Link to={`/ordenes/${o.id}/entrega`} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-marca font-semibold hover:bg-marca-oscuro hover:text-white">
                <Icono nombre="firma" /> Entregar con firma
              </Link>
            )}
            {o.estado === 'entregada' && (
              <Link to={`/ordenes/${o.id}/comprobante`} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-menu font-semibold text-white">
                <Icono nombre="imprimir" /> Ver comprobante
              </Link>
            )}
            {(abierta || o.estado === 'cerrada') && (
              <Boton variante="secundario" className="w-full !text-agotado" onClick={() => setAnulando(true)}>
                Anular orden
              </Boton>
            )}
          </div>
        </div>
      </div>

      <Modal titulo="Editar datos de la orden" abierto={editandoDatos} alCerrar={() => setEditandoDatos(false)}>
        <FormDatos orden={o} alTerminar={() => setEditandoDatos(false)} />
      </Modal>
      <Modal titulo={editandoLinea?.descripcion ?? ''} abierto={editandoLinea !== null} alCerrar={() => setEditandoLinea(null)}>
        {editandoLinea && <FormEditarLinea ordenId={o.id} item={editandoLinea} alTerminar={() => setEditandoLinea(null)} />}
      </Modal>
      <Modal titulo="Cerrar orden" abierto={cerrando} alCerrar={() => setCerrando(false)}>
        <ConfirmarCierre orden={o} alTerminar={() => setCerrando(false)} />
      </Modal>
      <Modal titulo="Anular orden" abierto={anulando} alCerrar={() => setAnulando(false)}>
        <FormAnular orden={o} alTerminar={() => setAnulando(false)} />
      </Modal>
    </>
  )
}

// ---------- Una línea de la orden ----------
const NOMBRE_TIPO = { repuesto: 'Repuesto', mano_obra: 'Mano de obra', otro: 'Otro' }

function Linea({ item, editable, alEditar, alCambiarCobro, alQuitar }: {
  item: OrdenItem
  editable: boolean
  alEditar: () => void
  alCambiarCobro: () => void
  alQuitar: () => void
}) {
  const cobrar = item.cobrar === 1
  const precioCambiado = item.precio_unitario !== item.precio_estandar && item.tipo !== 'otro'

  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{item.descripcion}</p>
          <p className="cifras text-sm text-suave">
            {NOMBRE_TIPO[item.tipo]} · {cantidad(item.cantidad)} × {pesos(item.precio_unitario)}
            {precioCambiado && <span className="ml-1 line-through">{pesos(item.precio_estandar)}</span>}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {item.descuento > 0 && cobrar && (
              <span className="rounded-full bg-acento/40 px-2 text-xs font-semibold">Descuento {pesos(item.descuento)}</span>
            )}
            {!cobrar && <span className="rounded-full bg-secundario/10 px-2 text-xs font-semibold text-secundario">Cortesía · no se cobra</span>}
          </div>
        </div>
        <p className={`cifras shrink-0 text-lg font-bold ${cobrar ? '' : 'text-suave'}`}>{pesos(item.total)}</p>
      </div>
      {editable && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <Interruptor activo={cobrar} alCambiar={alCambiarCobro} etiqueta="Cobrar" />
          <div className="flex gap-2">
            <Boton pequeno variante="secundario" icono="editar" onClick={alEditar}>Editar</Boton>
            <Boton pequeno variante="secundario" icono="basura" onClick={alQuitar} aria-label="Quitar línea" />
          </div>
        </div>
      )}
    </li>
  )
}

// ---------- Agregar líneas ----------
type TipoLinea = 'repuesto' | 'mano_obra' | 'otro'

interface Elegido {
  tipo: 'repuesto' | 'mano_obra'
  id: number
  nombre: string
  precio: number
  detalle: string
}

function AgregarLinea({ ordenId }: { ordenId: number }) {
  const [tipo, setTipo] = useState<TipoLinea>('repuesto')
  const [q, setQ] = useState('')
  const [elegido, setElegido] = useState<Elegido | null>(null)

  const repuestos = useQuery({
    queryKey: ['repuestos', { q, estado: '', categoria: '' }],
    queryFn: () => api.get<Repuesto[]>(`/repuestos${consulta({ q })}`),
    enabled: tipo === 'repuesto' && !elegido,
    placeholderData: anterior => anterior,
  })
  const trabajos = useQuery({
    queryKey: ['mano-obra', q],
    queryFn: () => api.get<ManoObra[]>(`/mano-obra${consulta({ q })}`),
    enabled: tipo === 'mano_obra' && !elegido,
    placeholderData: anterior => anterior,
  })

  function cambiarTipo(nuevo: TipoLinea) {
    setTipo(nuevo)
    setQ('')
    setElegido(null)
  }

  function terminar() {
    setElegido(null)
    setQ('')
  }

  return (
    <Tarjeta>
      <h2 className="mb-3 font-bold">Agregar a la orden</h2>
      <div className="mb-3">
        <Opciones<TipoLinea>
          valor={tipo}
          alCambiar={cambiarTipo}
          opciones={[
            { valor: 'repuesto', texto: 'Repuesto' },
            { valor: 'mano_obra', texto: 'Mano de obra' },
            { valor: 'otro', texto: 'Otro' },
          ]}
        />
      </div>

      {tipo === 'otro' ? (
        <FormLinea ordenId={ordenId} alTerminar={terminar} />
      ) : elegido ? (
        <>
          <div className="mb-3 flex items-center justify-between rounded-xl border-2 border-marca-oscuro bg-marca/10 p-3">
            <div>
              <p className="font-semibold">{elegido.nombre}</p>
              <p className="text-sm text-suave">{elegido.detalle}</p>
            </div>
            <Boton pequeno variante="secundario" onClick={() => setElegido(null)}>Cambiar</Boton>
          </div>
          <FormLinea ordenId={ordenId} elegido={elegido} alTerminar={terminar} />
        </>
      ) : (
        <>
          <Buscador valor={q} alCambiar={setQ} placeholder={tipo === 'repuesto' ? 'Buscar repuesto' : 'Buscar trabajo'} />
          <ul className="mt-2 max-h-72 divide-y divide-borde overflow-y-auto rounded-xl border border-borde">
            {tipo === 'repuesto' &&
              repuestos.data?.slice(0, 30).map(r => (
                <li key={r.id}>
                  <button
                    type="button"
                    disabled={r.stock <= 0}
                    onClick={() => setElegido({ tipo: 'repuesto', id: r.id, nombre: r.nombre, precio: r.precio_venta, detalle: `Hay ${cantidad(r.stock)} ${r.unidad} · ${pesos(r.precio_venta)}` })}
                    className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left hover:bg-fondo disabled:opacity-50 cursor-pointer"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{r.nombre}</span>
                      <span className="cifras text-sm text-suave">{cantidad(r.stock)} {r.unidad} · {pesos(r.precio_venta)}</span>
                    </span>
                    <InsigniaStock estado={r.estado} />
                  </button>
                </li>
              ))}
            {tipo === 'mano_obra' &&
              trabajos.data?.slice(0, 30).map(m => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setElegido({ tipo: 'mano_obra', id: m.id, nombre: m.nombre, precio: m.precio, detalle: `Precio estándar ${pesos(m.precio)}` })}
                    className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left hover:bg-fondo cursor-pointer"
                  >
                    <span className="font-semibold">{m.nombre}</span>
                    <span className="cifras text-sm">{pesos(m.precio)}</span>
                  </button>
                </li>
              ))}
          </ul>
          {tipo === 'repuesto' && repuestos.data?.length === 0 && <p className="mt-2 text-sm text-suave">No hay repuestos con ese nombre.</p>}
          {tipo === 'mano_obra' && trabajos.data?.length === 0 && <p className="mt-2 text-sm text-suave">No hay trabajos. Créalos en "Mano de obra".</p>}
        </>
      )}
    </Tarjeta>
  )
}

/** Formulario de la línea nueva. Sin "elegido" es una línea tipo "otro". */
function FormLinea({ ordenId, elegido, alTerminar }: { ordenId: number; elegido?: Elegido; alTerminar: () => void }) {
  const [cobrar, setCobrar] = useState(true)
  const agregar = useGuardar((datos: object) => api.post(`/ordenes/${ordenId}/items`, datos), { invalidar: AFECTA, alTerminar })

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const comunes = {
      cantidad: decimal(f.get('cantidad')) ?? 1,
      precio_unitario: numero(f.get('precio_unitario')),
      descuento: numero(f.get('descuento')) ?? 0,
      cobrar,
    }
    if (!elegido) {
      agregar.mutate({ tipo: 'otro', descripcion: texto(f.get('descripcion')), costo_unitario: numero(f.get('costo_unitario')) ?? 0, ...comunes })
    } else if (elegido.tipo === 'repuesto') {
      agregar.mutate({ tipo: 'repuesto', repuesto_id: elegido.id, ...comunes })
    } else {
      agregar.mutate({ tipo: 'mano_obra', mano_obra_id: elegido.id, ...comunes })
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <AvisoError error={agregar.error} />
      {!elegido && <Campo etiqueta="Descripción *" name="descripcion" required placeholder="Torneado de disco, pintura..." />}
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Cantidad" name="cantidad" inputMode="decimal" defaultValue="1" required />
        <Campo
          etiqueta={elegido ? 'Precio unitario' : 'Precio unitario *'}
          name="precio_unitario"
          inputMode="numeric"
          required={!elegido}
          placeholder={elegido ? String(elegido.precio) : ''}
          ayuda={elegido ? 'Vacío = precio estándar' : undefined}
        />
        <Campo etiqueta="Descuento ($)" name="descuento" inputMode="numeric" placeholder="0" />
        {!elegido && <Campo etiqueta="Costo para el taller" name="costo_unitario" inputMode="numeric" placeholder="0" />}
      </div>
      <Interruptor activo={cobrar} alCambiar={setCobrar} etiqueta={cobrar ? 'Cobrar' : 'No cobrar (cortesía)'} />
      <Boton type="submit" icono="mas2" cargando={agregar.isPending} className="w-full">Agregar</Boton>
    </form>
  )
}

function FormEditarLinea({ ordenId, item, alTerminar }: { ordenId: number; item: OrdenItem; alTerminar: () => void }) {
  const [cobrar, setCobrar] = useState(item.cobrar === 1)
  const guardar = useGuardar((datos: object) => api.put(`/ordenes/${ordenId}/items/${item.id}`, datos), { invalidar: AFECTA, alTerminar })

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    guardar.mutate({
      descripcion: texto(f.get('descripcion')) ?? undefined,
      cantidad: decimal(f.get('cantidad')),
      precio_unitario: numero(f.get('precio_unitario')) ?? 0,
      descuento: numero(f.get('descuento')) ?? 0,
      cobrar,
    })
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <AvisoError error={guardar.error} />
      <Campo etiqueta="Descripción" name="descripcion" defaultValue={item.descripcion} />
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Cantidad" name="cantidad" inputMode="decimal" defaultValue={item.cantidad} required />
        <Campo
          etiqueta="Precio unitario"
          name="precio_unitario"
          inputMode="numeric"
          defaultValue={item.precio_unitario}
          ayuda={item.tipo !== 'otro' ? `Estándar: ${pesos(item.precio_estandar)}` : undefined}
        />
        <Campo etiqueta="Descuento ($)" name="descuento" inputMode="numeric" defaultValue={item.descuento} />
      </div>
      <Interruptor activo={cobrar} alCambiar={setCobrar} etiqueta={cobrar ? 'Cobrar' : 'No cobrar (cortesía)'} />
      <Boton type="submit" cargando={guardar.isPending} className="w-full">Guardar cambios</Boton>
    </form>
  )
}

// ---------- Datos, cierre y anulación ----------
function FormDatos({ orden, alTerminar }: { orden: TipoOrdenDetalle; alTerminar: () => void }) {
  const guardar = useGuardar((datos: object) => api.put(`/ordenes/${orden.id}`, datos), { invalidar: AFECTA, alTerminar })

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    guardar.mutate({
      // Se reenvían moto y cliente para no perderlos
      cliente_id: orden.cliente_id,
      moto_id: orden.moto_id,
      km: numero(f.get('km')) ?? null,
      diagnostico: texto(f.get('diagnostico')),
      notas: texto(f.get('notas')),
      mecanico: texto(f.get('mecanico')),
    })
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <AvisoError error={guardar.error} />
      <CampoMecanico valorInicial={orden.mecanico} />
      {orden.tipo === 'mantenimiento' && <Campo etiqueta="Kilometraje" name="km" inputMode="numeric" defaultValue={orden.km ?? ''} />}
      {orden.tipo === 'mantenimiento' && <AreaTexto etiqueta="Diagnóstico" name="diagnostico" defaultValue={orden.diagnostico ?? ''} />}
      <AreaTexto etiqueta="Notas" name="notas" defaultValue={orden.notas ?? ''} />
      <Boton type="submit" cargando={guardar.isPending} className="w-full">Guardar</Boton>
    </form>
  )
}

function ConfirmarCierre({ orden, alTerminar }: { orden: TipoOrdenDetalle; alTerminar: () => void }) {
  const cerrar = useGuardar(() => api.post(`/ordenes/${orden.id}/cerrar`), { invalidar: AFECTA, alTerminar })
  const repuestos = orden.items.filter(i => i.tipo === 'repuesto')

  return (
    <div className="space-y-3">
      <AvisoError error={cerrar.error} />
      <p>
        Total a cobrar: <strong className="cifras text-xl">{pesos(orden.resumen.total)}</strong>
      </p>
      {repuestos.length > 0 && (
        <div className="rounded-xl bg-fondo p-3 text-sm">
          <p className="mb-1 font-semibold">Se descontará del inventario:</p>
          <ul className="list-disc pl-5">
            {repuestos.map(i => <li key={i.id}>{cantidad(i.cantidad)} × {i.descripcion}</li>)}
          </ul>
        </div>
      )}
      {orden.tipo === 'mantenimiento' && !orden.mecanico && (
        <p className="rounded-xl bg-acento/30 p-3 text-sm">
          No indicaste quién realizó el trabajo. Si quieres que quede registrado, vuelve y usa "Editar" antes de cerrar.
        </p>
      )}
      <p className="text-sm text-suave">Después de cerrarla ya no se pueden cambiar las líneas ni los datos. Queda lista para entregar con firma.</p>
      <div className="grid grid-cols-2 gap-2">
        <Boton variante="secundario" onClick={alTerminar}>Volver</Boton>
        <Boton icono="check" cargando={cerrar.isPending} onClick={() => cerrar.mutate(undefined)}>Cerrar orden</Boton>
      </div>
    </div>
  )
}

function FormAnular({ orden, alTerminar }: { orden: TipoOrdenDetalle; alTerminar: () => void }) {
  const anular = useGuardar((motivo: string | null) => api.post(`/ordenes/${orden.id}/anular`, { motivo }), { invalidar: AFECTA, alTerminar })

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    anular.mutate(texto(new FormData(e.currentTarget).get('motivo')))
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <AvisoError error={anular.error} />
      {orden.estado === 'cerrada' && (
        <p className="rounded-xl bg-acento/30 p-3 text-sm">Esta orden ya estaba cerrada: los repuestos vuelven al inventario.</p>
      )}
      <AreaTexto etiqueta="Motivo *" name="motivo" required />
      <Boton type="submit" variante="peligro" cargando={anular.isPending} className="w-full">Anular orden</Boton>
    </form>
  )
}
