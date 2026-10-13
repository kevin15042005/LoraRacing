// Mapa de pantallas: qué dirección muestra qué página
import { Navigate, Route, Routes } from 'react-router-dom'
import { RutaProtegida } from './auth/ProveedorSesion'
import { Layout } from './componentes/Layout'
import { ClienteDetalle } from './paginas/ClienteDetalle'
import { Clientes } from './paginas/Clientes'
import { Comprobante } from './paginas/Comprobante'
import { Cuenta } from './paginas/Cuenta'
import { Entrega } from './paginas/Entrega'
import { Inicio } from './paginas/Inicio'
import { Inventario } from './paginas/Inventario'
import { Login } from './paginas/Login'
import { ManoObra } from './paginas/ManoObra'
import { Motos } from './paginas/Motos'
import { OrdenDetalle } from './paginas/OrdenDetalle'
import { Ordenes } from './paginas/Ordenes'
import { Reportes } from './paginas/Reportes'
import { Respaldos } from './paginas/Respaldos'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="ordenes/:id" element={<OrdenDetalle />} />
          <Route path="ordenes/:id/entrega" element={<Entrega />} />
          <Route path="ordenes/:id/comprobante" element={<Comprobante />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/:id" element={<ClienteDetalle />} />
          <Route path="motos" element={<Motos />} />
          <Route path="mano-obra" element={<ManoObra />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="respaldos" element={<Respaldos />} />
          <Route path="cuenta" element={<Cuenta />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
