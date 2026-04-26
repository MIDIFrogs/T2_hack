@echo off
chcp 65001 >nul
title T2 Schedule - Остановка проекта

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║          🛑 T2 Schedule - Остановка проекта           ║
echo ╚══════════════════════════════════════════════════════╝
echo.

echo Остановка процессов...
echo.

REM Закрываем окна по заголовку
taskkill /FI "WINDOWTITLE eq T2 Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq T2 Frontend*" /F >nul 2>&1

REM Закрываем процессы Python и Node.js в папках проекта
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV /NH ^| findstr /C:"backend"') do taskkill /PID %%i /F >nul 2>&1
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH ^| findstr /C:"frontend"') do taskkill /PID %%i /F >nul 2>&1

echo ✅ Процессы остановлены
echo.
pause
