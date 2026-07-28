import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8001";

function SOS() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);

  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [sendingSOS, setSendingSOS] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("lifeguardUser");

    if (!savedUser) {
      navigate("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      loadContacts(parsedUser.email);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("lifeguardUser");
      navigate("/auth");
    }
  }, [navigate]);

  const loadContacts = async (email) => {
    try {
      const response = await fetch(
        `${API_URL}/emergency-contacts/${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load emergency contacts.");
      }

      const data = await response.json();

      setContacts(Array.isArray(data.contacts) ? data.contacts : []);
    } catch (err) {
      console.error(err);
      setContacts([]);
    }
  };

  const getLocation = () => {
    setError("");
    setSuccess("");

    if (!navigator.geolocation) {
      setError("Location services are not supported by this browser.");
      return;
    }

    setLoadingLocation(true);
    setLocationStatus("Getting your location...");

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
      },

      (geoError) => {
        console.error(geoError);

        let message = "Unable to access your location.";

        if (geoError.code === 1) {
          message =
            "Location permission was denied. You can enable location permission in your browser settings.";
        }

        if (geoError.code === 2) {
          message =
            "Your current location could not be determined.";
        }

        if (geoError.code === 3) {
          message =
            "Location request timed out. Please try again.";
        }

        setLocationStatus("");
        setError(message);
        setLoadingLocation(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const prepareSOS = () => {
    setError("");
    setSuccess("");
    setShowConfirm(true);

    if (!location && !loadingLocation) {
      getLocation();
    }
  };

  const sendSOS = async () => {
    if (!user) return;

    setSendingSOS(true);
    setError("");
    setSuccess("");

    try {
      /*
        IMPORTANT:

        This payload assumes your existing POST /sos endpoint
        accepts these fields.

        If your backend schema uses different field names,
        we will adjust this payload to match it.
      */

      const payload = {
        email: user.email,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        message: "Emergency SOS activated from LifeGuard AI",
      };

      const response = await fetch(`${API_URL}/sos`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();

        console.error("SOS response:", responseText);

        throw new Error("The SOS alert could not be recorded.");
      }

      setSuccess(
        "SOS activated. Your emergency event has been recorded in LifeGuard AI."
      );

      setShowConfirm(false);
    } catch (err) {
      console.error(err);

      setError(
        "LifeGuard AI could not record the SOS alert. If this is an emergency, contact emergency services directly."
      );
    } finally {
      setSendingSOS(false);
    }
  };

  const openMap = () => {
    if (!location) {
      getLocation();
      return;
    }

    const mapUrl =
      `https://www.google.com/maps?q=` +
      `${location.latitude},${location.longitude}`;

    window.open(mapUrl, "_blank", "noopener,noreferrer");
  };

  if (!user) {
    return null;
  }

  return (
    <main className="sos-page">
      {/* HERO */}

      <section className="sos-hero">
        <div className="sos-container">
          <p className="sos-label">LIFEGUARD AI EMERGENCY</p>

          <h1>
            Emergency help when every second matters.
          </h1>

          <p className="sos-hero-text">
            Access emergency services, your current location,
            trusted contacts and nearby medical resources from one place.
          </p>

          <p className="sos-user">
            Signed in as {user.email}
          </p>
        </div>
      </section>

      {/* EMERGENCY WARNING */}

      <section className="sos-section">
        <div className="sos-container">
          <div className="emergency-warning">
            <div className="warning-icon">
              🚨
            </div>

            <div>
              <h2>Are you in immediate danger?</h2>

              <p>
                If you are experiencing a life-threatening emergency,
                contact emergency services immediately. LifeGuard AI
                does not replace emergency responders.
              </p>
            </div>

            <a
              href="tel:911"
              className="call-911-button"
            >
              Call 911
            </a>
          </div>
        </div>
      </section>

      {/* MAIN SOS GRID */}

      <section className="sos-section">
        <div className="sos-container">
          {error && (
            <div className="sos-message sos-error">
              {error}
            </div>
          )}

          {success && (
            <div className="sos-message sos-success">
              ✓ {success}
            </div>
          )}

          <div className="sos-grid">
            {/* SOS BUTTON */}

            <div className="sos-card emergency-card">
              <div className="sos-card-icon">
                🚨
              </div>

              <p className="sos-card-label">
                EMERGENCY SOS
              </p>

              <h2>Activate SOS</h2>

              <p>
                Record an emergency event and attach your available
                location information.
              </p>

              <button
                className="sos-main-button"
                onClick={prepareSOS}
                disabled={sendingSOS}
              >
                🚨 Activate SOS
              </button>

              <p className="sos-small-text">
                You will be asked to confirm before the SOS is activated.
              </p>
            </div>

            {/* LOCATION */}

            <div className="sos-card">
              <div className="sos-card-icon">
                📍
              </div>

              <p className="sos-card-label">
                YOUR LOCATION
              </p>

              <h2>Location assistance</h2>

              <p>
                Allow LifeGuard AI to access your device location
                during an emergency.
              </p>

              {!location ? (
                <button
                  className="sos-secondary-button"
                  onClick={getLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation
                    ? "Getting location..."
                    : "📍 Get My Location"}
                </button>
              ) : (
                <>
                  <div className="location-ready">
                    <strong>✓ Location ready</strong>

                    <span>
                      Latitude: {location.latitude.toFixed(6)}
                    </span>

                    <span>
                      Longitude: {location.longitude.toFixed(6)}
                    </span>
                  </div>

                  <button
                    className="sos-secondary-button"
                    onClick={openMap}
                  >
                    View location on map
                  </button>
                </>
              )}

              {locationStatus && (
                <p className="location-status">
                  {locationStatus}
                </p>
              )}
            </div>

            {/* TRUSTED CONTACTS */}

            <div className="sos-card">
              <div className="sos-card-icon">
                👨‍👩‍👧
              </div>

              <p className="sos-card-label">
                TRUSTED CONTACTS
              </p>

              <h2>Your emergency contacts</h2>

              {contacts.length === 0 ? (
                <>
                  <p>
                    You do not currently have emergency contacts available.
                  </p>

                  <Link
                    to="/family"
                    className="sos-secondary-link"
                  >
                    Add emergency contacts →
                  </Link>
                </>
              ) : (
                <div className="sos-contact-list">
                  {contacts.slice(0, 3).map((contact) => (
                    <div
                      className="sos-contact"
                      key={contact.id}
                    >
                      <div className="contact-avatar">
                        {contact.name
                          ? contact.name.charAt(0).toUpperCase()
                          : "?"}
                      </div>

                      <div className="contact-info">
                        <strong>{contact.name}</strong>

                        <span>
                          {contact.relationship}
                        </span>

                        <a href={`tel:${contact.phone}`}>
                          {contact.phone}
                        </a>
                      </div>

                      <a
                        href={`tel:${contact.phone}`}
                        className="contact-call-button"
                      >
                        Call
                      </a>
                    </div>
                  ))}

                  <Link
                    to="/family"
                    className="sos-secondary-link"
                  >
                    Manage contacts →
                  </Link>
                </div>
              )}
            </div>

            {/* HOSPITAL */}

            <div className="sos-card">
              <div className="sos-card-icon">
                🏥
              </div>

              <p className="sos-card-label">
                MEDICAL HELP
              </p>

              <h2>Nearby hospitals</h2>

              <p>
                Find nearby medical facilities using the Hospitals
                section of LifeGuard AI.
              </p>

              <Link
                to="/hospitals"
                className="sos-secondary-link sos-hospital-link"
              >
                🏥 Find Nearby Hospitals →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONFIRMATION MODAL */}

      {showConfirm && (
        <div className="sos-modal-overlay">
          <div
            className="sos-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-confirm-title"
          >
            <div className="sos-modal-icon">
              🚨
            </div>

            <p className="sos-card-label">
              CONFIRM SOS
            </p>

            <h2 id="sos-confirm-title">
              Activate emergency SOS?
            </h2>

            <p>
              This will record an emergency event in LifeGuard AI
              using your account and available location.
            </p>

            {location ? (
              <div className="modal-location">
                <strong>📍 Location available</strong>

                <span>
                  {location.latitude.toFixed(6)},
                  {" "}
                  {location.longitude.toFixed(6)}
                </span>
              </div>
            ) : (
              <div className="modal-location-warning">
                <strong>Location not available yet.</strong>

                <span>
                  You can still activate the SOS.
                </span>
              </div>
            )}

            <div className="sos-modal-actions">
              <button
                className="sos-cancel-button"
                onClick={() => setShowConfirm(false)}
                disabled={sendingSOS}
              >
                Cancel
              </button>

              <button
                className="sos-confirm-button"
                onClick={sendSOS}
                disabled={sendingSOS}
              >
                {sendingSOS
                  ? "Activating..."
                  : "🚨 Confirm SOS"}
              </button>
            </div>

            <a
              href="tel:911"
              className="modal-call-911"
            >
              Call 911 instead
            </a>
          </div>
        </div>
      )}

      {/* SAFETY DISCLAIMER */}

      <section className="sos-safety-section">
        <div className="sos-container">
          <div className="sos-safety-card">
            <span>
              🛡️
            </span>

            <div>
              <h3>Emergency safety</h3>

              <p>
                LifeGuard AI provides emergency-support tools and
                informational resources. Activating SOS inside the
                application does not automatically contact emergency
                responders unless that capability has been separately
                configured. For an immediate emergency, contact local
                emergency services directly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SOS;