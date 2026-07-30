from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float
)

from datetime import datetime

from database import Base


# ======================================
# USERS TABLE
# ======================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100))

    last_name = Column(String(100))

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )


# ======================================
# SOS ALERTS TABLE
# ======================================

class SOSAlert(Base):
    __tablename__ = "sos_alerts"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255))

    latitude = Column(Float)

    longitude = Column(Float)

    hospital_name = Column(String(255))

    zipcode = Column(String(20))

    alert_type = Column(String(100))

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ======================================
# MOOD LOGS TABLE
# ======================================

class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255))

    mood = Column(String(100))

    notes = Column(String(500))

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ======================================
# SLEEP LOGS TABLE
# ======================================

class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255))

    sleep_hours = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ======================================
# EMERGENCY CONTACTS TABLE
# ======================================

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)

    # LifeGuard AI user's email
    email = Column(
        String(255),
        nullable=False,
        index=True
    )

    contact_name = Column(
        String(100),
        nullable=False
    )

    contact_phone = Column(
        String(30),
        nullable=False
    )

    # Emergency contact's email
    contact_email = Column(
        String(255),
        nullable=True
    )

    relationship = Column(
        String(50),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )