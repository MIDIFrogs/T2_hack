"""
Скрипт для создания тестовых данных для T2 Schedule
Запусти из папки backend: python create_test_user.py
"""

from auth import get_password_hash
from db import SessionLocal, User, CollectionPeriod, UserRole
from datetime import datetime, timedelta

def setup_test_data():
    db = SessionLocal()

    try:
        # Проверяем, есть ли уже пользователь
        existing_user = db.query(User).filter(User.email == "test@t2.ru").first()
        if existing_user:
            print("⚠️  Пользователь test@t2.ru уже существует")
        else:
            # Создаём пользователя
            user = User(
                email="test@t2.ru",
                password_hash=get_password_hash("test123"),
                full_name="Иван Иванов",
                alliance="Москва",
                category="Разработка",
                role=UserRole.USER,
                registered=True,
                is_verified=True
            )
            db.add(user)
            print("✅ Пользователь создан")

        # Проверяем, есть ли открытый период
        existing_period = db.query(CollectionPeriod).filter(
            CollectionPeriod.is_open == True,
            CollectionPeriod.alliance == "Москва"
        ).first()

        if existing_period:
            print(f"⚠️  Открытый период уже существует: {existing_period.period_start} - {existing_period.period_end}")
        else:
            # Создаём период на 30 дней
            period = CollectionPeriod(
                alliance="Москва",
                period_start=datetime.now().date(),
                period_end=(datetime.now() + timedelta(days=30)).date(),
                deadline=datetime.now() + timedelta(days=7),
                is_open=True
            )
            db.add(period)
            print("✅ Период создан")

        db.commit()
        db.close()

        print("\n" + "="*50)
        print("🎉 Тестовые данные созданы успешно!")
        print("="*50)
        print("\n📧 Логин:")
        print("   Email:    test@t2.ru")
        print("   Пароль:   test123")
        print("\n🌐 Открой в браузере:")
        print("   Фронт:    http://localhost:3001")
        print("   Бэкенд:   http://localhost:8000/docs")
        print("\n✨ Готово к демонстрации!")
        print("="*50)

    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        db.close()

if __name__ == "__main__":
    print("🚀 Создание тестовых данных для T2 Schedule...")
    print()
    setup_test_data()
