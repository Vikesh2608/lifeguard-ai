from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from geopy.geocoders import Nominatim

from database import SessionLocal, Base, engine
from models import (
    User,
    SOSAlert,
    MoodLog,
    SleepLog,
    EmergencyContact
)

from schemas import (
    UserCreate,
    LoginRequest,
    SOSRequest,
    MoodRequest,
    SleepRequest,
    EmergencyContactRequest
)

from security import (
    get_password_hash,
    verify_password
)

app = FastAPI(
    title="LifeGuard AI API",
    description="Backend API for LifeGuard AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ======================================
# CREATE DATABASE TABLES
# ======================================

print("DATABASE HOST:", engine.url.host)
print("DATABASE NAME:", engine.url.database)
print("REGISTERED TABLES:", list(Base.metadata.tables.keys()))

Base.metadata.create_all(bind=engine)
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not configured")


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

print("DATABASE TABLE CREATION COMPLETED")

geolocator = Nominatim(user_agent="lifeguard_ai")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# DATABASE SESSION
# ==========================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================
# ROOT
# ==========================

@app.get("/")
def root():
    return {
        "message": "Welcome to LifeGuard AI"
    }

# ==========================
# HEALTH
# ==========================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "application": "LifeGuard AI"
    }

# ==========================
# REGISTER
# ==========================

@app.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        return {
            "message": "Email already registered"
        }

    hashed_password = get_password_hash(
        user.password
    )

    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }

# ==========================
# LOGIN
# ==========================

@app.post("/login")
def login_user(
    login: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == login.email
    ).first()

    if not user:
        return {
            "message": "User not found"
        }

    if not verify_password(
        login.password,
        user.password_hash
    ):
        return {
            "message": "Invalid password"
        }

    return {
        "message": "Login successful",
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name
    }

# ==========================
# ZIP CODE LOOKUP
# ==========================

def get_zipcode(latitude, longitude):

    try:
        location = geolocator.reverse(
            f"{latitude},{longitude}"
        )

        if location:

            address = location.raw.get(
                "address",
                {}
            )

            return address.get(
                "postcode",
                "Unknown"
            )

    except Exception:
        pass

    return "Unknown"

# ==========================
# SOS
# ==========================

@app.post("/sos")
def emergency_sos(
    sos: SOSRequest,
    db: Session = Depends(get_db)
):

    zipcode = get_zipcode(
        sos.latitude,
        sos.longitude
    )

    alert = SOSAlert(
        email=sos.email,
        latitude=sos.latitude,
        longitude=sos.longitude,
        hospital_name="Hospital Finder Coming Soon",
        zipcode=zipcode,
        alert_type="EMERGENCY_SOS"
    )

    db.add(alert)
    db.commit()

    return {
        "status": "Emergency Alert Sent",
        "zipcode": zipcode,
        "latitude": sos.latitude,
        "longitude": sos.longitude,
        "hospital": "Hospital Finder Coming Soon"
    }

# ==========================
# VIEW SOS ALERTS
# ==========================

@app.get("/sos-alerts")
def get_sos_alerts(
    db: Session = Depends(get_db)
):
    return db.query(SOSAlert).all()

# ==========================
# MOOD TRACKER
# ==========================

@app.post("/mood")
def save_mood(
    mood_data: MoodRequest,
    db: Session = Depends(get_db)
):

    mood = MoodLog(
        email=mood_data.email,
        mood=mood_data.mood,
        notes=mood_data.notes
    )

    db.add(mood)
    db.commit()

    return {
        "message": "Mood saved",
        "mood": mood_data.mood
    }

# ==========================
# SLEEP TRACKER
# ==========================

@app.post("/sleep")
def save_sleep(
    sleep_data: SleepRequest,
    db: Session = Depends(get_db)
):

    sleep = SleepLog(
        email=sleep_data.email,
        sleep_hours=sleep_data.sleep_hours
    )

    db.add(sleep)
    db.commit()

    return {
        "message": "Sleep recorded",
        "hours": sleep_data.sleep_hours
    }

# ==========================
# EMERGENCY CONTACTS
# ==========================

@app.post("/emergency-contact")
def add_emergency_contact(
    contact: EmergencyContactRequest,
    db: Session = Depends(get_db)
):
    new_contact = EmergencyContact(
        email=contact.email,
        contact_name=contact.contact_name,
        contact_phone=contact.contact_phone,
        contact_email=contact.contact_email,
        relationship=contact.relationship
    )

    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    return {
        "message": "Emergency contact saved",
        "contact": contact.contact_name
    }
