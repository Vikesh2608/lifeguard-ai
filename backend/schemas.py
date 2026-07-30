from pydantic import BaseModel, EmailStr


# ======================================
# USER REGISTRATION
# ======================================

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


# ======================================
# LOGIN
# ======================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ======================================
# SOS
# ======================================

class SOSRequest(BaseModel):
    email: str
    latitude: float
    longitude: float


# ======================================
# MOOD TRACKER
# ======================================

class MoodRequest(BaseModel):
    email: str
    mood: str
    notes: str = ""


# ======================================
# SLEEP TRACKER
# ======================================

class SleepRequest(BaseModel):
    email: str
    sleep_hours: float


# ======================================
# EMERGENCY CONTACT
# ======================================

class EmergencyContactRequest(BaseModel):
    email: EmailStr
    contact_name: str
    contact_phone: str
    contact_email: EmailStr | None = None
    relationship: str 