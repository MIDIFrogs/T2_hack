# 🎯 ФИНАЛЬНАЯ ИНСТРУКЦИЯ - 3 ШАГА

## Шаг 1: Установить зависимости (один раз)

Открой файл `install.bat` **ДВАЖМИ ЛКНУ** или в командной строке:

```powershell
cd "C:\Users\maksi\OneDrive\Рабочий стол\t2_hack"
install.bat
```

Или вручную:
```powershell
cd "C:\Users\maksi\OneDrive\Рабочий стол\t2_hack\backend"
pip install fastapi uvicorn sqlalchemy pydantic python-multipart python-jose[cryptography] passlib[bcrypt] psycopg2-binary requests
```

---

## Шаг 2: Создать пользователя (один раз)

```powershell
cd "C:\Users\maksi\OneDrive\Рабочий стол\t2_hack"
python create_user.py
```

---

## Шаг 3: Запустить бэкенд

```powershell
python start.py
```

Жди: `INFO: Uvicorn running on http://0.0.0.0:8000`

---

## 🌐 ФРОНТ УЖЕ РАБОТАЕТ!

**Открой:** http://localhost:3001

---

## 🔐 ЛОГИН:

- **Email:** `test@t2.ru`
- **Пароль:** `test123`

---

## 🎨 ЧТО ПОКАЗАТЬ ЖЮРИ:

1. **Paint Tool** - выбери "Рабочий день", зажми мышь и веди по дням
2. **Quick Fill** - ПКМ на день → "До конца месяца"
3. **Stats** - статистика внизу в реальном времени
4. **Профиль** - кликни на аватар

---

## ✨ ГОТОВО К ХАКАТОНУ!

**Открывай http://localhost:3001 и побеждай! 🚀🏆**
