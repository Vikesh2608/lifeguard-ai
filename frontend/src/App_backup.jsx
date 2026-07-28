import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [loggedUser, setLoggedUser] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const registerUser = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setLoggedUser(user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      setMessage("Registration Failed");
    }
  };

  const callSOS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/sos",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                email: loggedUser.email,
              }),
            }
          );

          const data = await response.json();

          alert(
            "SOS ACTIVATED\n\n" +
              "Nearest Hospital: " +
              data.nearest_hospital +
              "\n\nLatitude: " +
              data.location.latitude +
              "\nLongitude: " +
              data.location.longitude
          );
        } catch (error) {
          alert("SOS Service Failed");
        }
      },
      () => {
        alert("Location permission denied");
      }
    );
  };

  const mentalHealth = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/mental-health"
      );

      const data = await response.json();

      alert(data.message);
    } catch {
      alert("Mental Health Service Unavailable");
    }
  };

  const elderSafety = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/elder-safety"
      );

      const data = await response.json();

      alert(data.message);
    } catch {
      alert("Elder Safety Service Unavailable");
    }
  };

  const familySafety = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/family-safety"
      );

      const data = await response.json();

      alert(data.message);
    } catch {
      alert("Family Safety Service Unavailable");
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setLoggedUser(null);

    setUser({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    });

    setMessage("");
  };

  const moduleButtonStyle = {
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
  };

  if (isLoggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#eef2f7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            width: "550px",
            borderRadius: "20px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            textAlign: "center",
          }}
        >
          <h1>🛡️ LifeGuard AI</h1>

          <h2>Dashboard</h2>

          <h3>
            Welcome {loggedUser?.first_name}{" "}
            {loggedUser?.last_name}
          </h3>

          <p>{loggedUser?.email}</p>

          <hr />

          <h2>Available Modules</h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <button
              style={moduleButtonStyle}
              onClick={callSOS}
            >
              🚨 Emergency SOS
            </button>

            <button
              style={moduleButtonStyle}
              onClick={mentalHealth}
            >
              🧠 Mental Health Check
            </button>

            <button
              style={moduleButtonStyle}
              onClick={elderSafety}
            >
              👴 Elder Safety Monitoring
            </button>

            <button
              style={moduleButtonStyle}
              onClick={familySafety}
            >
              👨‍👩‍👧 Family Safety Center
            </button>
          </div>

          <button
            onClick={logout}
            style={{
              marginTop: "25px",
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#eef2f7",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          width: "450px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>
          🛡️ LifeGuard AI
        </h1>

        <h2 style={{ textAlign: "center" }}>
          User Registration
        </h2>

        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          style={inputStyle}
        />

        <button
          onClick={registerUser}
          style={registerButton}
        >
          Register
        </button>

        <p style={messageStyle}>
          {message}
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const registerButton = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const messageStyle = {
  textAlign: "center",
  marginTop: "15px",
  color: "green",
  fontWeight: "bold",
};

export default App;