@echo off
REM Instala el sistema del taller en este PC (solo la primera vez).
title Instalar LoraRacing
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar.ps1"
echo.
pause
