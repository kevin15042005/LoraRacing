// Campo "Realizado por" con sugerencias de los nombres ya usados
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/cliente'
import { Campo } from './ui'

export function CampoMecanico({ valorInicial }: { valorInicial?: string | null }) {
  const nombres = useQuery({ queryKey: ['ordenes', 'mecanicos'], queryFn: () => api.get<string[]>('/ordenes/mecanicos') })
  return (
    <>
      <Campo
        etiqueta="Realizado por (mecánico)"
        name="mecanico"
        list="lista-mecanicos"
        autoComplete="off"
        defaultValue={valorInicial ?? ''}
        placeholder="Nombre de quien hace el trabajo"
      />
      <datalist id="lista-mecanicos">
        {nombres.data?.map(n => <option key={n} value={n} />)}
      </datalist>
    </>
  )
}
