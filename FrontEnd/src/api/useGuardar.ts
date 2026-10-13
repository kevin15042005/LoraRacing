// Atajo para guardar cambios: llama a la API y, si sale bien,
// marca como "viejos" los datos indicados para que se vuelvan a pedir.
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useGuardar<Datos, Respuesta>(
  funcion: (datos: Datos) => Promise<Respuesta>,
  opciones: { invalidar: string[]; alTerminar?: (respuesta: Respuesta) => void },
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: funcion,
    onSuccess: respuesta => {
      for (const clave of opciones.invalidar) queryClient.invalidateQueries({ queryKey: [clave] })
      opciones.alTerminar?.(respuesta)
    },
  })
}
