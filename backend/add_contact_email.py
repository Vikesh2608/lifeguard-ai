from sqlalchemy import text
from database import engine


def add_contact_email_column():
    try:
        with engine.begin() as connection:
            connection.execute(
                text("""
                    ALTER TABLE emergency_contacts
                    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
                """)
            )

        print("SUCCESS: contact_email column is ready.")

    except Exception as error:
        print("ERROR:", error)


if __name__ == "__main__":
    add_contact_email_column()