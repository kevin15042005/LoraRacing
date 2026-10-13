// Estructura de todas las pantallas privadas:
// - PC y tablet horizontal: menú negro a la izquierda.
// - Celular: barra inferior con lo más usado + botón "Más".
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useSesion } from '../auth/contexto'
import { Icono, type NombreIcono } from './iconos'
import { Modal } from './ui'

interface Enlace {
  a: string
  texto: string
  icono: NombreIcono
}

const PRINCIPALES: Enlace[] = [
  { a: '/', texto: 'Inicio', icono: 'inicio' },
  { a: '/ordenes', texto: 'Órdenes', icono: 'ordenes' },
  { a: '/inventario', texto: 'Inventario', icono: 'inventario' },
  { a: '/clientes', texto: 'Clientes', icono: 'clientes' },
]

const SECUNDARIOS: Enlace[] = [
  { a: '/motos', texto: 'Motos', icono: 'motos' },
  { a: '/mano-obra', texto: 'Mano de obra', icono: 'manoObra' },
  { a: '/reportes', texto: 'Reportes', icono: 'reportes' },
  { a: '/respaldos', texto: 'Respaldos', icono: 'respaldos' },
  { a: '/cuenta', texto: 'Mi cuenta', icono: 'cuenta' },
]

export function Layout() {
  const { usuario } = useSesion()
  const [masAbierto, setMasAbierto] = useState(false)

  return (
    <div className="min-h-dvh lg:flex">
      {/* Menú lateral (PC) */}
      <aside className="no-imprimir sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-menu text-white lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/logo.png" alt="" className="size-12" />
          <div>
            <p className="text-lg font-black italic leading-none tracking-tight">
              LORA<span className="text-marca">RACING</span>
            </p>
            <p className="text-xs font-semibold italic text-acento">PA' DAR LORA!</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {[...PRINCIPALES, ...SECUNDARIOS].map(e => (
            <NavLink
              key={e.a}
              to={e.a}
              end={e.a === '/'}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-3 font-medium transition-colors ${
                  isActive ? 'bg-marca text-texto' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icono nombre={e.icono} />
              {e.texto}
            </NavLink>
          ))}
        </nav>
        <p className="px-5 py-4 text-sm text-white/60">{usuario?.nombre}</p>
      </aside>

      {/* Barra superior (celular y tablet) */}
      <header className="no-imprimir sticky top-0 z-30 flex items-center gap-3 bg-menu px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-white lg:hidden">
        <img src="/logo.png" alt="" className="size-9" />
        <p className="font-black italic tracking-tight">
          LORA<span className="text-marca">RACING</span>
        </p>
      </header>

      {/* Contenido de cada pantalla */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-4 lg:px-8 lg:pb-8 lg:pt-6">
        <Outlet />
      </main>

      {/* Barra inferior (celular y tablet) */}
      <nav className="no-imprimir fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-menu pb-[env(safe-area-inset-bottom)] text-white lg:hidden">
        {PRINCIPALES.map(e => (
          <NavLink
            key={e.a}
            to={e.a}
            end={e.a === '/'}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${isActive ? 'text-marca' : 'text-white/70'}`
            }
          >
            <Icono nombre={e.icono} className="size-6" />
            {e.texto}
          </NavLink>
        ))}
        <button type="button" onClick={() => setMasAbierto(true)} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-white/70 cursor-pointer">
          <Icono nombre="mas" className="size-6" />
          Más
        </button>
      </nav>

      <Modal titulo="Más opciones" abierto={masAbierto} alCerrar={() => setMasAbierto(false)}>
        <div className="grid grid-cols-2 gap-2">
          {SECUNDARIOS.map(e => (
            <NavLink
              key={e.a}
              to={e.a}
              onClick={() => setMasAbierto(false)}
              className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-borde font-medium hover:bg-fondo"
            >
              <Icono nombre={e.icono} className="size-6" />
              {e.texto}
            </NavLink>
          ))}
        </div>
      </Modal>
    </div>
  )
}