# ==========================================
# GET EMERGENCY CONTACTS
# ==========================================

@app.get("/emergency-contacts/{email}")
def get_emergency_contacts(
    email: str,
    db: Session = Depends(get_db)
):
    contacts = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.email == email)
        .order_by(EmergencyContact.created_at.desc())
        .all()
    )

    return {
        "email": email,
        "contacts": [
            {
                "id": contact.id,
                "contact_name": contact.contact_name,
                "contact_phone": contact.contact_phone,
                "relationship": contact.relationship,
                "created_at": contact.created_at
            }
            for contact in contacts
        ]
    }


# ==========================================
# DELETE EMERGENCY CONTACT
# ==========================================

@app.delete("/emergency-contact/{contact_id}")
def delete_emergency_contact(
    contact_id: int,
    email: str,
    db: Session = Depends(get_db)
):
    contact = (
        db.query(EmergencyContact)
        .filter(
            EmergencyContact.id == contact_id,
            EmergencyContact.email == email
        )
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=404,
            detail="Emergency contact not found"
        )

    db.delete(contact)
    db.commit()

    return {
        "message": "Emergency contact removed successfully"
    }

# ==========================
# WELLNESS SCORE CALCULATOR
# ==========================

def calculate_wellness(email: str, db: Session):

    latest_mood = (
        db.query(MoodLog)
        .filter(MoodLog.email == email)
        .order_by(MoodLog.created_at.desc())
        .first()
    )

    latest_sleep = (
        db.query(SleepLog)
        .filter(SleepLog.email == email)
        .order_by(SleepLog.created_at.desc())
        .first()
    )

    # Neutral starting point
    score = 50

    mood_value = None
    sleep_hours = None

    # --------------------------
    # MOOD
    # --------------------------

    if latest_mood:

        mood_value = latest_mood.mood

        mood_scores = {
            "Great": 25,
            "Good": 18,
            "Okay": 8,
            "Low": -10
        }

        score += mood_scores.get(mood_value, 0)

    # --------------------------
    # SLEEP
    # --------------------------

    if latest_sleep:

        sleep_hours = latest_sleep.sleep_hours

        if 7 <= sleep_hours <= 9:
            score += 25

        elif 6 <= sleep_hours < 7:
            score += 15

        elif 5 <= sleep_hours < 6:
            score += 5

        elif 4 <= sleep_hours < 5:
            score -= 5

        elif sleep_hours < 4:
            score -= 15

        elif 9 < sleep_hours <= 10:
            score += 15

        elif sleep_hours > 10:
            score += 5

    score = max(0, min(100, score))

    if score >= 80:
        status = "Doing well"

    elif score >= 60:
        status = "Moderate"

    elif score >= 40:
        status = "Needs attention"

    else:
        status = "Low wellness"

    return {
        "wellness_score": score,
        "status": status,
        "latest_mood": mood_value,
        "latest_sleep_hours": sleep_hours
    }


# ==========================
# WELLNESS SCORE ENDPOINT
# ==========================

@app.get("/wellness-score/{email}")
def wellness_score(
    email: str,
    db: Session = Depends(get_db)
):

    wellness = calculate_wellness(email, db)

    return {
        "email": email,
        **wellness
    }


# ==========================
# DASHBOARD OVERVIEW
# ==========================

@app.get("/dashboard/{email}")
def dashboard_overview(
    email: str,
    db: Session = Depends(get_db)
):

    wellness = calculate_wellness(email, db)

    emergency_contacts_count = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.email == email)
        .count()
    )

    return {
        "email": email,
        "wellness_score": wellness["wellness_score"],
        "wellness_status": wellness["status"],
        "latest_mood": wellness["latest_mood"],
        "latest_sleep": wellness["latest_sleep_hours"],
        "emergency_contacts": emergency_contacts_count
    }
import math
import requests


# ==========================================
# NEARBY MEDICAL CARE
# ==========================================

import math
import time
import requests


# Multiple public Overpass providers.
# If one is busy/rate-limited, LifeGuard AI can try another.
OVERPASS_URLS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.nchc.org.tw/api/interpreter",
]


# Simple in-memory cache.
# This prevents repeated clicks from repeatedly hitting Overpass.
NEARBY_CARE_CACHE = {}

