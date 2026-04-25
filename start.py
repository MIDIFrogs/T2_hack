"""
Запуск бэкенда T2 Schedule из любой папки
Запусти: python start.py
"""

import os
import subprocess
import sys

def main():
    # Определяем путь к бэкенду
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(script_dir, 'backend')

    if not os.path.exists(backend_dir):
        print(f"❌ Папка backend не найдена: {backend_dir}")
        print("💡 Убедись, что ты запускаешь из папки t2_hack")
        return

    print("🚀 Запуск T2 Schedule Backend...")
    print(f"📁 Папка: {backend_dir}")
    print()

    # Запускаем uvicorn из папки backend
    os.chdir(backend_dir)

    try:
        subprocess.run([
            sys.executable,
            "-m", "uvicorn",
            "app:create_app",
            "--reload",
            "--host", "0.0.0.0",
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        print("\n👋 Остановлено")
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")

if __name__ == "__main__":
    main()
