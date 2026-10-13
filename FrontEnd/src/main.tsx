import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { ProveedorSesion } from './auth/ProveedorSesion'
import './index.css'

// TanStack Query guarda en memoria lo que llega de la API y lo vuelve a pedir cuando hace falta
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000, // 10 s: evita pedir lo mismo muchas veces seguidas
      refetchOnWindowFocus: true, // al volver a la app se actualiza
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProveedorSesion>
          <App />
        </ProveedorSesion>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
