// Error propio de la aplicación: lleva un código HTTP y un mensaje
export class ErrorApp extends Error {
  status: number

  constructor(status: number, mensaje: string) {
    super(mensaje)
    this.name = 'ErrorApp'
    this.status = status
  }
}

// Atajos para los errores más comunes
export const solicitudInvalida = (mensaje: string) => new ErrorApp(400, mensaje)
export const noAutorizado = (mensaje = 'Debes iniciar sesión') => new ErrorApp(401, mensaje)
export const noEncontrado = (que: string) => new ErrorApp(404, `No se encontró: ${que}`)
export const conflicto = (mensaje: string) => new ErrorApp(409, mensaje)