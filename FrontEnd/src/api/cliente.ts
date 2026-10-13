// Única puerta de entrada al BackEnd.
// - Agrega el token (Authorization: Bearer ...) a cada petición.
// - Si la API responde { error: "..." }, lanza un ErrorApi con ese mensaje.
// - Si la sesión venció (401), borra el token y avisa para volver al login.

const CLAVE_TOKEN = 'lora.token'

export const token = {
  leer: () => localStorage.getItem(CLAVE_TOKEN),
  guardar: (valor: string) => localStorage.setItem(CLAVE_TOKEN, valor),
  borrar: () => localStorage.removeItem(CLAVE_TOKEN),
}

export class ErrorApi extends Error {
  status: number
  constructor(status: number, mensaje: string) {
    super(mensaje)
    this.status = status
  }
}

// La sesión (auth/Sesion.tsx) registra aquí qué hacer cuando el token deja de servir
let alPerderSesion: () => void = () => {}
export function cuandoSePierdaLaSesion(funcion: () => void) {
  alPerderSesion = funcion
}

/** Arma los parámetros ?q=...&estado=... ignorando los vacíos */
export function consulta(filtros: Record<string, string | number | undefined | null>): string {
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '') params.set(clave, String(valor))
  }
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}

async function pedir(metodo: string, ruta: string, cuerpo?: unknown): Promise<Response> {
  const encabezados: Record<string, string> = {}
  const t = token.leer()
  if (t) encabezados.Authorization = `Bearer ${t}`
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json'

  let respuesta: Response
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorApi(0, 'No hay conexión con el servidor del taller. ¿Está encendido el PC?')
  }

  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => null)
    if (respuesta.status === 401 && t) {
      token.borrar()
      alPerderSesion()
    }
    throw new ErrorApi(respuesta.status, datos?.error ?? `Error ${respuesta.status}`)
  }
  return respuesta
}

async function pedirJson<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  const respuesta = await pedir(metodo, ruta, cuerpo)
  return (await respuesta.json()) as T
}

export const api = {
  get: <T>(ruta: string) => pedirJson<T>('GET', ruta),
  post: <T>(ruta: string, cuerpo: unknown = {}) => pedirJson<T>('POST', ruta, cuerpo),
  put: <T>(ruta: string, cuerpo: unknown) => pedirJson<T>('PUT', ruta, cuerpo),
  delete: <T>(ruta: string) => pedirJson<T>('DELETE', ruta),
  /** Para imágenes y archivos que necesitan token (firma, respaldos) */
  archivo: async (ruta: string) => (await pedir('GET', ruta)).blob(),
}

/** Descarga un archivo protegido con token (un <a href> normal no envía el token) */
export async function descargar(ruta: string, nombre: string) {
  const blob = await api.archivo(ruta)
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(url)
}
