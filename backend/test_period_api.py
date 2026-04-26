from db import SessionLocal
from models import CollectionPeriod, User
from datetime import datetime, date, timedelta

db = SessionLocal()

# Получаем всех верифицированных пользователей
users = db.query(User).filter(User.is_verified == True).all()

print("=== USERS ===")
for u in users:
    # Обходим кодировку для вывода
    alliance_repr = repr(u.alliance)
    print(f"ID: {u.id}, Email: {u.email}, Alliance: {alliance_repr}")

# Получаем все открытые периоды
periods = db.query(CollectionPeriod).filter(CollectionPeriod.is_open == True).all()

print("\n=== PERIODS ===")
for p in periods:
    alliance_repr = repr(p.alliance)
    print(f"ID: {p.id}, Alliance: {alliance_repr}")
    print(f"  Start: {p.period_start}, End: {p.period_end}")
    print(f"  Deadline: {p.deadline}, Is Open: {p.is_open}")

# Проверяем для первого пользователя
if users and periods:
    user = users[0]
    period = periods[0]

    print(f"\n=== CHECK MATCH ===")
    print(f"User alliance: {repr(user.alliance)}")
    print(f"Period alliance: {repr(period.alliance)}")
    print(f"Match: {user.alliance == period.alliance}")

db.close()
