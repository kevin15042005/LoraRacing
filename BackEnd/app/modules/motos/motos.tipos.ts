export interface Moto {
  id: number
  cliente_id: number
  placa: string
  marca: string | null
  modelo: string | null
  anio: number | null
  cilindraje: number | null
  color: string | null
  km_actual: number | null
  notas: string | null
  activo: number
  creado_en: string
}

/** Moto con el nombre y teléfono del dueño (para listas y búsquedas) */
export interface MotoConCliente extends Moto {
  cliente_nombre: string
  cliente_telefono: string | null
}
