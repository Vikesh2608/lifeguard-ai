import { Link } from "react-router-dom";

function Home() {
  const features = [
    {
      icon: "😊",
      title: "Wellness",
      description:
        "Track your daily wellness, mood, sleep, hydration and healthy habits.",
      link: "/wellness",
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description:
        "Get AI-powered guidance for wellness, safety, productivity and everyday questions.",
      link: "/ai",
    },
    {
      icon: "🚨",
      title: "SOS",
      description:
        "Quickly access emergency assistance tools and important safety information.",
      link: "/sos",
    },
    {
      icon: "🏥",
      title: "Hospitals",
      description:
        "Find nearby hospitals and emergency medical resources using your location.",
      link: "/hospitals",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Family Safety",
      description:
        "Manage family safety information and important emergency contacts.",
      link: "/family",
    },
  ];

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="home-hero">
        <div className="hero-badge">🛡️ LifeGuard AI</div>

        <h1>
          Wellness, Safety & Emergency Assistance
          <span> Powered by Intelligent Technology</span>
        </h1>

        <p className="hero-description">
          One platform for personal wellness, family safety, AI assistance,
          emergency support and location-aware resources.
        </p>

        <div className="hero-actions">
          <Link to="/auth" className="primary-button">
            Get Started
          </Link>

          <Link to="/ai" className="secondary-button">
            🤖 Try AI Assistant
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features">

        <div className="section-heading">
          <p className="section-label">LIFEGUARD AI PLATFORM</p>

          <h2>Everything you need in one place</h2>

          <p>
            Explore tools designed to support wellness, safety and access to
            important resources.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <Link
              to={feature.link}
              className="feature-card"
              key={feature.title}
            >
              <div className="feature-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <span className="feature-link">
                Explore →
              </span>
            </Link>
          ))}
        </div>

      </section>

      {/* HOW IT HELPS */}
      <section className="home-benefits">

        <div className="benefits-content">

          <div className="benefits-text">
            <p className="section-label">HOW IT HELPS</p>

            <h2>Technology designed around everyday safety</h2>

            <p>
              LifeGuard AI brings wellness, AI assistance, family safety and
              emergency resources together in one accessible platform.
            </p>
          </div>

          <div className="benefit-list">

            <div className="benefit-item">
              <span>✓</span>
              <div>
                <h3>Wellness Tracking</h3>
                <p>
                  Keep track of daily wellness information and healthy habits.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <span>✓</span>
              <div>
                <h3>AI Assistance</h3>
                <p>
                  Ask questions and receive AI-powered informational guidance.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <span>✓</span>
              <div>
                <h3>Location-Aware Resources</h3>
                <p>
                  Discover nearby hospitals and emergency resources when
                  location access is available.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <span>✓</span>
              <div>
                <h3>Family Safety</h3>
                <p>
                  Organize important family safety and emergency information.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SAFETY NOTICE */}
      <section className="home-safety">
        <div className="safety-card">

          <div className="safety-icon">🛡️</div>

          <div>
            <h2>Safety First</h2>

            <p>
              LifeGuard AI provides informational wellness and safety
              assistance. It does not replace professional medical care,
              emergency responders or emergency services.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Home;