CACHE_TTL_SECONDS = 600  # 10 minutes


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate straight-line distance between two coordinates.
    Returns miles.
    """

    earth_radius_miles = 3958.8

    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return earth_radius_miles * c


def get_element_coordinates(element):
    """
    Nodes have lat/lon directly.
    Ways and relations normally use center coordinates.
    """

    if "lat" in element and "lon" in element:
        return element["lat"], element["lon"]

    center = element.get("center")

    if center:
        return center.get("lat"), center.get("lon")

    return None, None


def reverse_geocode(latitude: float, longitude: float):
    """
    Convert latitude/longitude into a human-readable address.
    """

    try:
        url = "https://nominatim.openstreetmap.org/reverse"

        params = {
            "lat": latitude,
            "lon": longitude,
            "format": "jsonv2",
            "addressdetails": 1,
            "zoom": 18,
        }

        headers = {
            "User-Agent": "LifeGuardAI/1.0"
        }

        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()
        address = data.get("address", {})

        return {
            "display_name": data.get("display_name"),

            "house_number": address.get("house_number"),

            "road": (
                address.get("road")
                or address.get("pedestrian")
                or address.get("residential")
            ),

            "neighbourhood": (
                address.get("neighbourhood")
                or address.get("suburb")
            ),

            "city": (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("municipality")
            ),

            "county": address.get("county"),
            "state": address.get("state"),
            "postcode": address.get("postcode"),
            "country": address.get("country"),
            "country_code": address.get("country_code"),
        }

    except requests.RequestException as exc:

        print(
            "LifeGuard AI reverse geocoding failed:",
            repr(exc)
        )

        return None


def make_cache_key(latitude, longitude, radius):
    """
    Round coordinates so tiny GPS changes do not create
    unnecessary new Overpass searches.
    """

    return (
        round(latitude, 3),
        round(longitude, 3),
        radius
    )


def get_cached_nearby_care(cache_key):
    cached = NEARBY_CARE_CACHE.get(cache_key)

    if not cached:
        return None

    age = time.time() - cached["timestamp"]

    if age > CACHE_TTL_SECONDS:
        return None

    return cached["data"]


def save_nearby_care_cache(cache_key, data):
    NEARBY_CARE_CACHE[cache_key] = {
        "timestamp": time.time(),
        "data": data
    }


@app.get("/nearby-care")
def nearby_care(
    latitude: float,
    longitude: float,
    radius: int = 10000
):
    """
    Find hospitals, clinics, urgent care and pharmacies.

    Default radius: 10 km
    Maximum radius: 50 km
    """

    # ------------------------------------------
    # VALIDATE LOCATION
    # ------------------------------------------

    if not -90 <= latitude <= 90:
        raise HTTPException(
            status_code=400,
            detail="Invalid latitude."
        )

    if not -180 <= longitude <= 180:
        raise HTTPException(
            status_code=400,
            detail="Invalid longitude."
        )

    radius = max(
        1000,
        min(radius, 50000)
    )

    # ------------------------------------------
    # CACHE
    # ------------------------------------------

    cache_key = make_cache_key(
        latitude,
        longitude,
        radius
    )

    cached_data = get_cached_nearby_care(
        cache_key
    )

    if cached_data:

        print(
            "LifeGuard AI: returning cached nearby care"
        )

        # Copy top-level object before changing metadata.
        result = dict(cached_data)

        result["cached"] = True
        result["message"] = (
            "Showing recently retrieved nearby medical facilities."
        )

        return result

    # ------------------------------------------
    # CURRENT ADDRESS
    # ------------------------------------------

    location_address = reverse_geocode(
        latitude,
        longitude
    )

    # ------------------------------------------
    # OVERPASS QUERY
    # ------------------------------------------

    query = f"""
    [out:json][timeout:25];

    (
        nwr["amenity"="hospital"]
            (around:{radius},{latitude},{longitude});

        nwr["amenity"="clinic"]
            (around:{radius},{latitude},{longitude});

        nwr["amenity"="pharmacy"]
            (around:{radius},{latitude},{longitude});
    );

    out center tags;
    """

    headers = {
        "User-Agent": "LifeGuardAI/1.0",
        "Accept": "application/json",
    }

    data = None
    last_error = None
    provider_used = None

    # ------------------------------------------
    # TRY OVERPASS PROVIDERS
    # ------------------------------------------

    for overpass_url in OVERPASS_URLS:

        try:

            print(
                f"LifeGuard AI trying: {overpass_url}"
            )

            response = requests.post(
                overpass_url,
                data={"data": query},
                headers=headers,
                timeout=35
            )

            # Provider rate limited us.
            if response.status_code == 429:

                print(
                    f"Provider rate limited: {overpass_url}"
                )

                last_error = (
                    f"{overpass_url} returned HTTP 429"
                )

                continue

            # Provider temporarily unavailable.
            if response.status_code in (
                502,
                503,
                504
            ):

                print(
                    f"Provider unavailable: "
                    f"{overpass_url} "
                    f"HTTP {response.status_code}"
                )

                last_error = (
                    f"{overpass_url} returned "
                    f"HTTP {response.status_code}"
                )

                continue

            response.raise_for_status()

            data = response.json()

            provider_used = overpass_url

            print(
                "LifeGuard AI nearby care provider "
                f"succeeded: {overpass_url}"
            )

            break

        except requests.Timeout as exc:

            print(
                f"Provider timeout: {overpass_url}"
            )

            last_error = exc

        except requests.RequestException as exc:

            print(
                f"Provider request failed: "
                f"{overpass_url} -> {exc}"
            )

            last_error = exc

        except ValueError as exc:

            print(
                f"Provider returned invalid JSON: "
                f"{overpass_url}"
            )

            last_error = exc

    # ------------------------------------------
    # ALL PROVIDERS FAILED
    # ------------------------------------------

    if data is None:

        print(
            "LifeGuard AI nearby medical search failed:",
            repr(last_error)
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Nearby medical search is temporarily busy. "
                "Please wait a moment and try again."
            )
        )

    # ------------------------------------------
    # PROCESS FACILITIES
    # ------------------------------------------

    facilities = []

    seen_ids = set()

    for element in data.get("elements", []):

        element_id = (
            f'{element.get("type")}-'
            f'{element.get("id")}'
        )

        # Avoid duplicate objects.
        if element_id in seen_ids:
            continue

        seen_ids.add(element_id)

        tags = element.get("tags", {})

        facility_lat, facility_lon = (
            get_element_coordinates(element)
        )

        if (
            facility_lat is None
            or facility_lon is None
        ):
            continue

        facility_type = tags.get(
            "amenity",
            "medical"
        )

        if facility_type not in (
            "hospital",
            "clinic",
            "pharmacy"
        ):
            continue

        name = tags.get("name")

        if not name:

            if facility_type == "hospital":
                name = "Hospital"

            elif facility_type == "clinic":
                name = "Medical Clinic"

            elif facility_type == "pharmacy":
                name = "Pharmacy"

        distance = calculate_distance(
            latitude,
            longitude,
            facility_lat,
            facility_lon
        )

        # --------------------------------------
        # ADDRESS
        # --------------------------------------

        street_address = " ".join(
            part
            for part in [
                tags.get("addr:housenumber"),
                tags.get("addr:street"),
            ]
            if part
        )

        city = (
            tags.get("addr:city")
            or tags.get("addr:town")
            or tags.get("addr:village")
        )

        city_state_zip = ", ".join(
            part
            for part in [
                city,
                tags.get("addr:state"),
                tags.get("addr:postcode"),
            ]
            if part
        )

        address_parts = [
            part
            for part in [
                street_address,
                city_state_zip,
            ]
            if part
        ]

        address = ", ".join(address_parts)

        # --------------------------------------
        # PHONE / WEBSITE
        # --------------------------------------

        phone = (
            tags.get("phone")
            or tags.get("contact:phone")
        )

        website = (
            tags.get("website")
            or tags.get("contact:website")
        )

        # --------------------------------------
        # EMERGENCY CAPABILITY
        # --------------------------------------

        emergency = tags.get("emergency")

        emergency_available = (
            emergency == "yes"
        )

        # --------------------------------------
        # FACILITY
        # --------------------------------------

        facilities.append(
            {
                "id": element_id,

                "name": name,

                "type": facility_type,

                "latitude": facility_lat,

                "longitude": facility_lon,

                "distance_miles": round(
                    distance,
                    2
                ),

                "address": (
                    address
                    if address
                    else None
                ),

                "phone": phone,

                "website": website,

                "emergency": emergency,

                "emergency_available": (
                    emergency_available
                ),

                "opening_hours": tags.get(
                    "opening_hours"
                ),

                "map_query": (
                    f"{facility_lat},"
                    f"{facility_lon}"
                ),
            }
        )

    # ------------------------------------------
    # SORT
    #
    # Emergency hospitals first,
    # then everything by distance.
    # ------------------------------------------

    facilities.sort(
        key=lambda facility: (
            0
            if (
                facility["type"] == "hospital"
                and facility["emergency_available"]
            )
            else 1,

            facility["distance_miles"]
        )
    )

    # ------------------------------------------
    # GROUP FACILITIES
    # ------------------------------------------

    hospitals = [
        facility
        for facility in facilities
        if facility["type"] == "hospital"
    ]

    clinics = [
        facility
        for facility in facilities
        if facility["type"] == "clinic"
    ]

    pharmacies = [
        facility
        for facility in facilities
        if facility["type"] == "pharmacy"
    ]

    emergency_hospitals = [
        facility
        for facility in hospitals
        if facility["emergency_available"]
    ]

    # ------------------------------------------
    # FINAL RESPONSE
    # ------------------------------------------

    result = {

        "user_location": {
            "latitude": latitude,
            "longitude": longitude,
            "address": location_address,
        },

        "search_radius_meters": radius,

        "total": len(facilities),

        "counts": {
            "hospitals": len(hospitals),
            "clinics": len(clinics),
            "pharmacies": len(pharmacies),
            "emergency_hospitals": len(
                emergency_hospitals
            ),
        },

        "hospitals": hospitals,

        "emergency_hospitals": (
            emergency_hospitals
        ),

        "clinics": clinics,

        "pharmacies": pharmacies,

        "facilities": facilities,

        "cached": False,

        "message": (
            "Nearby medical facilities retrieved."
        ),

        # Useful for backend debugging.
        # The frontend does not need to display this.
        "provider": provider_used,
    }

    # ------------------------------------------
    # SAVE SUCCESSFUL RESULT
    # ------------------------------------------

    save_nearby_care_cache(
        cache_key,
        result
    )

    return result
# ==========================
# REAL-TIME AI ASSISTANT
# ==========================

import os

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel


# Load variables from backend/.env
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


class AIAssistantRequest(BaseModel):
    email: str
    message: str


@app.post("/ai-assistant")
def ai_assistant(request: AIAssistantRequest):

    message = request.message.strip()

    # --------------------------
    # EMPTY MESSAGE CHECK
    # --------------------------

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a message."
        )

    # --------------------------
    # API KEY CHECK
    # --------------------------

    if client is None:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured."
        )

    # --------------------------
    # BASIC EMERGENCY GUARDRAIL
    # --------------------------

    text = message.lower()

    emergency_terms = [
        "can't breathe",
        "cannot breathe",
        "not breathing",
        "unconscious",
        "severe bleeding",
        "chest pain",
        "overdose",
        "suicide",
        "kill myself",
        "car accident",
        "serious crash",
        "fire",
    ]

    if any(term in text for term in emergency_terms):

        return {
            "reply": (
                "This may require immediate assistance. "
                "If there is immediate danger or a medical emergency, "
                "contact local emergency services now. "
                "You can also open the SOS section in LifeGuard AI."
            )
        }

    # --------------------------
    # OPENAI REQUEST
    # --------------------------

    try:

        response = client.responses.create(
            model="gpt-5-mini",

            instructions="""
