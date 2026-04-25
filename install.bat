@echo off
echo 📦 Установка зависимостей T2 Schedule Backend...
echo.

cd /d "%~dp0backend"

echo Установка Python пакетов...
pip install fastapi uvicorn sqlalchemy pydantic python-multipart python-jose[cryptography] passlib[bcrypt] psycopg2-binary requests

echo.
echo ✅ Установка завершена!
echo.
echo 🚀 Теперь запусти: python start.py
echo.

pause
