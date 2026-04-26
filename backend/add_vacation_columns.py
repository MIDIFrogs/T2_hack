"""
Скрипт для добавления колонок available_vacation_days и available_off_days в таблицу users
Выполните: python add_vacation_columns.py
"""

from sqlalchemy import create_engine, text
from config import settings

# Создаем подключение
engine = create_engine(str(settings.DATABASE_URL))

# SQL для добавления колонок
sql_statements = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS available_vacation_days INTEGER DEFAULT 14 NOT NULL;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS available_off_days INTEGER DEFAULT 5 NOT NULL;",
]

with engine.connect() as conn:
    for i, sql in enumerate(sql_statements, 1):
        print(f"Executing {i}/{len(sql_statements)}...")
        try:
            result = conn.execute(text(sql))
            print(f"  Success")
        except Exception as e:
            print(f"  Error: {e}")

print("\nDone! Columns added to users table.")
print("available_vacation_days = 14 (default)")
print("available_off_days = 5 (default)")
