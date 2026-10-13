# LoraRacing · Sistema del taller

App local para el taller de motos: inventario, órdenes de venta y mantenimiento,
precios manuales, descuentos y cortesías, entrega con firma del cliente,
ganancia por quincena y respaldos. Todo corre en el PC del taller, sin internet y sin pagos.

```
LoraRacing/
├── BackEnd/             API (Node + Express + SQLite)  → ver BackEnd/Readme.md
├── FrontEnd/            App web (React + Vite + Tailwind) → ver FrontEnd/README.md
└── Iniciar taller.bat   Doble clic para encender el sistema
```

## Instalación en un PC nuevo (solo la primera vez)

1. Instala **Node.js 24** o más nuevo desde https://nodejs.org
2. Descarga el proyecto (`git clone ...` o "Code → Download ZIP" en GitHub y descomprímelo).
3. Doble clic en **Instalar.bat**. Instala las librerías, compila la app, crea el arranque
   automático y el ícono **LoraRacing** en el escritorio, y enciende el servidor.

A mano sería:
```powershell
cd BackEnd;  pnpm install
cd ..\FrontEnd; pnpm install; pnpm build   # crea FrontEnd\dist, que el BackEnd muestra
```

**Los datos no van a GitHub** (clientes, ventas, firmas). Para pasarlos a otro PC: apaga el servidor
y copia `BackEnd\datos\` (y si quieres `BackEnd\backup\`) al mismo lugar en el PC nuevo.

## Uso diario

1. Doble clic en **Iniciar taller.bat** (o `cd BackEnd` y `pnpm start`).
2. La ventana muestra las direcciones:
   ```
   En este PC:       http://localhost:3000
   Desde el celular: http://192.168.x.x:3000
   ```
3. En el celular o la tablet (conectados al **Wi-Fi del taller**) abre la dirección "Desde el celular".
   Consejo: en el navegador del celular usa "Agregar a pantalla de inicio" para tenerla como app.
4. La primera vez la app pide crear el usuario administrador.

Si el celular no carga la página: en Windows, permite Node.js en el Firewall para **redes privadas**
(la primera vez que enciendes el servidor Windows lo pregunta) y verifica que el Wi-Fi del PC esté como red privada.
Conviene fijar una IP para el PC en el router, así la dirección no cambia.

## Arranque automático

- `Inicio de Windows\Taller LoraRacing.lnk` enciende el servidor solo al iniciar sesión (ventana minimizada
  "Taller LoraRacing - NO CERRAR"). Si el servidor se cae, se vuelve a encender a los 5 segundos.
  Para quitar el arranque automático: `Win + R` → `shell:startup` → borrar el acceso directo.
- En el escritorio, **LoraRacing** abre la app en http://localhost:3000.
- El PC no debe suspenderse: Configuración → Sistema → Energía → Suspender: **Nunca** (conectado).

## Olvidé la contraseña

La contraseña se guarda cifrada: no se puede ver. Doble clic en **Olvide la clave.bat**:
borra solo el usuario administrador (inventario, órdenes y clientes quedan intactos) y la app
vuelve a pedir crear usuario y contraseña. Desde la app, en **Mi cuenta**, se puede cambiar la contraseña conociendo la actual.

## Desarrollo (mientras programas)

Dos terminales:
```powershell
cd BackEnd;  pnpm dev     # API en http://localhost:3000 (se reinicia al guardar)
cd FrontEnd; pnpm dev     # App en http://localhost:5173 (se recarga al guardar)
```
Después de cambiar el FrontEnd, ejecuta `pnpm build` para que el uso diario tenga la versión nueva.

## Revisar errores de TypeScript

```powershell
cd BackEnd;  pnpm typecheck
cd FrontEnd; pnpm typecheck
```

## Respaldos

Cada día se crea uno automático en `BackEnd\backup` (se guardan 30). Desde la app,
en **Respaldos**, puedes crear uno manual y descargarlo. Guarda una copia fuera del PC cada semana.
