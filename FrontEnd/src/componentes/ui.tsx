// Piezas de interfaz reutilizables. Botones y campos grandes (mínimo 48 px de alto)
// para usarlos cómodos con el dedo en el celular y la tablet.
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import type { EstadoOrden, EstadoStock } from '../api/tipos'
import { Icono, type NombreIcono } from './iconos'

// ---------- Botón ----------
const VARIANTES = {
  principal: 'bg-marca text-texto hover:bg-marca-oscuro hover:text-white',
  secundario: 'bg-superficie text-texto border border-borde hover:bg-fondo',
  peligro: 'bg-agotado text-white hover:bg-red-700',
  oscuro: 'bg-menu text-white hover:bg-black',
  fantasma: 'text-texto hover:bg-black/5',
}

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: keyof typeof VARIANTES
  icono?: NombreIcono
  cargando?: boolean
  pequeno?: boolean
}

export function Boton({ variante = 'principal', icono, cargando, pequeno, className = '', children, disabled, ...resto }: PropsBoton) {
  return (
    <button
      type="button"
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${pequeno ? 'min-h-10 px-3 text-sm' : 'min-h-12 px-4'} ${VARIANTES[variante]} ${className}`}
      {...resto}
    >
      {icono && <Icono nombre={icono} />}
      {cargando ? 'Guardando...' : children}
    </button>
  )
}

// ---------- Campos de formulario ----------
const estiloCampo =
  'w-full min-h-12 rounded-xl border border-borde bg-superficie px-3 text-base outline-none focus:border-marca-oscuro focus:ring-2 focus:ring-marca/40'

interface PropsEtiqueta {
  etiqueta: string
  ayuda?: string
}

export function Campo({ etiqueta, ayuda, className = '', ...resto }: PropsEtiqueta & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-suave">{etiqueta}</span>
      <input className={estiloCampo} {...resto} />
      {ayuda && <span className="mt-1 block text-xs text-suave">{ayuda}</span>}
    </label>
  )
}

export function Selector({ etiqueta, ayuda, className = '', children, ...resto }: PropsEtiqueta & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-suave">{etiqueta}</span>
      <select className={estiloCampo} {...resto}>
        {children}
      </select>
      {ayuda && <span className="mt-1 block text-xs text-suave">{ayuda}</span>}
    </label>
  )
}

export function AreaTexto({ etiqueta, className = '', ...resto }: PropsEtiqueta & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-suave">{etiqueta}</span>
      <textarea className={`${estiloCampo} py-2`} rows={3} {...resto} />
    </label>
  )
}

/** Caja de búsqueda con lupa */
export function Buscador({ valor, alCambiar, placeholder }: { valor: string; alCambiar: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block flex-1">
      <span className="sr-only">{placeholder}</span>
      <Icono nombre="buscar" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-suave" />
      <input
        type="search"
        value={valor}
        onChange={e => alCambiar(e.target.value)}
        placeholder={placeholder}
        className={`${estiloCampo} pl-10`}
      />
    </label>
  )
}

/** Interruptor encendido/apagado (por ejemplo "Cobrar") */
export function Interruptor({ activo, alCambiar, etiqueta, deshabilitado }: { activo: boolean; alCambiar: (v: boolean) => void; etiqueta: string; deshabilitado?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      disabled={deshabilitado}
      onClick={() => alCambiar(!activo)}
      className="inline-flex min-h-10 items-center gap-2 text-sm font-medium disabled:opacity-50 cursor-pointer"
    >
      <span className={`relative h-7 w-12 rounded-full transition-colors ${activo ? 'bg-marca-oscuro' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${activo ? 'left-6' : 'left-1'}`} />
      </span>
      {etiqueta}
    </button>
  )
}

/** Grupo de opciones tipo "pestañas" para filtros */
export function Opciones<T extends string>({ opciones, valor, alCambiar }: { opciones: { valor: T; texto: string }[]; valor: T; alCambiar: (v: T) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {opciones.map(o => (
        <button
          key={o.valor}
          type="button"
          onClick={() => alCambiar(o.valor)}
          className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium border cursor-pointer transition-colors ${
            valor === o.valor ? 'bg-menu text-white border-menu' : 'bg-superficie border-borde hover:bg-fondo'
          }`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  )
}

// ---------- Contenedores ----------
/** oscura = fondo negro como el logo (para destacar la ganancia) */
export function Tarjeta({ children, className = '', oscura }: { children: ReactNode; className?: string; oscura?: boolean }) {
  const fondo = oscura ? 'border-menu bg-menu text-white' : 'border-borde bg-superficie'
  return <section className={`rounded-2xl border p-4 ${fondo} ${className}`}>{children}</section>
}

export function Encabezado({ titulo, subtitulo, acciones }: { titulo: string; subtitulo?: ReactNode; acciones?: ReactNode }) {
  return (
    <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{titulo}</h1>
        {subtitulo && <p className="text-suave">{subtitulo}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </header>
  )
}

/** Ventana emergente. En celular sale desde abajo; en PC, centrada. */
export function Modal({ titulo, abierto, alCerrar, children }: { titulo: string; abierto: boolean; alCerrar: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!abierto) return
    const conTecla = (e: KeyboardEvent) => e.key === 'Escape' && alCerrar()
    window.addEventListener('keydown', conTecla)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', conTecla)
      document.body.style.overflow = ''
    }
  }, [abierto, alCerrar])

  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={alCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={e => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-superficie sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-borde px-4 py-3">
          <h2 className="text-lg font-bold">{titulo}</h2>
          <button type="button" onClick={alCerrar} className="rounded-lg p-2 hover:bg-fondo cursor-pointer" aria-label="Cerrar">
            <Icono nombre="cerrar" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  )
}

