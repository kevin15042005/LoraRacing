@echo off
REM Borra el usuario administrador para crearlo de nuevo.
REM No borra inventario, ordenes, clientes ni ningun otro dato.
title Reiniciar clave - LoraRacing
echo.
echo  Esto borra el usuario y la contrasena del administrador.
echo  Los datos del taller NO se borran.
echo  Despues, al abrir la app, te pedira crear el usuario de nuevo.
echo.
choice /c SN /m " Deseas continuar? (S = si, N = no)"
if errorlevel 2 goto fin

cd /d "%~dp0BackEnd"
call pnpm reiniciar-clave

:fin
pause
