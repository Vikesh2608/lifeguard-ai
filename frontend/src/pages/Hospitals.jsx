import { useEffect, useState } from "react";

const API_URL = "https://lifeguard-ai-ij32.onrender.com";

function Hospitals() {
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(
    "Waiting for your location..."

  );
  const [locationAddress, setLocationAddress] = useState(null);

  const [hospitals, setHospitals] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);

  const [activeTab, setActiveTab] = useState("hospitals");

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // GET USER LOCATION
  // ==========================================

  const getLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Location services are not supported by this browser.");
      return;
    }

    setLoadingLocation(true);
    setLocationStatus("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setLocation(locationData);

        setLocationStatus(
          `Location ready · accuracy approximately ${Math.round(
            position.coords.accuracy
          )} meters`
        );

        setLoadingLocation(false);

        loadNearbyCare(
          position.coords.latitude,
          position.coords.longitude
        );
      },

      (geoError) => {
        console.error(geoError);

        let message = "Unable to access your current location.";

        if (geoError.code === 1) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        }

        if (geoError.code === 2) {
          message =
            "Your current location could not be determined.";
        }

        if (geoError.code === 3) {
          message =
            "Location request timed out. Please try again.";
        }

        setError(message);
        setLocationStatus("");
        setLoadingLocation(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  };

  // ==========================================
  // LOAD NEARBY CARE FROM FASTAPI
  // ==========================================

  const loadNearbyCare = async (latitude, longitude) => {
    setLoadingFacilities(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/nearby-care?latitude=${latitude}&longitude=${longitude}`
      );

      if (!response.ok) {
        let message = "Unable to load nearby medical facilities.";

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            message = errorData.detail;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      const data = await response.json();
      setLocationAddress(data.user_location?.address || null);

      setHospitals(
        Array.isArray(data.hospitals) ? data.hospitals : []
      );

      setClinics(
        Array.isArray(data.clinics) ? data.clinics : []
      );

      setPharmacies(
        Array.isArray(data.pharmacies) ? data.pharmacies : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load nearby hospitals, clinics, and pharmacies."
      );
    } finally {
      setLoadingFacilities(false);
    }
  };

  // ==========================================
  // AUTO GET LOCATION WHEN PAGE LOADS
  // ==========================================

  useEffect(() => {
    getLocation();
  }, []);

  // ==========================================
  // MAP HELPERS
  // ==========================================

  const openGoogleMaps = (facility) => {
    const query = encodeURIComponent(
      `${facility.latitude},${facility.longitude}`
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openAppleMaps = (facility) => {
    const query = encodeURIComponent(
      `${facility.latitude},${facility.longitude}`
    );

    window.open(
      `https://maps.apple.com/?q=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // PHONE HELPER
  // ==========================================

  const callFacility = (phone) => {
    if (!phone) return;

    window.location.href = `tel:${phone}`;
  };

  // ==========================================
  // WEBSITE HELPER
  // ==========================================

  const openWebsite = (website) => {
    if (!website) return;

    window.open(
      website,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // CURRENT FACILITY LIST
  // ==========================================

  const currentFacilities = () => {
    if (activeTab === "clinics") {
      return clinics;
    }

    if (activeTab === "pharmacies") {
      return pharmacies;
    }

    return hospitals;
  };

  // ==========================================
  // FACILITY CARD
  // ==========================================

  const FacilityCard = ({ facility }) => {
    const emergencyAvailable =
      facility.emergency === "yes";

    return (
      <article
        style={{
          background: "#ffffff",
          border: emergencyAvailable
            ? "2px solid #dc2626"
            : "1px solid #dbe4f0",
          borderRadius: "18px",
          padding: "22px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
        }}
      >
        {/* TOP */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                textTransform: "uppercase",
                color:
                  facility.type === "hospital"
                    ? "#2563eb"
                    : facility.type === "pharmacy"
                    ? "#7c3aed"
                    : "#059669",
                marginBottom: "8px",
              }}
            >
              {facility.type === "hospital" && "🏥 Hospital"}

              {facility.type === "clinic" && "🩺 Clinic / Urgent Care"}

              {facility.type === "pharmacy" && "💊 Pharmacy"}
            </div>

            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "22px",
                color: "#102a56",
              }}
            >
              {facility.name || "Medical Facility"}
            </h3>

            {emergencyAvailable && (
              <div
                style={{
                  display: "inline-block",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: "700",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  marginBottom: "10px",
                }}
              >
                🚨 Emergency care listed
              </div>
            )}
          </div>

          {facility.distance_miles !== null &&
            facility.distance_miles !== undefined && (
              <div
                style={{
                  background: "#eff6ff",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  color: "#1d4ed8",
                }}
              >
                📍 {facility.distance_miles} mi
              </div>
            )}
        </div>

        {/* INFORMATION */}

        <div
          style={{
            marginTop: "16px",
            lineHeight: "1.7",
            color: "#334155",
          }}
        >
          {facility.address && (
            <div>
              <strong>Address:</strong>{" "}
              {facility.address}
            </div>
          )}

          {facility.phone && (
            <div>
              <strong>Phone:</strong>{" "}
              {facility.phone}
            </div>
          )}

          {facility.opening_hours && (
            <div>
              <strong>Hours:</strong>{" "}
              {facility.opening_hours}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => openGoogleMaps(facility)}
            style={primaryButton}
          >
            🗺️ Google Maps
          </button>

          <button
            type="button"
            onClick={() => openAppleMaps(facility)}
            style={secondaryButton}
          >
            🍎 Apple Maps
          </button>

          {facility.phone && (
            <button
              type="button"
              onClick={() =>
                callFacility(facility.phone)
              }
              style={secondaryButton}
            >
              📞 Call
            </button>
          )}

          {facility.website && (
            <button
              type="button"
              onClick={() =>
                openWebsite(facility.website)
              }
              style={secondaryButton}
            >
              🌐 Website
            </button>
          )}
        </div>
      </article>
    );
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f8fd",
      }}
    >
      {/* HERO */}

      <section
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          padding: "55px 30px 30px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #102a56, #2563eb)",
            borderRadius: "28px",
            padding: "45px",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            🏥 LIFEGUARD AI MEDICAL FINDER
          </div>

          <h1
            style={{
              margin: "0 0 16px 0",
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: "1.05",
            }}
          >
            Find medical care near you.
          </h1>

          <p
            style={{
              fontSize: "20px",
              maxWidth: "850px",
              lineHeight: "1.6",
              marginBottom: "25px",
            }}
          >
            Find nearby hospitals, clinics, urgent care
            centers, and pharmacies using your current
            location.
          </p>

          <button
            type="button"
            onClick={getLocation}
            disabled={
              loadingLocation || loadingFacilities
            }
            style={{
              ...whiteButton,
              opacity:
                loadingLocation || loadingFacilities
                  ? 0.65
                  : 1,
            }}
          >
            {loadingLocation
              ? "📍 Getting location..."
              : loadingFacilities
              ? "🔎 Searching nearby..."
              : "📍 Find Care Near Me"}
          </button>
        </div>
      </section>

      {/* LOCATION */}

      <section
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          padding: "0 30px 25px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "20px",
            border: "1px solid #dbe4f0",
          }}
        >
          <strong>📍 Your location</strong>


