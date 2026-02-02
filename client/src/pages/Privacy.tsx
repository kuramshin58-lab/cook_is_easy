import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function Privacy() {
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
            onClick={() => setLocation("/login")}
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
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: February 2, 2026</p>

          <section>
            <h2>Introduction</h2>
            <p>
              At Cook Is Easy ("we", "our", or "us"), we respect your privacy and are committed
              to protecting your personal data. This privacy policy explains how we collect, use,
              and safeguard your information when you use our recipe finder service.
            </p>
          </section>

          <section>
            <h2>Information We Collect</h2>

            <h3>Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul>
              <li>Email address</li>
              <li>Name (optional)</li>
              <li>Password (stored securely using bcrypt hashing)</li>
            </ul>

            <h3>Profile Preferences</h3>
            <p>To personalize your experience, you may provide:</p>
            <ul>
              <li>Base pantry ingredients (items you always have)</li>
              <li>Kitchen equipment</li>
              <li>Dietary preferences and restrictions</li>
            </ul>

            <h3>Usage Data</h3>
            <p>We automatically collect:</p>
            <ul>
              <li>Search queries (ingredients you enter)</li>
              <li>Recipe interactions</li>
              <li>Device type and browser information</li>
              <li>IP address</li>
            </ul>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve our recipe matching service</li>
              <li>Personalize recipe recommendations</li>
              <li>Remember your preferences across sessions</li>
              <li>Analyze usage patterns to improve our algorithms</li>
              <li>Send important service updates (if you opt in)</li>
            </ul>
          </section>

          <section>
            <h2>Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase, a trusted database provider with
              enterprise-grade security. We implement industry-standard security measures including:
            </p>
            <ul>
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>

          <section>
            <h2>Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Supabase:</strong> Database and authentication</li>
              <li><strong>OpenAI:</strong> AI-powered recipe generation (your ingredients may be sent to generate recipes)</li>
            </ul>
            <p>
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section>
            <h2>Data Sharing</h2>
            <p>
              <strong>We do not sell your personal information.</strong> We may share anonymized,
              aggregated data for analytics purposes, but this data cannot be used to identify you.
            </p>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p>
              To exercise these rights, contact us at privacy@cookiseasy.app
            </p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              We use essential cookies to maintain your session and remember your preferences.
              We do not use tracking cookies or share cookie data with advertisers.
            </p>
          </section>

          <section>
            <h2>Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect
              personal information from children under 13. If you believe we have collected
              such information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page and updating the
              "Last updated" date.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              If you have questions about this privacy policy or our data practices,
              please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@cookiseasy.app
            </p>
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
          margin-bottom: 0.5rem;
          color: var(--color-charcoal);
        }

        .last-updated {
          font-size: 0.95rem;
          color: var(--color-warm-gray);
          margin-bottom: 3rem;
        }

        h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 3rem;
          margin-bottom: 1rem;
          color: var(--color-charcoal);
        }

        h3 {
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--color-charcoal);
        }

        p {
          font-size: 1rem;
          line-height: 1.8;
          color: var(--color-warm-gray);
          margin-bottom: 1rem;
        }

        ul {
          margin: 0.5rem 0 1rem 1.5rem;
          color: var(--color-warm-gray);
        }

        li {
          font-size: 1rem;
          line-height: 1.8;
          margin-bottom: 0.5rem;
        }

        li strong {
          color: var(--color-charcoal);
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
        }
      `}</style>
    </div>
  );
}
