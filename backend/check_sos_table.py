from sqlalchemy import inspect
from database import engine

inspector = inspect(engine)

print("\n=== SOS_ALERTS TABLE ===")

if "sos_alerts" not in inspector.get_table_names():
    print("ERROR: sos_alerts table does not exist.")
else:
    print("\nColumns currently in sos_alerts:\n")

    for column in inspector.get_columns("sos_alerts"):
        print(
            f"{column['name']} | "
            f"{column['type']} | "
            f"nullable: {column['nullable']}"
        )