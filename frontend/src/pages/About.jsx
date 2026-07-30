function About() {
  return (
    <main className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-container">
          <p className="about-label">ABOUT LIFEGUARD AI</p>

          <h1>
            Wellness. Safety. Preparedness.
            Intelligent Assistance.
          </h1>

          <p className="about-intro">
            LifeGuard AI is an open-source platform designed
            to bring personal wellness, family safety,
            emergency preparedness, and AI-powered assistance
            together in one accessible experience.
          </p>
        </div>
      </section>

      {/* PURPOSE */}
      <section className="about-section">
        <div className="about-container">

          <h2>What is LifeGuard AI?</h2>

          <p>
            LifeGuard AI helps users access practical tools
            and information for everyday wellness and
            unexpected situations — from tracking mood and
            sleep to finding nearby care resources,
            organizing emergency contacts, and receiving
            AI-powered guidance.
          </p>

          <p>
            The vision is to make intelligent technology more
            useful where it matters most: helping people stay
            informed, prepared, and connected.
          </p>

          <h2>What LifeGuard AI Offers</h2>

          <div className="about-grid">

            <div className="about-card">
              <h3>😊 Daily Wellness</h3>
              <p>
                Track mood, sleep, and everyday wellness
                information.
              </p>
            </div>

            <div className="about-card">
              <h3>🤖 AI Assistant</h3>
              <p>
                Conversational guidance for wellness, sleep,
                stress, personal safety, family preparedness,
                and emergency preparedness.
              </p>
            </div>

            <div className="about-card">
              <h3>🚨 SOS Support</h3>
              <p>
                Quick access to emergency-oriented features
                and safety resources.
              </p>
            </div>

            <div className="about-card">
              <h3>🏥 Nearby Care</h3>
              <p>
                Location-aware discovery of nearby hospitals
                and care resources.
              </p>
            </div>

            <div className="about-card">
              <h3>👨‍👩‍👧 Family Safety</h3>
              <p>
                Organize emergency contacts and support
                family preparedness.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="about-section">
        <div className="about-container">

          <h2>Mission</h2>

          <p>
            The mission of LifeGuard AI is to use accessible
            technology to help people become more informed,
            prepared, and connected in everyday life and
            during unexpected situations.
          </p>

          <p>
            LifeGuard AI is being developed as an open-source
            platform that can evolve through continued
            development, research, real-world feedback, and
            community collaboration.
          </p>

        </div>
      </section>

      {/* FOUNDER */}
      <section className="about-section">
        <div className="about-container">

          <h2>Founder & Developer</h2>

          <h3>Vikesh Bairam</h3>

          <p>
            Founder & Developer, LifeGuard AI
          </p>

          <p>
            LifeGuard AI was founded and developed by Vikesh
            Bairam as an independent open-source technology
            project exploring how artificial intelligence,
            location-aware services, and modern software can
            support personal wellness, safety, family
            preparedness, and access to useful resources.
          </p>

        </div>
      </section>

      {/* OPEN SOURCE */}
      <section className="about-section">
        <div className="about-container">

          <h2>Open Source</h2>

          <p>
            LifeGuard AI is built with an open-source-first
            approach. The goal is to create a transparent and
            evolving platform where technology can be
            developed and improved around practical human
            needs.
          </p>

          <p>
            As the project grows, new capabilities,
            integrations, and community contributions can
            expand what LifeGuard AI provides.
          </p>

        </div>
      </section>

      {/* SAFETY */}
      <section className="about-section">
        <div className="about-container">

          <div className="about-safety">
            <h2>🛡️ Important Safety Notice</h2>

            <p>
              LifeGuard AI provides informational wellness,
              safety, and preparedness assistance. It does
              not provide medical diagnosis or treatment and
              is not a substitute for qualified healthcare
              professionals, emergency responders, or
              emergency services.
            </p>

            <p>
              If there is an immediate emergency, contact
              the appropriate local emergency services.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}

export default About;