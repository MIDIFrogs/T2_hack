from db import SessionLocal
from models import User

db = SessionLocal()

# Проверяем всех пользователей
users = db.query(User).all()

print("=== ALL USERS ===")
for u in users:
    print(f"ID: {u.id}")
    print(f"  Email: {u.email}")
    print(f"  Verified: {u.is_verified}")
    print(f"  Registered: {u.registered}")
    print(f"  Alliance: {repr(u.alliance)}")
    print(f"  Role: {u.role}")
    print()

# Рекомендация: какой пользователь должен быть залогинен
print("=== RECOMMENDATION ===")
print("If you're logged in as test@t2.ru (ID: 1), you should see the period.")
print("If you're logged in as t@test.com (ID: 4), you need to update alliance to 'Moscow'.")
print()
print("To update user alliance, run:")
print("  db.query(User).filter(User.id == 4).update({'alliance': 'Moscow'})")
print("  db.commit()")

db.close()
