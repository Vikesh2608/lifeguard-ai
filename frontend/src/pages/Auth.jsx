import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://lifeguard-ai-ij32.onrender.com";

function Auth() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // SWITCH LOGIN / REGISTER
  // ==========================================

  function switchMode(newMode) {
    setMode(newMode);
    setMessage("");

    // Clear password when switching modes
    setPassword("");
  }

  // ==========================================
  // LOGIN
  // ==========================================

  async function handleLogin() {
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok) {
        setMessage(
          data.detail || data.message || "Unable to sign in."
        );
        return;
      }

      if (data.message !== "Login successful") {
        setMessage(data.message || "Login failed.");
        return;
      }

      // ========================================
      // SAVE LOGGED-IN USER
      // ========================================

 // ========================================
// SAVE LOGGED-IN USER
// ========================================

const loggedInUser = {
  email: loginData.email,
  first_name: loginData.first_name || firstName.trim(),
  last_name: loginData.last_name || lastName.trim(),
};

localStorage.setItem(
  "lifeguardUser",
  JSON.stringify(loggedInUser)
);

localStorage.setItem("isLoggedIn", "true");

// ========================================
// GO TO DASHBOARD
// ========================================

navigate("/dashboard");

      // ========================================
      // GO TO DASHBOARD
      // ========================================

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to LifeGuard AI. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // REGISTER
  // ==========================================

  async function handleRegister() {
    setMessage("");

    if (!firstName.trim()) {
      setMessage("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      setMessage("Please enter your last name.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setMessage("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // CREATE ACCOUNT
      // ========================================

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      console.log("Register response:", data);

      if (!response.ok) {
        setMessage(
          data.detail ||
            data.message ||
            "Unable to create account."
        );
        return;
      }

      if (data.message !== "User registered successfully") {
        setMessage(
          data.message || "Unable to create account."
        );
        return;
      }

      // ========================================
      // LOGIN AUTOMATICALLY AFTER REGISTER
      // ========================================

      const loginResponse = await fetch(`${API_URL}/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const loginData = await loginResponse.json();

      console.log(
        "Automatic login response:",
        loginData
      );

      if (
        !loginResponse.ok ||
        loginData.message !== "Login successful"
      ) {
        setMessage(
          "Account created successfully. Please sign in."
        );

        setMode("login");
        setPassword("");

        return;
      }

      // ========================================
      // SAVE USER
      // ========================================

      localStorage.setItem(
        "email",
        loginData.email
      );

      localStorage.setItem(
        "first_name",
        loginData.first_name || firstName.trim()
      );

      localStorage.setItem(
        "last_name",
        loginData.last_name || lastName.trim()
      );

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // ========================================
      // GO TO DASHBOARD
      // ========================================

      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // FORM SUBMIT
  // ==========================================

  function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (mode === "login") {
      handleLogin();
    } else {
      handleRegister();
    }
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-logo">
          🛡️
        </div>

        <h1>
          Welcome to LifeGuard AI
        </h1>

        <p className="auth-subtitle">
          Your wellness, safety and emergency assistance
          platform.
        </p>

        {/* =====================================
            TABS
        ====================================== */}

        <div className="auth-tabs">

          <button
            type="button"
            className={
              mode === "login"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => switchMode("register")}
          >
            Create Account
          </button>

        </div>

        {/* =====================================
            FORM
        ====================================== */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* REGISTRATION NAME FIELDS */}

          {mode === "register" && (
            <>

              <label
                className="auth-label"
                htmlFor="first-name"
              >
                First name
              </label>

              <input
                id="first-name"
                type="text"
                placeholder="First name"
                className="auth-input"
                value={firstName}
                autoComplete="given-name"
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setMessage("");
                }}
              />

              <label
                className="auth-label"
                htmlFor="last-name"
              >
                Last name
              </label>

              <input
                id="last-name"
                type="text"
                placeholder="Last name"
                className="auth-input"
                value={lastName}
                autoComplete="family-name"
                onChange={(event) => {
                  setLastName(event.target.value);
                  setMessage("");
                }}
              />

            </>
          )}

          {/* EMAIL */}

          <label
            className="auth-label"
            htmlFor="auth-email"
          >
            Email address
          </label>

          <input
            id="auth-email"
            type="email"
            placeholder="Email address"
            className="auth-input"
            value={email}
            autoComplete="email"
            onChange={(event) => {
              setEmail(event.target.value);
              setMessage("");
            }}
          />

          {/* PASSWORD */}

          <label
            className="auth-label"
            htmlFor="auth-password"
          >
            Password
          </label>

          <input
            id="auth-password"
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            autoComplete={
              mode === "login"
                ? "current-password"
                : "new-password"
            }
            onChange={(event) => {
              setPassword(event.target.value);
              setMessage("");
            }}
          />

          {/* MESSAGE */}

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >

            {loading
              ? mode === "login"
                ? "Signing In..."
                : "Creating Account..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}

          </button>

        </form>

        {/* =====================================
            SWITCH MODE
        ====================================== */}

        <p className="auth-switch">

          {mode === "login"
            ? "New to LifeGuard AI? "
            : "Already have an account? "}

          <button
            type="button"
            onClick={() =>
              switchMode(
                mode === "login"
                  ? "register"
                  : "login"
              )
            }
          >

            {mode === "login"
              ? "Create account"
              : "Sign in"}

          </button>

        </p>

        {/* =====================================
            DISCLAIMER
        ====================================== */}

        <p className="auth-disclaimer">
          LifeGuard AI provides informational wellness and
          safety assistance and does not replace professional
          medical care or emergency services.
        </p>

      </div>

    </main>
  );
}

export default Auth;