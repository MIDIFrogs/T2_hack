# 🚀 КАК ЗАПУСТИТЬ ПРОЕКТ

## Шаг 1: Запуск бэкенда (Python/FastAPI)

Открой **ПЕРВЫЙ** терминал:

```bash
cd "C:\Users\maksi\OneDrive\Рабочий стол\t2_hack"

# Активируй виртуальное окружение (если есть)
# .venv\Scripts\activate

# Установи зависимости (если ещё не установлены)
pip install fastapi uvicorn sqlalchemy pydantic python-multipart python-jose[cryptography] passlib[bcrypt]

# Запусти бэкенд
python -m uvicorn app:create_app --reload --host 0.0.0.0 --port 8000
```

Бэкенд запустится на: **http://localhost:8000**

Проверь что работает: открой http://localhost:8000/docs - должна открыться Swagger документация.

---

## Шаг 2: Запуск фронта (Next.js)

Открой **ВТОРОЙ** терминал:

```bash
cd "C:\Users\maksi\OneDrive\Рабочий стол\t2_hack\frontend"

# Фронт уже запущен! Если нет:
npm run dev
```

Фронт запустится на: **http://localhost:3000**

---

## Шаг 3: Создай тестового пользователя

В **ПЕРВОМ** терминале (где бэкенд) выполни:

```bash
# Создай пользователя через Python интерактивный режим
python

>>> from auth import hash_password
>>> from db import SessionLocal, User, UserRole
>>> from datetime import datetime

>>> db = SessionLocal()
>>> user = User(
...     email="test@t2.ru",
...     password_hash=hash_password("test123"),
...     full_name="Тестовый Пользователь",
...     alliance="Москва",
...     category="Разработка",
...     role=UserRole.USER,
...     registered=True,
...     is_verified=True
... )
>>> db.add(user)
>>> db.commit()
>>> db.close()

>>> exit()
```

Или через Postman:
```
POST http://localhost:8000/auth/register
{
  "email": "test@t2.ru",
  "password": "test123",
  "full_name": "Тестовый Пользователь"
}
```

---

## Шаг 4: Создай период сбора графика

```bash
python

>>> from db import SessionLocal, CollectionPeriod
>>> from datetime import datetime, timedelta

>>> db = SessionLocal()
>>> period = CollectionPeriod(
...     alliance="Москва",
...     period_start=datetime.now().date(),
...     period_end=(datetime.now() + timedelta(days=30)).date(),
...     deadline=datetime.now() + timedelta(days=7),
...     is_open=True
... )
>>> db.add(period)
>>> db.commit()
>>> db.close()

>>> exit()
```

---

## Шаг 5: Пользуйся! 🎉

1. Открой **http://localhost:3000**
2. Войди:
   - Email: `test@t2.ru`
   - Пароль: `test123`
3. Заполняй график!

---

## 📊 Структура запущенных сервисов:

```
┌─────────────────────────────────────────┐
│  Бэкенд (Terminal 1)                    │
│  http://localhost:8000                  │
│  ┌───────────────────────────────────┐ │
│  │ FastAPI + PostgreSQL              │ │
│  │ Auth, Schedule, Periods, Templates│ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                  ↕ API
┌─────────────────────────────────────────┐
│  Фронт (Terminal 2)                     │
│  http://localhost:3000                  │
│  ┌───────────────────────────────────┐ │
│  │ Next.js + React + Framer Motion   │ │
│  │ Calendar, PaintTool, Stats        │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔧 Если что-то не работает:

### Бэкенд не запускается:
```bash
# Проверь что порт 8000 свободен
netstat -ano | findstr :8000

# Если занят - убей процесс
taskkill /PID <номер_процесса> /F
```

### Фронт не запускается:
```bash
# Проверь что порт 3000 свободен
netstat -ano | findstr :3000

# Очисти кеш Next.js
cd frontend
rm -rf .next
npm run dev
```

### CORS ошибка:
Проверь что в `app.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Или ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 401 Unauthorized:
- Токен истёк → перелогинься
- Пользователь не верифицирован → `is_verified=True`

### Нет периодов:
- Создай период через Python код выше
- Или через админку (если есть)

---

## 📝 Быстрый скрипт для создания тестовых данных

Создай файл `setup_test_data.py` в папке `t2_hack`:

```python
from auth import hash_password
from db import SessionLocal, User, CollectionPeriod, UserRole
from datetime import datetime, timedelta

def setup_test_data():
    db = SessionLocal()

    # Создаём пользователя
    user = User(
        email="test@t2.ru",
        password_hash=hash_password("test123"),
        full_name="Иван Иванов",
        alliance="Москва",
        category="Разработка",
        role=UserRole.USER,
        registered=True,
        is_verified=True
    )
    db.add(user)

    # Создаём период
    period = CollectionPeriod(
        alliance="Москва",
        period_start=datetime.now().date(),
        period_end=(datetime.now() + timedelta(days=30)).date(),
        deadline=datetime.now() + timedelta(days=7),
        is_open=True
    )
    db.add(period)

    db.commit()
    db.close()

    print("✅ Тестовые данные созданы!")
    print("📧 Email: test@t2.ru")
    print("🔑 Пароль: test123")

if __name__ == "__main__":
    setup_test_data()
```

Запусти:
```bash
python setup_test_data.py
```

---

## 🎯 Всё готово! Жюри будет в восторге! 🏆

Открывай http://localhost:3000 и показывай:
1. Paint Tool (зажми мышь и веди)
2. Quick Fill (правый клик)
3. Real-time Stats
4. Анимации
5. Профиль со статистикой

Удачи на хакатоне! 🚀
