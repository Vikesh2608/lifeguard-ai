import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">
        🛡️ LifeGuard AI
      </NavLink>

      <nav className="navbar-links">
        <NavLink to="/">🏠 Home</NavLink>
        <NavLink to="/dashboard">📊 Dashboard</NavLink>
        <NavLink to="/wellness">😊 Wellness</NavLink>
        <NavLink to="/family">👨‍👩‍👧 Family</NavLink>
        <NavLink to="/ai">🤖 AI Assistant</NavLink>
        <NavLink to="/sos">🚨 SOS</NavLink>
        <NavLink to="/hospitals">🏥 Hospitals</NavLink>
        <NavLink to="/auth" className="signin-link">
          🔐 Sign In
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;