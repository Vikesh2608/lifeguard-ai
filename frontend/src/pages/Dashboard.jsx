import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8001";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [dashboard, setDashboard] = useState({
    wellness_score: null,
    latest_mood: null,
    latest_sleep: null,
    emergency_contacts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("lifeguardUser");

    if (!savedUser) {
      navigate("/auth");
      return;
    }

    let parsedUser;

    try {
      parsedUser = JSON.parse(savedUser);

      if (!parsedUser?.email) {
        throw new Error("Invalid user");
      }

      setUser(parsedUser);
    } catch (error) {
      console.error(error);

      localStorage.removeItem("lifeguardUser");
      navigate("/auth");

      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/dashboard/${encodeURIComponent(
            parsedUser.email
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Dashboard request failed: ${response.status}`
          );
        }

        const data = await response.json();

        setDashboard({
          wellness_score: data.wellness_score ?? null,
          latest_mood: data.latest_mood ?? null,
          latest_sleep: data.latest_sleep ?? null,
          emergency_contacts: data.emergency_contacts ?? 0,
        });
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          "Some dashboard information could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  if (!user) {
    return null;
  }

  const firstName =
    user.firstName ||
    user.first_name ||
    "there";

  const getMoodEmoji = (mood) => {
    if (!mood) return "😊";

    switch (mood.toLowerCase()) {
      case "great":
        return "😍";

      case "good":
        return "😊";

      case "okay":
        return "😐";

      case "low":
        return "😔";

      default:
        return "😊";
    }
  };

  const getScoreMessage = () => {
    const score = dashboard.wellness_score;

    if (score === null) {
      return "Start recording your wellness information.";
    }

    if (score >= 80) {
      return "Your recent wellness entries are looking strong.";
    }

    if (score >= 60) {
      return "Your recent wellness entries look balanced.";
    }

    if (score >= 40) {
      return "Keep checking in and tracking your wellness.";
    }

    return "Your recent entries lowered your wellness score.";
  };

  return (
    <main className="dashboard-page">

      {/* HERO */}

      <section className="dashboard-hero">
        <div className="dashboard-container">

          <p className="dashboard-label">
            LIFEGUARD AI DASHBOARD
          </p>

          <h1>
            Welcome, {firstName} 👋
          </h1>

          <p className="dashboard-intro">
            Your wellness, safety, family resources and
            emergency tools in one place.
          </p>

        </div>
      </section>

      {/* OVERVIEW */}

      <section className="dashboard-section">
        <div className="dashboard-container">

          <div className="dashboard-heading">

            <div>
              <p className="dashboard-label">
                TODAY
              </p>

              <h2>Your overview</h2>
            </div>

            <p className="dashboard-email">
              {user.email}
            </p>

          </div>

          {error && (
            <p className="dashboard-error">
              {error}
            </p>
          )}

          <div className="dashboard-grid">

            {/* WELLNESS */}

            <div className="dashboard-card score-card">

              <div className="dashboard-icon">
                💙
              </div>

              <p className="dashboard-card-label">
                WELLNESS SCORE
              </p>

              {loading ? (
                <h3>Loading...</h3>
              ) : (
                <h3 className="score-number">
                  {dashboard.wellness_score ?? "--"}

                  <span>/100</span>
                </h3>
              )}

              <p>
                {loading
                  ? "Loading your wellness information..."
                  : getScoreMessage()}
              </p>

              <Link
                to="/wellness"
                className="dashboard-link"
              >
                Update wellness →
              </Link>

            </div>

            {/* MOOD */}

            <div className="dashboard-card">

              <div className="dashboard-icon">
                {getMoodEmoji(
                  dashboard.latest_mood
                )}
              </div>

              <p className="dashboard-card-label">
                MOOD
              </p>

              <h3>
                {loading
                  ? "Loading..."
                  : dashboard.latest_mood ||
                    "No check-in yet"}
              </h3>

              <p>
                {dashboard.latest_mood
                  ? "Your latest recorded mood."
                  : "Record how you're feeling today."}
              </p>

              <Link
                to="/wellness"
                className="dashboard-link"
              >
                Log mood →
              </Link>

            </div>

            {/* SLEEP */}

            <div className="dashboard-card">

              <div className="dashboard-icon">
                🌙
              </div>

              <p className="dashboard-card-label">
                SLEEP
              </p>

              <h3>
                {loading
                  ? "Loading..."
                  : dashboard.latest_sleep !== null
                  ? `${dashboard.latest_sleep} hours`
                  : "No sleep recorded"}
              </h3>

              <p>
                {dashboard.latest_sleep !== null
                  ? "Your most recent sleep entry."
                  : "Record your latest sleep period."}
              </p>

              <Link
                to="/wellness"
                className="dashboard-link"
              >
                Log sleep →
              </Link>

            </div>

            {/* FAMILY */}

            <div className="dashboard-card">

              <div className="dashboard-icon">
                👨‍👩‍👧
              </div>

              <p className="dashboard-card-label">
                FAMILY SAFETY
              </p>

              <h3>
                {loading
                  ? "Loading..."
                  : `${dashboard.emergency_contacts} ${
                      dashboard.emergency_contacts === 1
                        ? "contact"
                        : "contacts"
                    }`}
              </h3>

              <p>
                Emergency contacts saved to your
                LifeGuard AI account.
              </p>

              <Link
                to="/family"
                className="dashboard-link"
              >
                Manage contacts →
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}

      <section className="dashboard-actions-section">

        <div className="dashboard-container">

          <p className="dashboard-label">
            QUICK ACCESS
          </p>

          <h2>
            What would you like to do?
          </h2>

          <div className="dashboard-actions">

            <Link
              to="/wellness"
              className="action-card"
            >
              <span>😊</span>

              <div>
                <strong>
                  Wellness Check-In
                </strong>

                <p>
                  Record mood and sleep.
                </p>
              </div>
            </Link>

            <Link
              to="/family"
              className="action-card"
            >
              <span>👨‍👩‍👧</span>

              <div>
                <strong>
                  Family Safety
                </strong>

                <p>
                  Manage emergency contacts.
                </p>
              </div>
            </Link>

            <Link
              to="/ai"
              className="action-card"
            >
              <span>🤖</span>

              <div>
                <strong>
                  AI Assistant
                </strong>

                <p>
                  Get informational guidance.
                </p>
              </div>
            </Link>

            <Link
              to="/hospitals"
              className="action-card"
            >
              <span>🏥</span>

              <div>
                <strong>
                  Nearby Hospitals
                </strong>

                <p>
                  Find nearby medical resources.
                </p>
              </div>
            </Link>

            <Link
              to="/sos"
              className="action-card emergency-action"
            >
              <span>🚨</span>

              <div>
                <strong>
                  Emergency SOS
                </strong>

                <p>
                  Access emergency assistance tools.
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* SAFETY */}

      <section className="dashboard-safety">

        <div className="dashboard-container">

          <div className="dashboard-safety-card">

            <span>🛡️</span>

            <div>

              <h3>
                Safety First
              </h3>

              <p>
                If you are experiencing an immediate
                emergency, contact local emergency
                services. LifeGuard AI is an
                informational support platform and is
                not a substitute for emergency
                responders or professional medical
                care.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;