import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8001";

function Family() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  const [contacts, setContacts] = useState([]);

  const [loadingContacts, setLoadingContacts] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD SIGNED-IN USER
  // ==========================================

  useEffect(() => {
    const savedUser = localStorage.getItem("lifeguardUser");

    if (!savedUser) {
      navigate("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser.email) {
        throw new Error("Missing user email.");
      }

      setUser(parsedUser);
    } catch (err) {
      console.error(err);

      localStorage.removeItem("lifeguardUser");
      navigate("/auth");
    }
  }, [navigate]);

  // ==========================================
  // LOAD EMERGENCY CONTACTS
  // ==========================================

  const loadContacts = async (email) => {
    setLoadingContacts(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/emergency-contacts/${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load emergency contacts.");
      }

      const data = await response.json();

      setContacts(data.contacts || []);
    } catch (err) {
      console.error(err);

      setError("Emergency contacts could not be loaded.");
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadContacts(user.email);
    }
  }, [user]);

  // ==========================================
  // ADD CONTACT
  // ==========================================

  const handleAddContact = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!user?.email) {
      setError("Please sign in before adding an emergency contact.");
      return;
    }

    if (!contactName.trim()) {
      setError("Please enter the contact's name.");
      return;
    }

    if (!contactPhone.trim()) {
      setError("Please enter the contact's phone number.");
      return;
    }

    if (!relationship.trim()) {
      setError("Please select a relationship.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/emergency-contact`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: user.email,
          contact_name: contactName.trim(),
          contact_phone: contactPhone.trim(),
          relationship: relationship,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to save emergency contact."
        );
      }

      setContactName("");
      setContactPhone("");
      setRelationship("");

      setMessage("Emergency contact added successfully.");

      await loadContacts(user.email);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Something went wrong while saving the contact."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE CONTACT
  // ==========================================

  const handleDelete = async (contactId) => {
    if (!user?.email) {
      return;
    }

    const confirmed = window.confirm(
      "Remove this emergency contact?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/emergency-contact/${contactId}?email=${encodeURIComponent(
          user.email
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to remove emergency contact."
        );
      }

      setMessage("Emergency contact removed.");

      await loadContacts(user.email);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Something went wrong while removing the contact."
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="family-page">

      {/* ======================================
          HERO
      ====================================== */}

      <section className="family-hero">
        <div className="family-container">

          <p className="family-label">
            LIFEGUARD AI FAMILY SAFETY
          </p>

          <h1>
            Protect the people who matter most.
          </h1>

          <p className="family-intro">
            Store trusted emergency contacts so important information
            is available when you need it.
          </p>

          <p className="family-user">
            Welcome, {user.firstName || "User"}
          </p>

        </div>
      </section>


      {/* ======================================
          FAMILY CONTENT
      ====================================== */}

      <section className="family-section">

        <div className="family-container">

          <div className="family-heading">

            <div>
              <p className="family-label">
                FAMILY SAFETY
              </p>

              <h2>
                Emergency contacts
              </h2>
            </div>

            <p className="family-email">
              {user.email}
            </p>

          </div>


          {/* ==================================
              STATUS MESSAGES
          ================================== */}

          {message && (
            <div className="family-success">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="family-error">
              {error}
            </div>
          )}


          <div className="family-grid">

            {/* ==================================
                ADD CONTACT
            ================================== */}

            <div className="family-card">

              <div className="family-icon">
                👤
              </div>

              <p className="family-label">
                ADD CONTACT
              </p>

              <h2>
                Add a trusted person
              </h2>

              <p className="family-description">
                Add someone who can be contacted during an emergency.
              </p>


              <form
                className="family-form"
                onSubmit={handleAddContact}
              >

                <label>
                  Contact name
                </label>

                <input
                  type="text"
                  value={contactName}
                  onChange={(event) =>
                    setContactName(event.target.value)
                  }
                  placeholder="Example: John Smith"
                  autoComplete="name"
                />


                <label>
                  Phone number
                </label>

                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(event) =>
                    setContactPhone(event.target.value)
                  }
                  placeholder="Example: +1 513 555 1234"
                  autoComplete="tel"
                />


                <label>
                  Relationship
                </label>

                <select
                  value={relationship}
                  onChange={(event) =>
                    setRelationship(event.target.value)
                  }
                >

                  <option value="">
                    Select relationship
                  </option>

                  <option value="Spouse">
                    Spouse
                  </option>

                  <option value="Parent">
                    Parent
                  </option>

                  <option value="Child">
                    Child
                  </option>

                  <option value="Sibling">
                    Sibling
                  </option>

                  <option value="Friend">
                    Friend
                  </option>

                  <option value="Caregiver">
                    Caregiver
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>


                <button
                  type="submit"
                  className="family-primary-button"
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : "Add Emergency Contact"}

                </button>

              </form>

            </div>


            {/* ==================================
                SAVED CONTACTS
            ================================== */}

            <div className="family-card">

              <div className="family-icon">
                👨‍👩‍👧
              </div>

              <p className="family-label">
                TRUSTED CONTACTS
              </p>

              <h2>
                Your emergency contacts
              </h2>

              <p className="family-description">
                These contacts are associated with your LifeGuard AI
                account.
              </p>


              {loadingContacts ? (

                <p>
                  Loading contacts...
                </p>

              ) : contacts.length === 0 ? (

                <div className="family-empty">

                  <div className="family-empty-icon">
                    🛡️
                  </div>

                  <h3>
                    No emergency contacts yet
                  </h3>

                  <p>
                    Add your first trusted contact using the form.
                  </p>

                </div>

              ) : (

                <div className="contact-list">

                  {contacts.map((contact) => (

                    <div
                      className="contact-item"
                      key={contact.id}
                    >

                      <div className="contact-avatar">
                        {contact.contact_name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>


                      <div className="contact-information">

                        <h3>
                          {contact.contact_name}
                        </h3>

                        <p>
                          {contact.relationship}
                        </p>

                        <a
                          href={`tel:${contact.contact_phone}`}
                        >
                          {contact.contact_phone}
                        </a>

                      </div>


                      <button
                        type="button"
                        className="contact-delete"
                        onClick={() =>
                          handleDelete(contact.id)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          SAFETY NOTICE
      ====================================== */}

      <section className="family-safety">

        <div className="family-container">

          <div className="family-safety-card">

            <span>
              🛡️
            </span>

            <div>

              <h3>
                Emergency information
              </h3>

              <p>
                Emergency contacts stored in LifeGuard AI are provided
                for informational and safety support. If there is an
                immediate emergency, contact local emergency services
                directly.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Family;