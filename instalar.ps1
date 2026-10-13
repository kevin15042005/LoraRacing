# Instala LoraRacing en este PC (lo ejecuta Instalar.bat).
# 1. Revisa que Node y pnpm estén instalados
# 2. Instala librerías del BackEnd y del FrontEnd y compila la app
# 3. Crea el arranque automático al iniciar Windows y el ícono del escritorio
$ErrorActionPreference = 'Stop'
$raiz = $PSScriptRoot

function Paso($texto) { Write-Host ""; Write-Host "== $texto" -ForegroundColor Green }

Paso 'Revisando Node.js y pnpm'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host 'Falta Node.js. Descargalo de https://nodejs.org (version 24 o mas nueva) e instalalo. Luego vuelve a ejecutar Instalar.bat.' -ForegroundColor Red
  exit 1
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host 'Instalando pnpm...'
  npm install -g pnpm
}
Write-Host "Node $(node -v) - pnpm $(pnpm -v)"

Paso 'Instalando el BackEnd'
Set-Location (Join-Path $raiz 'BackEnd')
pnpm install
if ($LASTEXITCODE -ne 0) { throw 'Fallo pnpm install en BackEnd' }

Paso 'Instalando y compilando el FrontEnd'
Set-Location (Join-Path $raiz 'FrontEnd')
pnpm install
if ($LASTEXITCODE -ne 0) { throw 'Fallo pnpm install en FrontEnd' }
pnpm build
if ($LASTEXITCODE -ne 0) { throw 'Fallo pnpm build en FrontEnd' }

Paso 'Creando arranque automatico e icono del escritorio'
$shell = New-Object -ComObject WScript.Shell
$acceso = $shell.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Startup')) 'Taller LoraRacing.lnk'))
$acceso.TargetPath = Join-Path $raiz 'Iniciar taller.bat'
$acceso.WorkingDirectory = $raiz
$acceso.WindowStyle = 7   # minimizado
$acceso.IconLocation = "$env:SystemRoot\System32\shell32.dll,12"
$acceso.Save()

Add-Type -AssemblyName System.Drawing
$ico = Join-Path $raiz 'FrontEnd\public\logo.ico'
$png = [System.Drawing.Bitmap]::FromFile((Join-Path $raiz 'FrontEnd\public\logo.png'))
$chico = New-Object System.Drawing.Bitmap $png, 64, 64
$icono = [System.Drawing.Icon]::FromHandle($chico.GetHicon())
$fs = [IO.File]::Create($ico); $icono.Save($fs); $fs.Close()
$png.Dispose(); $chico.Dispose()
$url = "[InternetShortcut]`r`nURL=http://localhost:3000`r`nIconFile=$ico`r`nIconIndex=0`r`n"
Set-Content -Path (Join-Path ([Environment]::GetFolderPath('Desktop')) 'LoraRacing.url') -Value $url -Encoding ASCII

Paso 'Listo'
Write-Host 'Ahora se enciende el servidor. Desde ahora arranca solo al iniciar Windows.'
Write-Host 'Abre la app con el icono LoraRacing del escritorio.'
Start-Process -FilePath (Join-Path $raiz 'Iniciar taller.bat') -WindowStyle Minimized