// ---------- Estados ----------
const ESTILO_STOCK: Record<EstadoStock, { clase: string; texto: string }> = {
  agotado: { clase: 'bg-agotado/10 text-agotado border-agotado/30', texto: 'Agotado' },
  por_agotarse: { clase: 'bg-por-agotarse/15 text-yellow-800 border-por-agotarse/40', texto: 'Por agotarse' },
  suficiente: { clase: 'bg-suficiente/10 text-suficiente border-suficiente/30', texto: 'Suficiente' },
}

export function InsigniaStock({ estado }: { estado: EstadoStock }) {
  const e = ESTILO_STOCK[estado]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${e.clase}`}>
      <span className="size-2 rounded-full bg-current" />
      {e.texto}
    </span>
  )
}

const ESTILO_ORDEN: Record<EstadoOrden, string> = {
  abierta: 'bg-secundario/10 text-secundario border-secundario/30',
  cerrada: 'bg-pico/15 text-orange-800 border-pico/40',
  entregada: 'bg-suficiente/10 text-suficiente border-suficiente/30',
  anulada: 'bg-gray-100 text-gray-500 border-gray-300 line-through',
}

export function InsigniaOrden({ estado }: { estado: EstadoOrden }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${ESTILO_ORDEN[estado]}`}>
      {estado === 'cerrada' ? 'por entregar' : estado}
    </span>
  )
}

export function Cargando({ texto = 'Cargando...' }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-8 text-suave">
      <span className="size-5 animate-spin rounded-full border-2 border-marca border-t-transparent" />
      {texto}
    </div>
  )
}

/** Muestra el mensaje { error } de la API */
export function AvisoError({ error }: { error: unknown }) {
  if (!error) return null
  const mensaje = error instanceof Error ? error.message : String(error)
  return (
    <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-agotado/30 bg-agotado/10 p-3 text-sm text-agotado">
      <Icono nombre="alerta" className="mt-0.5 size-5 shrink-0" />
      <span>{mensaje}</span>
    </div>
  )
}

export function Vacio({ texto, children }: { texto: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-borde p-8 text-center text-suave">
      <p>{texto}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

/** Fila "Etiqueta ........ valor" para resúmenes */
export function Dato({ etiqueta, valor, fuerte }: { etiqueta: string; valor: ReactNode; fuerte?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1 ${fuerte ? 'text-lg font-bold' : ''}`}>
      <span className={fuerte ? '' : 'text-suave'}>{etiqueta}</span>
      <span className="cifras text-right">{valor}</span>
    </div>
  )
}
