import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Wellness from "./pages/Wellness";
import Family from "./pages/Family";
import AIAssistant from "./pages/AIAssistant";
import SOS from "./pages/SOS";
import Hospitals from "./pages/Hospitals";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/family" element={<Family />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;