You are LifeGuard AI Assistant, an informational wellness,
personal-safety, family-safety, and emergency-preparedness assistant.

Your role is to provide helpful, clear, conversational information.

You may help users with topics including:

- general wellness
- sleep habits
- stress management
- personal safety
- family preparedness
- emergency preparedness
- emergency kits
- healthy daily routines
- general lifestyle questions
- navigating LifeGuard AI features

Important safety rules:

1. Do not claim to be a doctor.
2. Do not diagnose medical conditions.
3. Do not replace professional medical care.
4. If a user appears to be experiencing an immediate emergency,
   tell them to contact local emergency services.
5. Do not claim that LifeGuard AI contacted emergency responders
   unless the application actually performed that action.
6. Be supportive but do not exaggerate LifeGuard AI capabilities.
7. Answer normal conversational questions naturally.
8. Keep answers practical and easy to understand.
9. If the question is outside wellness or safety, you may still
   have a normal helpful conversation, but keep the LifeGuard AI
   role clear when relevant.

The user is interacting with you through the LifeGuard AI application.
""",

            input=message
        )

        reply = response.output_text

        if not reply:
            reply = (
                "I couldn't generate a response right now. "
                "Please try again."
            )

        return {
            "reply": reply
        }

    # --------------------------
    # OPENAI ERROR
    # --------------------------

    except Exception as exc:

        print("OpenAI error:", repr(exc))

        raise HTTPException(
            status_code=500,
            detail="LifeGuard AI Assistant could not generate a response."
        )