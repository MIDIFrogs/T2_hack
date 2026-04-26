from sqlalchemy import create_engine, text
from config import settings

engine = create_engine(str(settings.DATABASE_URL))

with engine.connect() as conn:
    # Begin transaction
    trans = conn.begin()
    try:
        # Add available_vacation_days column
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS available_vacation_days INTEGER DEFAULT 14 NOT NULL"
        ))
        print("Column available_vacation_days added")

        # Add available_off_days column
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS available_off_days INTEGER DEFAULT 5 NOT NULL"
        ))
        print("Column available_off_days added")

        # Commit transaction
        trans.commit()
        print("\nDone! Columns added successfully.")
    except Exception as e:
        trans.rollback()
        print(f"Error: {e}")
