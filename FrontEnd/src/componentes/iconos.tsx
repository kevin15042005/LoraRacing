// Íconos en SVG (trazos simples, sin librerías). Uso: <Icono nombre="inicio" />
const TRAZOS = {
  inicio: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5h4v5',
  ordenes: 'M8 4h8M9 2h6v4H9zM6 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-1M8 11h8M8 15h5',
  inventario: 'M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9',
  clientes: 'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-1.5a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8',
  motos: 'M5 17.5a3 3 0 1 0 0-.01M19 17.5a3 3 0 1 0 0-.01M5 17.5h4l4-6h4l2 6M13 11.5 11 7H8M15 7h3',
  manoObra: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
  reportes: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  respaldos: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  cuenta: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0',
  mas: 'M5 12h.01M12 12h.01M19 12h.01',
  mas2: 'M12 5v14M5 12h14',
  cerrar: 'M6 6l12 12M18 6 6 18',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-4-4',
  atras: 'M15 18l-6-6 6-6',
  editar: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  basura: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  alerta: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0',
  check: 'M5 12.5 10 17 19 7',
  firma: 'M3 17c3-1 4-8 6-8s0 7 2 7 2-3 4-3 2 2 6 2M3 21h18',
  imprimir: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z',
  descargar: 'M12 3v12M7 10l5 5 5-5M4 21h16',
  salir: 'M15 4h4v16h-4M10 17l5-5-5-5M15 12H3',
} as const

export type NombreIcono = keyof typeof TRAZOS

export function Icono({ nombre, className = 'size-5' }: { nombre: NombreIcono; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={nombre === 'mas' ? 3 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  )
}
