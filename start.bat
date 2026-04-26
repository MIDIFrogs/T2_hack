@echo off
chcp 65001 >nul
title T2 Schedule - Запуск проекта

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║           🚀 T2 Schedule - Запуск проекта            ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Проверяем запущен ли PostgreSQL
echo [1/4] Проверка PostgreSQL...
sc query postgresql-x64-16 | find "RUNNING" >nul
if errorlevel 1 (
    echo ⚠️  PostgreSQL не запущен. Попытка запуска...
    net start postgresql-x64-16
    if errorlevel 1 (
        echo ❌ Не удалось запустить PostgreSQL!
        echo    Запустите PostgreSQL вручную или проверьте установку.
        pause
        exit /b 1
    )
    echo ✅ PostgreSQL запущен
) else (
    echo ✅ PostgreSQL уже запущен
)
echo.

REM Запускаем бэкенд
echo [2/4] Запуск бэкенда...
cd /d "%~dp0backend"
start "T2 Backend" cmd /k "title T2 Backend && echo 🔧 Backend: http://localhost:8000 && echo. && python start.py"
if errorlevel 1 (
    echo ❌ Не удалось запустить бэкенд!
    pause
    exit /b 1
)
echo ✅ Бэкенд запущен в отдельном окне
echo.

REM Ждём 3 секунды для запуска бэкенда
echo Ожидание запуска бэкенда...
timeout /t 3 /nobreak >nul
echo.

REM Проверяем Health
echo [3/4] Проверка доступности бэкенда...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 5; Write-Host '✅ Бэкенд доступен:' $response.StatusCode } catch { Write-Host '⚠️  Бэкенд не отвечает (пока что)' }"
echo.

REM Запускаем фронтенд
echo [4/4] Запуск фронтенда...
cd /d "%~dp0frontend"
start "T2 Frontend" cmd /k "title T2 Frontend && echo 🎨 Frontend: http://localhost:3000 && echo. && npm run dev"
if errorlevel 1 (
    echo ❌ Не удалось запустить фронтенд!
    pause
    exit /b 1
)
echo ✅ Фронтенд запущен в отдельном окне
echo.

REM Готово!
echo ╔══════════════════════════════════════════════════════╗
echo ║                  ✅ Готово!                           ║
echo ╠══════════════════════════════════════════════════════╣
echo ║  🎨 Frontend:  http://localhost:3000                  ║
echo ║  🔧 Backend:   http://localhost:8000                  ║
echo ║  📚 API Docs:  http://localhost:8000/docs             ║
echo ╠══════════════════════════════════════════════════════╣
echo ║  Для остановки закройте окна Backend и Frontend       ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Открываем браузер (опционально)
echo Открываю браузер через 3 секунды...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo Для остановки проекта закройте окна "T2 Backend" и "T2 Frontend"
echo.
pause
