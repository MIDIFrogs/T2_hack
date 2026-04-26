from db import SessionLocal
from models import CollectionPeriod
from datetime import datetime, date, timedelta

db = SessionLocal()

# Проверяем, есть ли период для Moscow
existing = db.query(CollectionPeriod).filter(
    CollectionPeriod.alliance == 'Moscow',
    CollectionPeriod.is_open == True
).first()

if existing:
    print(f"Period for Moscow already exists: {existing.period_start} to {existing.period_end}")
else:
    # Создаем период: с 26 по 26 число
    today = date.today()

    if today.day >= 26:
        start = today
        next_month = today.replace(day=28) + timedelta(days=5)
        end = next_month.replace(day=26)
    else:
        start = today.replace(day=1) - timedelta(days=5)
        start = start.replace(day=26)
        end = today.replace(day=26)

    deadline = datetime.now() + timedelta(days=7)

    period = CollectionPeriod(
        alliance='Moscow',
        period_start=start,
        period_end=end,
        deadline=deadline,
        is_open=True
    )
    db.add(period)
    db.commit()

    print(f"Created period for Moscow:")
    print(f"  Start: {start}")
    print(f"  End: {end}")
    print(f"  Deadline: {deadline}")

db.close()
