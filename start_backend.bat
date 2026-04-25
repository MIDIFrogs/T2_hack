@echo off
echo 🚀 Запуск T2 Schedule Backend...
echo.

cd /d "%~dp0backend"
python -m uvicorn app:create_app --reload --host 0.0.0.0 --port 8000

pause
