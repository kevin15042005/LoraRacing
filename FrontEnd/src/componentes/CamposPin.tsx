import { Campo } from './ui'

/** PIN de recuperación que elige el usuario (se escribe dos veces) */
export function CamposPin({ etiqueta = 'PIN de recuperación' }: { etiqueta?: string }) {
  return (
    <div className="rounded-xl bg-fondo p-3">
      <p className="mb-2 text-sm text-suave">
        Elige un PIN de <strong>4 a 8 números</strong> fácil de recordar. Sirve para crear una contraseña nueva si olvidas la actual.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta={etiqueta} name="pin" type="password" required inputMode="numeric" pattern="[0-9]{4,8}" minLength={4} maxLength={8} autoComplete="off" title="De 4 a 8 números" />
        <Campo etiqueta="Repite el PIN" name="confirmarPin" type="password" required inputMode="numeric" pattern="[0-9]{4,8}" minLength={4} maxLength={8} autoComplete="off" title="De 4 a 8 números" />
      </div>
    </div>
  )
}
