// Lienzo para que el cliente firme con el dedo, lápiz o mouse.
// Usa "pointer events", que sirven igual para toque y mouse.
// alCambiar recibe la firma como texto PNG ("data:image/png;base64,...") o null si está vacía.
import { useEffect, useRef, type PointerEvent } from 'react'
import { Boton } from './ui'

export function Firma({ alCambiar }: { alCambiar: (png: string | null) => void }) {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const dibujando = useRef(false)
  const hayTrazos = useRef(false)

  // Ajusta la resolución del lienzo a la pantalla (para que el trazo no se vea borroso)
  useEffect(() => {
    const c = lienzo.current!
    const escala = window.devicePixelRatio || 1
    c.width = c.offsetWidth * escala
    c.height = c.offsetHeight * escala
    const ctx = c.getContext('2d')!
    ctx.scale(escala, escala)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#111111'
  }, [])

  function punto(e: PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function empezar(e: PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dibujando.current = true
    const ctx = e.currentTarget.getContext('2d')!
    const p = punto(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + 0.1, p.y + 0.1) // un toque deja un punto
    ctx.stroke()
  }

  function mover(e: PointerEvent<HTMLCanvasElement>) {
    if (!dibujando.current) return
    const ctx = e.currentTarget.getContext('2d')!
    const p = punto(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  function terminar() {
    if (!dibujando.current) return
    dibujando.current = false
    hayTrazos.current = true
    alCambiar(lienzo.current!.toDataURL('image/png'))
  }

  function borrar() {
    const c = lienzo.current!
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    hayTrazos.current = false
    alCambiar(null)
  }

  return (
    <div>
      <div className="relative">
        <canvas
          ref={lienzo}
          onPointerDown={empezar}
          onPointerMove={mover}
          onPointerUp={terminar}
          onPointerCancel={terminar}
          // touch-none evita que la página se desplace mientras se firma
          className="h-56 w-full touch-none rounded-xl border-2 border-dashed border-borde bg-white"
          aria-label="Espacio para la firma del cliente"
        />
        <span className="pointer-events-none absolute bottom-10 left-6 right-6 border-b border-gray-300" />
        <span className="pointer-events-none absolute bottom-3 left-6 text-xs text-suave">Firme sobre la línea</span>
      </div>
      <div className="mt-2 flex justify-end">
        <Boton variante="secundario" pequeno onClick={borrar}>
          Borrar firma
        </Boton>
      </div>
    </div>
  )
}
