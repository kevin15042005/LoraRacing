@echo off
REM Enciende el sistema del taller. Deja esta ventana abierta (puede estar minimizada).
REM Si el servidor se cae, se vuelve a encender solo a los 5 segundos.
title Taller LoraRacing - NO CERRAR
cd /d "%~dp0BackEnd"

:encender
call pnpm start
echo.
echo  El servidor se detuvo. Se vuelve a encender en 5 segundos...
echo  (para apagarlo del todo, cierra esta ventana)
timeout /t 5 /nobreak >nul
goto encender
