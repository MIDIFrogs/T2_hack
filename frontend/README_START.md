# 🚀 БЫСТРАЯ ИНСТРУКЦИЯ ПО ЗАПУСКУ

## 1️⃣ ЗАПУСК БЭКЕНДА (текущий терминал)

```bash
cd "C:\Users\maksi\OneDrive\Рабочий стол\t2_hack"
python setup_test_data.py
python -m uvicorn app:create_app --reload --host 0.0.0.0 --port 8000
```

**Если первая команда выдаст ошибку** - не страшно, запусти вторую команду.

---

## 2️⃣ ФРОНТЕНД УЖЕ РАБОТАЕТ!

**Открой в браузере:** http://localhost:3001

---

## 3️⃣ ЛОГИН

- **Email:** `test@t2.ru`
- **Пароль:** `test123`

---

## 🔍 ЕСЛИ ОШИБКА CORS:

В бэкенде (`app.py`) убедись, что есть:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ✅ ПРОВЕРКА:

1. **Бэкенд:** http://localhost:8000/docs (должна открыться Swagger)
2. **Фронт:** http://localhost:3001
3. **Логин:** test@t2.ru / test123

---

## 🎨 ГОТОВО!

Открывай http://localhost:3001 и показывай жюри!
