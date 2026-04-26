from db import SessionLocal
from models import CollectionPeriod, User
from datetime import datetime, date, timedelta

db = SessionLocal()

# Проверяем, есть ли открытый период
period = db.query(CollectionPeriod).filter(CollectionPeriod.is_open == True).first()

if not period:
    # Создаем период: с 26 числа по 26 число следующего месяца
    today = date.today()

    if today.day >= 26:
        # Если сегодня 26+ число, период с сегодня по 26 следующего месяца
        start = today
        next_month = today.replace(day=28) + timedelta(days=5)  # Переходим на следующий месяц
        end = next_month.replace(day=26)
    else:
        # Если сегодня до 26, период с 26 прошлого месяца по 26 этого
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
    print(f'Period created: {start} to {end}')
    print(f'Deadline: {deadline}')
else:
    print(f'Period exists: {period.period_start} to {period.period_end}')
    print(f'Alliance: {period.alliance}')

db.close()
