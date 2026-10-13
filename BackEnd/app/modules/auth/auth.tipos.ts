// Cómo luce un usuario (sin la contraseña)
export interface Usuario {
  id: number
  usuario: string
  nombre: string
  creado_en: string
  tiene_pin: boolean // ¿ya tiene PIN de recuperación?
}

// Usuario tal como está en la base de datos (con contraseña y PIN cifrados)
export interface UsuarioConClave extends Omit<Usuario, 'tiene_pin'> {
  hash: string
  sal: string
  pin_hash: string | null
  pin_sal: string | null
  intentos_pin: number
  bloqueado_hasta: string | null
}

export interface RespuestaLogin {
  token: string
  expira_en: string
  usuario: Usuario
}
