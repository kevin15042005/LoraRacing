# BackEnd — Taller LoraRacing

API local del taller: inventario de repuestos, mano de obra, clientes, motos,
órdenes (ventas y mantenimientos), entregas con firma, reportes por quincena y respaldos.
Todo corre en el PC del taller con SQLite. No necesita internet.

## Comandos

| Comando | Para qué |
|---|---|
| `pnpm dev` | Arranca en modo desarrollo (se reinicia al guardar) |
| `pnpm start` | Arranca para el uso diario |
| `pnpm typecheck` | Revisa que no haya errores de TypeScript |

## Estructura

```
app/
├── server.ts            Enciende el servidor (migraciones, respaldos, puerto)
├── app.ts               Registra módulos y middlewares
├── config/env.ts        Puerto, carpetas, zona horaria
├── db/
│   ├── conexion.ts      Abre datos/taller.db
│   ├── migrar.ts        Aplica las migraciones pendientes
│   └── migrations/      001_ a 007_ (tablas)
├── share/
│   ├── errores.ts       ErrorApp y atajos (404, 400, 409...)
│   ├── middleware/      validar, manejarErrores, requiereSesion
│   └── utils/           fechas (quincenas, hora Colombia), dinero (totales)
└── modules/<modulo>/
    ├── <m>.rutas.ts        URLs → controlador
    ├── <m>.controlador.ts  Recibe, llama al servicio, responde
    ├── <m>.servicio.ts     Reglas del negocio y transacciones
    ├── <m>.repositorio.ts  Único lugar con SQL
    ├── <m>.esquemas.ts     Validación con Zod
    └── <m>.tipos.ts        Tipos de TypeScript
datos/taller.db          Base de datos (NO subir a Git)
datos/firmas/            Imágenes de las firmas
backup/                  Respaldos automáticos y manuales
```

Regla: `rutas → controlador → servicio → repositorio → db`.
Un módulo usa a otro solo a través de su **servicio**.

Módulos: `auth`, `repuestos` (catálogo), `inventario` (stock y movimientos: compras,
ajustes, salidas y devoluciones), `mano-obra`, `clientes`, `motos`, `ordenes`, `entregas`,
`reportes`, `respaldos`. Las rutas de inventario viven bajo `/api/repuestos/:id/...`.

## Primer uso

1. `pnpm dev`
2. `GET /api/auth/estado` → si `necesitaRegistro` es `true`:
3. `POST /api/auth/registro` con `{ "usuario": "admin", "nombre": "...", "clave": "..." }`
4. Guarda el `token` y envíalo en cada petición: `Authorization: Bearer <token>`

## Rutas

Todas menos `/api/salud` y `/api/auth/estado|registro|login|recuperar` necesitan sesión.

### Auth `/api/auth`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/estado` | ¿Falta crear el administrador? |
| POST | `/registro` | `{ usuario, nombre, clave, pin }` — crea el primer administrador (solo una vez). `pin` = 4 a 8 números que él elige |
| POST | `/login` | `{ usuario, clave }` → `{ token, usuario }` |
| POST | `/logout` | Cierra la sesión actual |
| GET | `/yo` | Usuario de la sesión |
| PUT | `/clave` | `{ claveActual, claveNueva }` — `claveActual` puede ser la contraseña o el PIN |
| POST | `/recuperar` | `{ usuario, pin, claveNueva }` → nueva sesión (el PIN no cambia). 5 fallos = bloqueo 15 min |
| PUT | `/pin` | `{ claveActual, pinNuevo }` — crear o cambiar el PIN de recuperación |

### Repuestos `/api/repuestos`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/?q=&estado=&categoria=` | Lista. estado: `agotado`, `por_agotarse`, `suficiente` |
| GET | `/alertas` | Agotados y por agotarse |
| GET | `/categorias` | Categorías usadas |
| GET | `/:id` | Detalle |
| GET | `/:id/movimientos` | Historial de entradas, salidas y ajustes |
| POST | `/` | Crear (puede traer `stock` inicial) |
| PUT | `/:id` | Editar (el stock no se edita aquí) |
| DELETE | `/:id` | Desactivar |
| POST | `/:id/entrada` | Compra: `{ cantidad, costo?, nota? }` |
| POST | `/:id/ajuste` | Conteo físico: `{ stock_real, nota }` |

### Mano de obra `/api/mano-obra` · Clientes `/api/clientes` · Motos `/api/motos`
CRUD: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (desactiva).
Extras: `GET /api/clientes/:id` trae sus motos · `GET /api/motos/placa/:placa`.

### Órdenes `/api/ordenes`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/?estado=&tipo=&cliente_id=&moto_id=&desde=&hasta=&q=` | Lista |
| GET | `/:id` | Orden + líneas + resumen (total, descuentos, cortesías, costo, ganancia) |
| POST | `/` | `{ tipo: "venta"\|"mantenimiento", moto_id?, cliente_id?, km?, diagnostico?, notas? }` |
| PUT | `/:id` | Editar datos (solo abierta) |
| POST | `/:id/items` | Agregar línea (ver abajo) |
| PUT | `/:id/items/:itemId` | `{ cantidad?, precio_unitario?, descuento?, cobrar?, descripcion? }` |
| DELETE | `/:id/items/:itemId` | Quitar línea |
| POST | `/:id/cerrar` | Descuenta el stock y cierra |
| POST | `/:id/anular` | `{ motivo }` — si estaba cerrada devuelve el stock |

Agregar línea:
```json
{ "tipo": "repuesto",  "repuesto_id": 1, "cantidad": 2 }
{ "tipo": "mano_obra", "mano_obra_id": 3, "precio_unitario": 25000, "descuento": 5000 }
{ "tipo": "repuesto",  "repuesto_id": 2, "cantidad": 1, "cobrar": false }
{ "tipo": "otro", "descripcion": "Torneado de disco", "precio_unitario": 30000, "costo_unitario": 12000 }
```
- Sin `precio_unitario` → se usa el precio estándar del catálogo (queda fijo en la línea).
- `descuento` en pesos. `cobrar: false` = cortesía (descuenta stock y su costo resta de la ganancia).

Estados: `abierta → cerrada → entregada`; `abierta` o `cerrada` pueden pasar a `anulada`.

### Entregas `/api/entregas`
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/` | `{ orden_id, recibe_nombre, recibe_documento?, km_entrega?, observaciones?, firma }` |
| GET | `/` | Últimas entregas |
| GET | `/orden/:ordenId` | Comprobante: entrega + orden completa |
| GET | `/orden/:ordenId/firma` | Imagen PNG de la firma |

`firma` = `canvas.toDataURL('image/png')` (texto que empieza por `data:image/png;base64,`).

### Reportes `/api/reportes`
| Ruta | Descripción |
|---|---|
| `/resumen` | Pantalla de inicio: quincena actual, stock, órdenes abiertas/por entregar |
| `/quincena-actual` | Totales de la quincena en curso |
| `/quincenas?meses=6` | Totales por quincena |
| `/ganancia?desde=2026-10-01&hasta=2026-10-15` | Totales de un rango |
| `/repuestos-mas-usados?desde=&hasta=&limite=10` | Ranking |
| `/stock` | Conteo por estado + alertas |

### Respaldos `/api/respaldos`
`GET /` lista · `POST /` crea uno ahora · `GET /:archivo` descarga.
Cada día se crea uno automático (se guardan los últimos 30).

**Restaurar:** apaga el servidor, copia el respaldo de `backup/` sobre `datos/taller.db` y enciende.

## Errores
Siempre responden `{ "error": "mensaje" }` con código 400, 401, 404, 409 o 500.
