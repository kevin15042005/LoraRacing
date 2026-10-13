// Formularios de cliente y moto (se usan en varias pantallas)
import { useQuery } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { api } from '../api/cliente'
import type { Cliente, Moto } from '../api/tipos'
import { useGuardar } from '../api/useGuardar'
import { AreaTexto, AvisoError, Boton, Campo, Selector } from './ui'
import { numero, texto } from '../utils/formato'

export function FormCliente({ cliente, alTerminar }: { cliente?: Cliente; alTerminar: (c: Cliente) => void }) {
  const guardar = useGuardar(
    (datos: object) => (cliente ? api.put<Cliente>(`/clientes/${cliente.id}`, datos) : api.post<Cliente>('/clientes', datos)),
    { invalidar: ['clientes', 'motos', 'ordenes'], alTerminar },
  )

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    guardar.mutate({
      nombre: texto(f.get('nombre')),
      documento: texto(f.get('documento')),
      telefono: texto(f.get('telefono')),
      email: texto(f.get('email')),
      direccion: texto(f.get('direccion')),
      notas: texto(f.get('notas')),
    })
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <AvisoError error={guardar.error} />
      <Campo etiqueta="Nombre *" name="nombre" required defaultValue={cliente?.nombre} autoComplete="off" />
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Cédula / NIT" name="documento" inputMode="numeric" defaultValue={cliente?.documento ?? ''} />
        <Campo etiqueta="Teléfono" name="telefono" type="tel" defaultValue={cliente?.telefono ?? ''} />
      </div>
      <Campo etiqueta="Correo" name="email" type="email" defaultValue={cliente?.email ?? ''} />
      <Campo etiqueta="Dirección" name="direccion" defaultValue={cliente?.direccion ?? ''} />
      <AreaTexto etiqueta="Notas" name="notas" defaultValue={cliente?.notas ?? ''} />
      <Boton type="submit" cargando={guardar.isPending} className="w-full">{cliente ? 'Guardar cambios' : 'Crear cliente'}</Boton>
    </form>
  )
}

/** Si se pasa clienteId fijo, no se pregunta el dueño */
export function FormMoto({ moto, clienteId, alTerminar }: { moto?: Moto; clienteId?: number; alTerminar: (m: Moto) => void }) {
  const clientes = useQuery({
    queryKey: ['clientes', ''],
    queryFn: () => api.get<Cliente[]>('/clientes'),
    enabled: clienteId === undefined,
  })
  const guardar = useGuardar(
    (datos: object) => (moto ? api.put<Moto>(`/motos/${moto.id}`, datos) : api.post<Moto>('/motos', datos)),
    { invalidar: ['motos', 'clientes', 'ordenes'], alTerminar },
  )

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    guardar.mutate({
      cliente_id: clienteId ?? numero(f.get('cliente_id')),
      placa: String(f.get('placa') ?? ''),
      marca: texto(f.get('marca')),
      modelo: texto(f.get('modelo')),
      anio: numero(f.get('anio')) ?? null,
      cilindraje: numero(f.get('cilindraje')) ?? null,
      color: texto(f.get('color')),
      km_actual: numero(f.get('km_actual')) ?? null,
      notas: texto(f.get('notas')),
    })
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <AvisoError error={guardar.error} />
      {clienteId === undefined && (
        <Selector etiqueta="Dueño *" name="cliente_id" required defaultValue={moto?.cliente_id ?? ''}>
          <option value="" disabled>Elige un cliente</option>
          {clientes.data?.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}{c.documento ? ` · ${c.documento}` : ''}</option>
          ))}
        </Selector>
      )}
      <Campo etiqueta="Placa *" name="placa" required defaultValue={moto?.placa} autoCapitalize="characters" placeholder="ABC12D" />
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Marca" name="marca" defaultValue={moto?.marca ?? ''} />
        <Campo etiqueta="Modelo" name="modelo" defaultValue={moto?.modelo ?? ''} />
        <Campo etiqueta="Año" name="anio" inputMode="numeric" defaultValue={moto?.anio ?? ''} />
        <Campo etiqueta="Cilindraje (cc)" name="cilindraje" inputMode="numeric" defaultValue={moto?.cilindraje ?? ''} />
        <Campo etiqueta="Color" name="color" defaultValue={moto?.color ?? ''} />
        <Campo etiqueta="Kilometraje" name="km_actual" inputMode="numeric" defaultValue={moto?.km_actual ?? ''} />
      </div>
      <AreaTexto etiqueta="Notas" name="notas" defaultValue={moto?.notas ?? ''} />
      <Boton type="submit" cargando={guardar.isPending} className="w-full">{moto ? 'Guardar cambios' : 'Registrar moto'}</Boton>
    </form>
  )
}
