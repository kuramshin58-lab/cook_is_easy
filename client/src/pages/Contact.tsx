import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function Contact() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a backend
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
  };

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
          <h1>Contact Us</h1>
          <p className="lead">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you!
          </p>

          <div className="contact-grid">
            <div className="contact-info">
              <div className="info-card">
                <span className="info-icon">📧</span>
                <h3>Email</h3>
                <p>For general inquiries:</p>
                <a href="mailto:hello@cookiseasy.app">hello@cookiseasy.app</a>
              </div>

              <div className="info-card">
                <span className="info-icon">🐛</span>
                <h3>Bug Reports</h3>
                <p>Found a bug? Let us know:</p>
                <a href="mailto:bugs@cookiseasy.app">bugs@cookiseasy.app</a>
              </div>

              <div className="info-card">
                <span className="info-icon">💡</span>
                <h3>Feature Requests</h3>
                <p>Have an idea for Cook Is Easy?</p>
                <a href="mailto:ideas@cookiseasy.app">ideas@cookiseasy.app</a>
              </div>

              <div className="info-card">
                <span className="info-icon">🤝</span>
                <h3>Partnerships</h3>
                <p>Business inquiries:</p>
                <a href="mailto:partners@cookiseasy.app">partners@cookiseasy.app</a>
              </div>
            </div>

            <div className="contact-form-section">
              {submitted ? (
                <motion.div
                  className="success-message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="success-icon">✅</span>
                  <h2>Message Sent!</h2>
                  <p>Thanks for reaching out. We'll get back to you within 24-48 hours.</p>
                  <button
                    className="reset-button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "general", message: "" });
                    }}
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <h2>Send us a message</h2>

                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="general">General Question</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what's on your mind..."
                      rows={5}
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="submit-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message
                  </motion.button>
                </form>
              )}
            </div>
          </div>

          <section className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>How fast do you respond?</h3>
                <p>We aim to respond to all inquiries within 24-48 hours during business days.</p>
              </div>
              <div className="faq-item">
                <h3>Can I request a new feature?</h3>
                <p>Absolutely! We love hearing from our users. Send your ideas to ideas@cookiseasy.app.</p>
              </div>
              <div className="faq-item">
                <h3>I found a bug, what should I do?</h3>
                <p>Please email bugs@cookiseasy.app with details about what happened and steps to reproduce.</p>
              </div>
              <div className="faq-item">
                <h3>Are you on social media?</h3>
                <p>We're working on it! Follow us soon on Instagram and Twitter @cookiseasy.</p>
              </div>
            </div>
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
          max-width: 1000px;
          margin: 0 auto;
        }

        h1 {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--color-charcoal);
        }

        .lead {
          font-size: 1.25rem;
          line-height: 1.7;
          color: var(--color-warm-gray);
          margin-bottom: 3rem;
        }

        h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: var(--color-charcoal);
        }

        h3 {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--color-charcoal);
        }

        p {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--color-warm-gray);
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .info-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.75rem;
        }

        .info-card a {
          color: var(--color-terracotta);
          text-decoration: none;
          font-weight: 500;
        }

        .info-card a:hover {
          text-decoration: underline;
        }

        .contact-form-section {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .contact-form h2 {
          margin-top: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--color-charcoal);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid #E8E8E8;
          border-radius: 12px;
          font-family: var(--font-body);
          font-size: 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-sage);
          box-shadow: 0 0 0 4px var(--color-sage-light);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: var(--color-terracotta);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
        }

        .submit-button:hover {
          background: var(--color-terracotta-dark);
        }

        .success-message {
          text-align: center;
          padding: 3rem 2rem;
        }

        .success-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .reset-button {
          margin-top: 1.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 2px solid var(--color-sage);
          color: var(--color-sage);
          border-radius: 100px;
          font-family: var(--font-body);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-button:hover {
          background: var(--color-sage-light);
        }

        .faq-section {
          margin-top: 4rem;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .faq-item {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
          .contact-grid { grid-template-columns: 1fr; }
          .faq-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
