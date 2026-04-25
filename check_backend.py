"""
Быстрая проверка подключения к бэкенду
Запусти: python check_backend.py
"""

import requests
import sys

def check_backend():
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Бэкенд работает!")
            print("🌐 API доступен: http://localhost:8000")
            print("📚 Swagger docs: http://localhost:8000/docs")
            return True
        else:
            print(f"⚠️  Бэкенд отвечает, но код: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Бэкенд не запущен!")
        print("\n🚀 Запусти бэкенд в НОВОМ терминале:")
        print("   cd 'C:\\Users\\maksi\\OneDrive\\Рабочий стол\\t2_hack'")
        print("   python -m uvicorn app:create_app --reload --host 0.0.0.0 --port 8000")
        print("\n💡 Или через PowerShell:")
        print("   cd C:\\Users\\maksi\\OneDrive\\Рабочий стол\\t2_hack")
        print("   python -m uvicorn app:create_app --reload")
        return False
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Проверяю бэкенд...")
    print()
    if check_backend():
        print("\n✨ Всё готово! Открывай http://localhost:3001")
    else:
        print("\n⚠️  Запусти бэкенд и попробуй снова")