{locationAddress?.display_name && (
  <div
    style={{
      marginTop: "10px",
      fontSize: "18px",
      fontWeight: "700",
      color: "#102a56",
      lineHeight: "1.5",
    }}
  >
    {locationAddress.display_name}
  </div>
)}

<div
  style={{
    marginTop: "8px",
    color: "#475569",
  }}
>
  {locationStatus}
</div>

{location && (
  <div
    style={{
      marginTop: "6px",
      fontSize: "14px",
      color: "#64748b",
    }}
  >
    Latitude: {location.latitude.toFixed(6)} · Longitude:{" "}
    {location.longitude.toFixed(6)}
  </div>
)}

        </div>
      </section>

      {/* ERROR */}

      {error && (
        <section
          style={{
            maxWidth: "1500px",
            margin: "0 auto",
            padding: "0 30px 25px",
          }}
        >
          <div
            style={{
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
              padding: "18px",
              borderRadius: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        </section>
      )}

      {/* RESULTS */}

      <section
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          padding: "10px 30px 70px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <div>
            <div
              style={{
                color: "#2563eb",
                fontWeight: "700",
              }}
            >
              NEARBY CARE
            </div>

            <h2
              style={{
                margin: "6px 0",
                fontSize: "34px",
                color: "#102a56",
              }}
            >
              Medical facilities near you
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748b",
              }}
            >
              {hospitals.length +
                clinics.length +
                pharmacies.length}{" "}
              nearby facilities found.
            </p>
          </div>
        </div>

        {/* TABS */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("hospitals")}
            style={
              activeTab === "hospitals"
                ? activeTabButton
                : tabButton
            }
          >
            🏥 Hospitals ({hospitals.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clinics")}
            style={
              activeTab === "clinics"
                ? activeTabButton
                : tabButton
            }
          >
            🩺 Clinics & Urgent Care ({clinics.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pharmacies")}
            style={
              activeTab === "pharmacies"
                ? activeTabButton
                : tabButton
            }
          >
            💊 Pharmacies ({pharmacies.length})
          </button>
        </div>

        {/* LOADING */}

        {loadingFacilities && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <h3>🔎 Searching nearby medical care...</h3>

            <p>
              LifeGuard AI is finding medical facilities
              around your current location.
            </p>
          </div>
        )}

        {/* FACILITIES */}

        {!loadingFacilities &&
          currentFacilities().length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "20px",
              }}
            >
              {currentFacilities().map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                />
              ))}
            </div>
          )}

        {!loadingFacilities &&
          location &&
          currentFacilities().length === 0 && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "40px",
                textAlign: "center",
                border: "1px solid #dbe4f0",
              }}
            >
              <h3>No facilities found in this category.</h3>

              <p>
                Try another category or refresh your
                location.
              </p>
            </div>
          )}

        {/* SAFETY */}

        <div
          style={{
            marginTop: "40px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "18px",
            padding: "24px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              color: "#9a3412",
            }}
          >
            🚨 Need emergency help?
          </h3>

          <p
            style={{
              marginBottom: 0,
              lineHeight: "1.6",
              color: "#7c2d12",
            }}
          >
            Nearby-care information may be incomplete or
            outdated. For a life-threatening emergency,
            contact local emergency services directly.
            LifeGuard AI does not replace emergency
            responders.
          </p>
        </div>
      </section>
    </main>
  );
}

// ==========================================
// BUTTON STYLES
// ==========================================

const primaryButton = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  padding: "11px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "15px",
};

const secondaryButton = {
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#102a56",
  padding: "11px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "15px",
};

const whiteButton = {
  border: "none",
  background: "#ffffff",
  color: "#102a56",
  padding: "14px 20px",
  borderRadius: "12px",
  fontWeight: "800",
  cursor: "pointer",
  fontSize: "17px",
};

const tabButton = {
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#102a56",
  padding: "13px 18px",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "16px",
};

const activeTabButton = {
  ...tabButton,
  background: "#2563eb",
  color: "#ffffff",
  border: "1px solid #2563eb",
};

export default Hospitals;