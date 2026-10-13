export interface ManoObra {
  id: number
  nombre: string
  descripcion: string | null
  precio: number // precio estándar en pesos
  activo: number
  creado_en: string
}
