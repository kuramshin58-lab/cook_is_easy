import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

// Demo recipes for the interactive showcase
const demoRecipes = [
  { name: "Creamy Garlic Pasta", time: "20 min", match: 95, ingredients: ["pasta", "garlic", "cream"] },
  { name: "Herb Roasted Chicken", time: "45 min", match: 88, ingredients: ["chicken", "herbs", "lemon"] },
  { name: "Mediterranean Salad", time: "15 min", match: 92, ingredients: ["tomatoes", "cucumber", "feta"] },
  { name: "Spicy Shrimp Stir-fry", time: "25 min", match: 85, ingredients: ["shrimp", "vegetables", "soy sauce"] },
];

const testimonials = [
  { name: "Sarah M.", text: "Finally stopped throwing away forgotten vegetables! This app changed how I cook.", avatar: "🧑‍🍳" },
  { name: "Michael R.", text: "I used to order takeout 5 nights a week. Now I actually enjoy cooking with what I have.", avatar: "👨‍💼" },
  { name: "Emma L.", text: "The ingredient substitution feature is genius. No more emergency grocery runs!", avatar: "👩‍🎨" },
];

const features = [
  {
    icon: "🎯",
    title: "Smart Matching",
    description: "Our algorithm weighs key ingredients differently - chicken matters more than salt in finding your perfect recipe."
  },
  {
    icon: "🔄",
    title: "Clever Substitutions",
    description: "Out of cream? We'll suggest coconut milk. Missing basil? Try oregano. Never let one ingredient stop you."
  },
  {
    icon: "📊",
    title: "Match Scores",
    description: "See exactly how well each recipe fits your available ingredients. 95% match? You're ready to cook!"
  },
  {
    icon: "🥗",
    title: "Reduce Waste",
    description: "Turn forgotten fridge items into delicious meals. Save money while eating better."
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const [typedIngredients, setTypedIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showRecipes, setShowRecipes] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddIngredient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const newIngredients = [...typedIngredients, inputValue.trim()];
      setTypedIngredients(newIngredients);
      setInputValue("");
      if (newIngredients.length >= 2) {
        setTimeout(() => setShowRecipes(true), 300);
      }
    }
  };

  const removeIngredient = (index: number) => {
    const newIngredients = typedIngredients.filter((_, i) => i !== index);
    setTypedIngredients(newIngredients);
    if (newIngredients.length < 2) {
      setShowRecipes(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Floating food elements for atmosphere */}
      <div className="floating-elements">
        <motion.span
          className="float-item"
          style={{ top: "15%", left: "5%" }}
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >🍅</motion.span>
        <motion.span
          className="float-item"
          style={{ top: "25%", right: "8%" }}
          animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >🥬</motion.span>
        <motion.span
          className="float-item"
          style={{ top: "60%", left: "3%" }}
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >🧄</motion.span>
        <motion.span
          className="float-item"
          style={{ top: "70%", right: "5%" }}
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >🍋</motion.span>
      </div>

      {/* Hero Section */}
      <header className="hero">
        <nav className="nav">
          <motion.div
            className="logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="logo-icon">🍳</span>
            <span className="logo-text">Cook Is Easy</span>
          </motion.div>
          <motion.button
            className="nav-cta"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => setLocation("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Cooking
          </motion.button>
        </nav>

        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1>
              <span className="hero-accent">What's in your fridge?</span>
              <br />
              <span className="hero-main">We'll find the recipe.</span>
            </h1>
            <p className="hero-subtitle">
              Stop wasting food. Start cooking amazing meals with ingredients you already have.
              Smart matching, clever substitutions, zero stress.
            </p>
          </motion.div>

          {/* Interactive Demo */}
          <motion.div
            className="demo-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="demo-card">
              <div className="demo-header">
                <span className="demo-icon">✨</span>
                <span>Try it now — type your ingredients</span>
              </div>

              <div className="demo-input-area">
                <div className="ingredient-tags">
                  <AnimatePresence>
                    {typedIngredients.map((ing, i) => (
                      <motion.span
                        key={ing + i}
                        className="ingredient-tag"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {ing}
                        <button onClick={() => removeIngredient(i)}>×</button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
                <input
                  type="text"
                  placeholder={typedIngredients.length === 0 ? "Type an ingredient (e.g., chicken, pasta, tomatoes)..." : "Add more ingredients..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleAddIngredient}
                  className="demo-input"
                />
                <span className="input-hint">Press Enter to add</span>
              </div>

              <AnimatePresence>
                {showRecipes && (
                  <motion.div
                    className="demo-results"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="results-header">
                      <span className="results-icon">🎉</span>
                      <span>Found {demoRecipes.length} recipes you can make!</span>
                    </div>
                    <div className="recipe-preview-list">
                      {demoRecipes.map((recipe, i) => (
                        <motion.div
                          key={recipe.name}
                          className="recipe-preview-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                        >
                          <div className="recipe-preview-info">
                            <span className="recipe-preview-name">{recipe.name}</span>
                            <span className="recipe-preview-time">⏱ {recipe.time}</span>
                          </div>
                          <div className="recipe-preview-match">
                            <div className="match-bar">
                              <motion.div
                                className="match-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${recipe.match}%` }}
                                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                              />
                            </div>
                            <span className="match-percent">{recipe.match}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <motion.button
                      className="demo-cta"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setLocation("/")}
                    >
                      See Full Recipes →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="hero-scroll-indicator">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>↓</span>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-eyebrow">How it works</span>
            <h2>Cooking made <em>effortless</em></h2>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="testimonials-section">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-eyebrow">Loved by home cooks</span>
            <h2>Real people, real kitchens</h2>
          </motion.div>

          <div className="testimonials-carousel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className="testimonial-card"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="testimonial-avatar">{testimonials[activeTestimonial].avatar}</div>
                <blockquote>"{testimonials[activeTestimonial].text}"</blockquote>
                <cite>— {testimonials[activeTestimonial].name}</cite>
              </motion.div>
            </AnimatePresence>

            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === activeTestimonial ? "active" : ""}`}
                  onClick={() => setActiveTestimonial(i)}
                />
              ))}
            </div>
          </div>

          <div className="stats-row">
            <motion.div
              className="stat"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="stat-number">189+</span>
              <span className="stat-label">Recipes</span>
            </motion.div>
            <motion.div
              className="stat"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="stat-number">2000+</span>
              <span className="stat-label">Ingredients</span>
            </motion.div>
            <motion.div
              className="stat"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="stat-number">Zero</span>
              <span className="stat-label">Food Waste</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to transform your kitchen?</h2>
            <p>Stop staring at your fridge wondering what to cook. Start creating delicious meals in minutes.</p>
            <motion.button
              className="cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation("/")}
            >
              <span>🍳</span> Start Cooking — It's Free
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🍳</span>
            <span className="logo-text">Cook Is Easy</span>
          </div>
          <p className="footer-tagline">Making home cooking simple, one ingredient at a time.</p>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
          <p className="footer-copyright">© 2024 Cook Is Easy. Made with 🧡 for home cooks everywhere.</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap');

        .landing-page {
          --color-cream: #FDF8F3;
          --color-terracotta: #C84B31;
          --color-terracotta-dark: #A63D28;
          --color-sage: #7D9D6D;
          --color-sage-light: #E8F0E4;
          --color-saffron: #E8A838;
          --color-charcoal: #2D3436;
          --color-warm-gray: #636E72;

          --font-display: 'Fraunces', Georgia, serif;
          --font-body: 'DM Sans', -apple-system, sans-serif;

          min-height: 100vh;
          background: var(--color-cream);
          color: var(--color-charcoal);
          font-family: var(--font-body);
          overflow-x: hidden;
          position: relative;
        }

        /* Subtle paper texture overlay */
        .landing-page::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 1000;
        }

        .floating-elements {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .float-item {
          position: absolute;
          font-size: 2.5rem;
          opacity: 0.15;
        }

        /* Navigation */
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 4rem;
          position: relative;
          z-index: 10;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 2rem;
        }

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

        .nav-cta:hover {
          background: var(--color-terracotta-dark);
        }

        /* Hero Section */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .hero-content {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 2rem 4rem 4rem;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .hero-text h1 {
          font-family: var(--font-display);
          font-size: 3.5rem;
          line-height: 1.15;
          margin-bottom: 1.5rem;
        }

        .hero-accent {
          color: var(--color-terracotta);
          font-style: italic;
          font-weight: 400;
        }

        .hero-main {
          font-weight: 700;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--color-warm-gray);
          line-height: 1.7;
          max-width: 500px;
        }

        /* Demo Card */
        .demo-section {
          position: relative;
        }

        .demo-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow:
            0 4px 6px rgba(0, 0, 0, 0.02),
            0 12px 24px rgba(0, 0, 0, 0.04),
            0 24px 48px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .demo-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          font-weight: 500;
          color: var(--color-sage);
        }

        .demo-icon {
          font-size: 1.25rem;
        }

        .demo-input-area {
          position: relative;
        }

        .ingredient-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          min-height: 2rem;
        }

        .ingredient-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--color-sage-light);
          color: var(--color-sage);
          padding: 0.5rem 0.75rem;
          border-radius: 100px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .ingredient-tag button {
          background: none;
          border: none;
          color: var(--color-sage);
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
          padding: 0;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .ingredient-tag button:hover {
          opacity: 1;
        }

        .demo-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #E8E8E8;
          border-radius: 16px;
          font-family: var(--font-body);
          font-size: 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .demo-input:focus {
          outline: none;
          border-color: var(--color-sage);
          box-shadow: 0 0 0 4px var(--color-sage-light);
        }

        .demo-input::placeholder {
          color: #B0B0B0;
        }

        .input-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #B0B0B0;
        }

        /* Demo Results */
        .demo-results {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #F0F0F0;
          overflow: hidden;
        }

        .results-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: var(--color-terracotta);
        }

        .results-icon {
          font-size: 1.25rem;
        }

        .recipe-preview-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .recipe-preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #FAFAFA;
          border-radius: 12px;
          transition: background 0.2s;
        }

        .recipe-preview-item:hover {
          background: #F5F5F5;
        }

        .recipe-preview-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .recipe-preview-name {
          font-weight: 600;
          color: var(--color-charcoal);
        }

        .recipe-preview-time {
          font-size: 0.85rem;
          color: var(--color-warm-gray);
        }

        .recipe-preview-match {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .match-bar {
          width: 60px;
          height: 6px;
          background: #E8E8E8;
          border-radius: 3px;
          overflow: hidden;
        }

        .match-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-sage), var(--color-saffron));
          border-radius: 3px;
        }

        .match-percent {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-sage);
          min-width: 3rem;
          text-align: right;
        }

        .demo-cta {
          width: 100%;
          margin-top: 1.25rem;
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

        .demo-cta:hover {
          background: var(--color-terracotta-dark);
        }

        .hero-scroll-indicator {
          text-align: center;
          padding-bottom: 2rem;
          color: var(--color-warm-gray);
          font-size: 1.5rem;
          opacity: 0.5;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 0;
          background: white;
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 4rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-eyebrow {
          display: inline-block;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-terracotta);
          margin-bottom: 1rem;
        }

        .section-header h2 {
          font-family: var(--font-display);
          font-size: 2.75rem;
          font-weight: 600;
        }

        .section-header h2 em {
          color: var(--color-terracotta);
          font-style: italic;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .feature-card {
          background: var(--color-cream);
          padding: 2rem;
          border-radius: 20px;
          text-align: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .feature-card:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
        }

        .feature-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          font-size: 0.95rem;
          color: var(--color-warm-gray);
          line-height: 1.6;
        }

        /* Testimonials Section */
        .testimonials-section {
          padding: 6rem 0;
          background: linear-gradient(180deg, white 0%, var(--color-cream) 100%);
        }

        .testimonials-carousel {
          max-width: 600px;
          margin: 0 auto 4rem;
          text-align: center;
        }

        .testimonial-card {
          padding: 2rem;
        }

        .testimonial-avatar {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }

        .testimonial-card blockquote {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-style: italic;
          line-height: 1.6;
          color: var(--color-charcoal);
          margin-bottom: 1rem;
        }

        .testimonial-card cite {
          font-style: normal;
          color: var(--color-warm-gray);
          font-weight: 500;
        }

        .testimonial-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          background: #DDD;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s;
        }

        .dot.active {
          background: var(--color-terracotta);
          transform: scale(1.2);
        }

        .stats-row {
          display: flex;
          justify-content: center;
          gap: 6rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
          color: var(--color-terracotta);
        }

        .stat-label {
          font-size: 1rem;
          color: var(--color-warm-gray);
          font-weight: 500;
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 0;
          background: var(--color-charcoal);
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--color-terracotta) 0%, transparent 70%);
          opacity: 0.15;
        }

        .cta-content {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .cta-content h2 {
          font-family: var(--font-display);
          font-size: 2.75rem;
          font-weight: 600;
          color: white;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
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
          transition: background 0.3s, transform 0.2s;
        }

        .cta-button:hover {
          background: var(--color-terracotta-dark);
        }

        .cta-button span {
          font-size: 1.25rem;
        }

        /* Footer */
        .landing-footer {
          background: var(--color-charcoal);
          padding: 3rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 4rem;
          text-align: center;
        }

        .footer-content .logo {
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .footer-content .logo-text {
          color: white;
        }

        .footer-tagline {
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 1.5rem;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: white;
        }

        .footer-copyright {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 3rem;
            padding: 2rem;
          }

          .hero-text h1 {
            font-size: 2.75rem;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .nav {
            padding: 1.25rem 2rem;
          }

          .section-container {
            padding: 0 2rem;
          }

          .stats-row {
            gap: 3rem;
          }
        }

        @media (max-width: 640px) {
          .hero-text h1 {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .stats-row {
            flex-direction: column;
            gap: 2rem;
          }

          .section-header h2 {
            font-size: 2rem;
          }

          .cta-content h2 {
            font-size: 2rem;
          }

          .footer-links {
            flex-wrap: wrap;
            gap: 1rem 2rem;
          }

          .float-item {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
