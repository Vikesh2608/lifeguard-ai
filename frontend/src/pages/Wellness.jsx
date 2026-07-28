import { useEffect, useState } from "react";

const API_URL = "https://lifeguard-ai-ij32.onrender.com";

function Wellness() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");

  const [wellnessScore, setWellnessScore] = useState(50);

  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [moodMessage, setMoodMessage] = useState("");
  const [loadingMood, setLoadingMood] = useState(false);

  const [sleepHours, setSleepHours] = useState("");
  const [sleepMessage, setSleepMessage] = useState("");
  const [loadingSleep, setLoadingSleep] = useState(false);

  // ==========================================
  // LOAD USER FROM LOGIN
  // ==========================================

  useEffect(() => {
    const storedEmail = localStorage.getItem("email") || "";
    const storedFirstName = localStorage.getItem("first_name") || "";

    setEmail(storedEmail);
    setFirstName(storedFirstName);

    if (storedEmail) {
      loadWellnessScore(storedEmail);
    }
  }, []);

  // ==========================================
  // LOAD WELLNESS SCORE
  // ==========================================

  async function loadWellnessScore(userEmail) {
    if (!userEmail) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/wellness-score/${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load wellness score");
      }

      const data = await response.json();

      if (typeof data.wellness_score === "number") {
        setWellnessScore(data.wellness_score);
      }
    } catch (error) {
      console.error("Wellness score error:", error);
    }
  }

  // ==========================================
  // SAVE MOOD
  // ==========================================

  async function saveMood() {
    setMoodMessage("");

    if (!email) {
      setMoodMessage("Please sign in before recording your mood.");
      return;
    }

    if (!mood) {
      setMoodMessage("Please select how you are feeling.");
      return;
    }

    try {
      setLoadingMood(true);

      const response = await fetch(`${API_URL}/mood`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email,
          mood: mood,
          notes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save mood");
      }

      const data = await response.json();

      console.log("Mood response:", data);

      setMoodMessage(`✓ Mood saved: ${mood}`);

      setMood("");
      setNotes("");

      await loadWellnessScore(email);
    } catch (error) {
      console.error("Mood save error:", error);

      setMoodMessage(
        "Unable to save your mood. Please try again."
      );
    } finally {
      setLoadingMood(false);
    }
  }

  // ==========================================
  // SAVE SLEEP
  // ==========================================

  async function saveSleep() {
    setSleepMessage("");

    if (!email) {
      setSleepMessage("Please sign in before recording sleep.");
      return;
    }

    if (sleepHours === "") {
      setSleepMessage("Please enter how many hours you slept.");
      return;
    }

    const hours = Number(sleepHours);

    if (Number.isNaN(hours)) {
      setSleepMessage("Please enter a valid number.");
      return;
    }

    if (hours < 0 || hours > 24) {
      setSleepMessage(
        "Sleep hours must be between 0 and 24."
      );
      return;
    }

    try {
      setLoadingSleep(true);

      console.log("Sending sleep hours:", hours);

      const response = await fetch(`${API_URL}/sleep`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email,
          sleep_hours: hours,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save sleep");
      }

      const data = await response.json();

      console.log("Sleep response:", data);

      setSleepMessage(
        `✓ Sleep recorded: ${hours} ${
          hours === 1 ? "hour" : "hours"
        }`
      );

      // IMPORTANT:
      // Clear the previous value after saving.
      setSleepHours("");

      await loadWellnessScore(email);
    } catch (error) {
      console.error("Sleep save error:", error);

      setSleepMessage(
        "Unable to save sleep. Please try again."
      );
    } finally {
      setLoadingSleep(false);
    }
  }

  // ==========================================
  // MOOD OPTIONS
  // ==========================================

  const moodOptions = [
    {
      value: "Great",
      emoji: "😄",
    },
    {
      value: "Good",
      emoji: "😊",
    },
    {
      value: "Okay",
      emoji: "😐",
    },
    {
      value: "Low",
      emoji: "😔",
    },
  ];

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="wellness-page">

      {/* =====================================
          HERO
      ====================================== */}

      <section className="wellness-hero">

        <div className="wellness-container">

          <p className="wellness-eyebrow">
            LIFEGUARD AI WELLNESS
          </p>

          <h1>
            Your daily wellness check-in
          </h1>

          <p className="wellness-hero-text">
            Record how you're feeling and track your sleep
            to build a simple picture of your daily wellness.
          </p>

          {firstName && (
            <p className="wellness-user">
              Welcome, {firstName}
            </p>
          )}

        </div>

      </section>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <section className="wellness-content">

        <div className="wellness-container">

          {/* =====================================
              WELLNESS SCORE
          ====================================== */}

          <div className="wellness-score-card">

            <div>

              <p className="wellness-card-label">
                WELLNESS SCORE
              </p>

              <div className="wellness-score-number">

                {wellnessScore}

                <span>
                  /100
                </span>

              </div>

            </div>

            <div className="wellness-score-description">

              <h3>
                Your current wellness overview
              </h3>

              <p>
                Your score updates as you record wellness
                information in LifeGuard AI.
              </p>

              {email && (
                <p className="wellness-email">
                  Signed in as {email}
                </p>
              )}

            </div>

          </div>

          {/* =====================================
              TRACKERS GRID
          ====================================== */}

          <div className="wellness-grid">

            {/* =====================================
                MOOD
            ====================================== */}

            <div className="wellness-card">

              <div className="wellness-icon">
                😊
              </div>

              <p className="wellness-card-label">
                DAILY CHECK-IN
              </p>

              <h2>
                How are you feeling?
              </h2>

              <p className="wellness-card-description">
                Select the option that best describes
                how you're feeling today.
              </p>

              <div className="mood-options">

                {moodOptions.map((option) => (

                  <button
                    key={option.value}
                    type="button"
                    className={
                      mood === option.value
                        ? "mood-option selected"
                        : "mood-option"
                    }
                    onClick={() => {
                      setMood(option.value);
                      setMoodMessage("");
                    }}
                  >

                    <span className="mood-emoji">
                      {option.emoji}
                    </span>

                    <span>
                      {option.value}
                    </span>

                  </button>

                ))}

              </div>

              <label
                className="wellness-label"
                htmlFor="wellness-notes"
              >
                Notes
              </label>

              <textarea
                id="wellness-notes"
                className="wellness-textarea"
                placeholder="Anything you'd like to record about today?"
                value={notes}
                maxLength={500}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
              />

              <button
                type="button"
                className="wellness-submit"
                onClick={saveMood}
                disabled={loadingMood}
              >

                {loadingMood
                  ? "Saving..."
                  : "Save Check-In"}

              </button>

              {moodMessage && (

                <p
                  className={
                    moodMessage.startsWith("✓")
                      ? "wellness-success"
                      : "wellness-error"
                  }
                >
                  {moodMessage}
                </p>

              )}

            </div>

            {/* =====================================
                SLEEP
            ====================================== */}

            <div className="wellness-card">

              <div className="wellness-icon">
                🌙
              </div>

              <p className="wellness-card-label">
                SLEEP TRACKING
              </p>

              <h2>
                How long did you sleep?
              </h2>

              <p className="wellness-card-description">
                Record your sleep from your most recent
                sleep period.
              </p>

              <label
                className="wellness-label"
                htmlFor="sleep-hours"
              >
                Hours slept
              </label>

              <div className="sleep-input-row">

                <input
                  id="sleep-hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  className="wellness-input"
                  placeholder="Example: 7.5"
                  value={sleepHours}
                  onChange={(event) => {
                    setSleepHours(event.target.value);
                    setSleepMessage("");
                  }}
                />

                <span>
                  hours
                </span>

              </div>

              <div className="wellness-info-box">

                <span>
                  💡
                </span>

                <p>
                  Sleep needs vary by person. This tracker
                  records your information and is not
                  medical advice.
                </p>

              </div>

              <button
                type="button"
                className="wellness-submit"
                onClick={saveSleep}
                disabled={loadingSleep}
              >

                {loadingSleep
                  ? "Saving..."
                  : "Save Sleep"}

              </button>

              {sleepMessage && (

                <p
                  className={
                    sleepMessage.startsWith("✓")
                      ? "wellness-success"
                      : "wellness-error"
                  }
                >
                  {sleepMessage}
                </p>

              )}

            </div>

          </div>

          {/* =====================================
              SAFETY MESSAGE
          ====================================== */}

          <div className="wellness-safety">

            <span className="wellness-safety-icon">
              🛡️
            </span>

            <div>

              <h3>
                Wellness tracking
              </h3>

              <p>
                LifeGuard AI wellness tracking is designed
                for personal informational use. It does not
                diagnose conditions or replace professional
                medical care.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Wellness;