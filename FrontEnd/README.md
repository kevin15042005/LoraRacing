# FrontEnd — Taller LoraRacing

App web (celular, tablet y PC) que usa la API del BackEnd.

## Comandos

| Comando | Para qué |
|---|---|
| `pnpm dev` | Desarrollo en http://localhost:5173 (pide `/api` al BackEnd en el puerto 3000) |
| `pnpm build` | Revisa tipos y compila en `dist/` (el BackEnd la muestra en el uso diario) |
| `pnpm typecheck` | Solo revisa errores de TypeScript |

## Estructura

```
src/
├── main.tsx               Arranque: React Query + Router + Sesión
├── App.tsx                Mapa de pantallas (rutas)
├── index.css              Tailwind + colores de la marca (@theme)
├── api/
│   ├── cliente.ts         fetch con token Bearer; convierte { error } en ErrorApi
│   ├── tipos.ts           Cómo lucen los datos de la API
│   └── useGuardar.ts      Guardar + refrescar listas afectadas
├── auth/                  Sesión (contexto), ruta protegida
├── componentes/
│   ├── ui.tsx             Boton, Campo, Modal, Insignias, Tarjeta...
│   ├── Layout.tsx         Menú lateral (PC) y barra inferior (celular)
│   ├── Firma.tsx          Lienzo de firma con el dedo (pointer events)
│   ├── Formularios.tsx    Formularios de cliente y moto
│   ├── Desactivar.tsx     Botón desactivar con confirmación
│   └── iconos.tsx         Íconos SVG
├── paginas/               Una pantalla por archivo
└── utils/formato.ts       Pesos COP, fechas, lectura de números
```

## Colores (src/index.css)

| Token | HEX | Uso |
|---|---|---|
| `marca` | #8DC63F | Botones principales |
| `marca-oscuro` | #4E8A1E | Texto verde y hover |
| `acento` | #F2E500 | Resaltados |
| `secundario` | #3A4FA3 | Órdenes abiertas, cortesías |
| `menu` | #111111 | Menú y barra |
| `agotado` / `por-agotarse` / `suficiente` | rojo / amarillo / verde | Estados del stock |

Se usan como clases de Tailwind: `bg-marca`, `text-marca-oscuro`, `bg-menu`...
