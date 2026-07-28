from sqlalchemy import text
from database import engine

commands = [
    "ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;",
    "ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;",
    "ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255);",
    "ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS zipcode VARCHAR(20);",
]

try:
    with engine.begin() as connection:
        for command in commands:
            connection.execute(text(command))

    print("SUCCESS: sos_alerts table updated.")

except Exception as e:
    print("ERROR:", e)