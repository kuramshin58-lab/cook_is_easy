import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="legal-page">
      <header className="legal-header">
        <nav className="nav">
          <motion.div
            className="logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => setLocation("/")}
            style={{ cursor: "pointer" }}
          >
            <span className="logo-icon">🍳</span>
            <span className="logo-text">Cook Is Easy</span>
          </motion.div>
          <motion.button
            className="nav-cta"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => setLocation("/app")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Cooking
          </motion.button>
        </nav>
      </header>

      <main className="legal-content">
        <motion.div
          className="content-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>About Cook Is Easy</h1>

          <section className="about-hero">
            <p className="lead">
              We believe that great home cooking shouldn't require a trip to the grocery store.
              Cook Is Easy helps you discover delicious recipes using ingredients you already have.
            </p>
          </section>

          <section>
            <h2>Our Mission</h2>
            <p>
              Every year, the average household throws away $1,500 worth of food. We're on a mission
              to change that. By helping people cook with what they have, we're reducing food waste,
              saving money, and making home cooking accessible to everyone.
            </p>
          </section>

          <section>
            <h2>How It Works</h2>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <div>
                  <h3>Smart Ingredient Matching</h3>
                  <p>
                    Our algorithm understands that not all ingredients are equal. Chicken matters
                    more than salt when finding your perfect recipe. We score recipes based on how
                    well they match your available ingredients.
                  </p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔄</span>
                <div>
                  <h3>Intelligent Substitutions</h3>
                  <p>
                    Missing cream? We'll suggest coconut milk. Out of basil? Try oregano.
                    With over 100 substitution mappings, we help you adapt recipes to what you have.
                  </p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <div>
                  <h3>AI-Powered Generation</h3>
                  <p>
                    When our database doesn't have a perfect match, our AI creates custom recipes
                    tailored to your exact ingredients, preferences, and cooking time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Our Values</h2>
            <ul className="values-list">
              <li>
                <strong>Reduce Waste:</strong> Every recipe cooked from existing ingredients is food
                saved from the trash.
              </li>
              <li>
                <strong>Simplicity First:</strong> Cooking should be enjoyable, not stressful.
                We make meal decisions effortless.
              </li>
              <li>
                <strong>Always Free:</strong> Our core features will always be free. Great cooking
                shouldn't have a price barrier.
              </li>
              <li>
                <strong>Privacy Matters:</strong> Your data is yours. We don't sell your information
                to advertisers.
              </li>
            </ul>
          </section>

          <section>
            <h2>The Numbers</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">189+</span>
                <span className="stat-label">Curated Recipes</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">2000+</span>
                <span className="stat-label">Ingredient Mappings</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">100+</span>
                <span className="stat-label">Substitution Rules</span>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <h2>Ready to Start Cooking?</h2>
            <p>Join thousands of home cooks who've discovered the joy of cooking with what they have.</p>
            <motion.button
              className="cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation("/")}
            >
              🍳 Try Cook Is Easy Free
            </motion.button>
          </section>
        </motion.div>
      </main>

      <footer className="legal-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a onClick={() => setLocation("/about")}>About</a>
            <a onClick={() => setLocation("/privacy")}>Privacy</a>
            <a onClick={() => setLocation("/terms")}>Terms</a>
            <a onClick={() => setLocation("/contact")}>Contact</a>
          </div>
          <p className="footer-copyright">© 2024 Cook Is Easy. Made with 🧡 for home cooks everywhere.</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap');

        .legal-page {
          --color-cream: #FDF8F3;
          --color-terracotta: #C84B31;
          --color-terracotta-dark: #A63D28;
          --color-sage: #7D9D6D;
          --color-sage-light: #E8F0E4;
          --color-charcoal: #2D3436;
          --color-warm-gray: #636E72;
          --font-display: 'Fraunces', Georgia, serif;
          --font-body: 'DM Sans', -apple-system, sans-serif;

          min-height: 100vh;
          background: var(--color-cream);
          color: var(--color-charcoal);
          font-family: var(--font-body);
          display: flex;
          flex-direction: column;
        }

        .legal-header {
          background: var(--color-cream);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 4rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon { font-size: 2rem; }

        .logo-text {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-charcoal);
        }

        .nav-cta {
          background: var(--color-terracotta);
          color: white;
          border: none;
          padding: 0.875rem 1.75rem;
          border-radius: 100px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .nav-cta:hover { background: var(--color-terracotta-dark); }

        .legal-content {
          flex: 1;
          padding: 4rem 2rem;
        }

        .content-wrapper {
          max-width: 800px;
          margin: 0 auto;
        }

        h1 {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: var(--color-charcoal);
        }

        .lead {
          font-size: 1.35rem;
          line-height: 1.7;
          color: var(--color-warm-gray);
          margin-bottom: 3rem;
        }

        h2 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 600;
          margin-top: 3rem;
          margin-bottom: 1rem;
          color: var(--color-charcoal);
        }

        h3 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--color-warm-gray);
          margin-bottom: 1rem;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 1.5rem;
        }

        .feature-item {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .feature-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .values-list {
          list-style: none;
          padding: 0;
        }

        .values-list li {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--color-warm-gray);
          margin-bottom: 1rem;
          padding-left: 1.5rem;
          position: relative;
        }

        .values-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--color-sage);
          font-weight: bold;
        }

        .values-list li strong {
          color: var(--color-charcoal);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .stat-number {
          display: block;
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-terracotta);
        }

        .stat-label {
          font-size: 0.95rem;
          color: var(--color-warm-gray);
        }

        .cta-section {
          text-align: center;
          margin-top: 4rem;
          padding: 3rem;
          background: white;
          border-radius: 24px;
        }

        .cta-section h2 {
          margin-top: 0;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--color-terracotta);
          color: white;
          border: none;
          padding: 1.25rem 2.5rem;
          border-radius: 100px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 1rem;
        }

        .legal-footer {
          background: var(--color-charcoal);
          padding: 2rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .footer-links a {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .footer-links a:hover { color: white; }

        .footer-copyright {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
        }

        @media (max-width: 768px) {
          .nav { padding: 1.25rem 1.5rem; }
          h1 { font-size: 2rem; }
          .lead { font-size: 1.1rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .feature-item { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </div>
  );
}
