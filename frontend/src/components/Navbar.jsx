import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check whether a user is already signed in
  useEffect(() => {
    const isLoggedIn =
      localStorage.getItem("isLoggedIn") === "true";

    const savedUser =
      localStorage.getItem("lifeguardUser");

    if (isLoggedIn && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Unable to read user:", error);

        localStorage.removeItem("lifeguardUser");
        localStorage.removeItem("isLoggedIn");
      }
    }
  }, []);

  // Sign out
  function handleLogout() {
    localStorage.removeItem("lifeguardUser");
    localStorage.removeItem("isLoggedIn");

    setUser(null);
    navigate("/");
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">
        🛡️ LifeGuard AI
      </NavLink>

      <nav className="navbar-links">
        <NavLink to="/">🏠 Home</NavLink>

        {user && (
          <>
            <NavLink to="/dashboard">
              📊 Dashboard
            </NavLink>

            <NavLink to="/wellness">
              😊 Wellness
            </NavLink>

            <NavLink to="/family">
              👨‍👩‍👧 Family
            </NavLink>
          </>
        )}

        <NavLink to="/ai">
          🤖 AI Assistant
        </NavLink>

        <NavLink to="/sos">
          🚨 SOS
        </NavLink>

        <NavLink to="/hospitals">
          🏥 Hospitals
        </NavLink>

        <NavLink to="/about">
          ℹ️ About
        </NavLink>

        {user ? (
          <>
            <span className="navbar-user">
              👤 {user.first_name || "User"}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </>
        ) : (
          <NavLink
            to="/auth"
            className="signin-link"
          >
            🔐 Sign In
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default Navbar;