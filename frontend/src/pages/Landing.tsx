import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TripSearch } from "../components/TripSearch";
import { TripCard } from "../components/TripCard";
import { useAuth } from "../context/useAuth";
import type { TripVacancyResponse } from "../types/tripRequest";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export function Landing() {
  const navigate = useNavigate();
  const { accessToken, isReady } = useAuth();
  const [tripVacancies, setTripVacancies] = useState<TripVacancyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Redirect authenticated users to home
  useEffect(() => {
    if (isReady && accessToken) {
      navigate("/home", { replace: true });
    }
  }, [isReady, accessToken, navigate]);

  // Fetch trip vacancies
  useEffect(() => {
    const fetchTripVacancies = async () => {
      try {
        setLoading(true);
        const apiUrl = `${BASE.replace(/\/$/, "")}/api/v1/trip-vacancies`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.message || "Failed to fetch trip vacancies",
          );
        }

        const data = await response.json();

        // API returns array directly
        if (Array.isArray(data)) {
          setTripVacancies(data);
        } else {
          console.error("Unexpected data format:", data);
          setTripVacancies([]);
        }
      } catch (err) {
        console.error("Error fetching trip vacancies:", err);
        setError(err instanceof Error ? err.message : "Failed to load trips");
      } finally {
        setLoading(false);
      }
    };

    fetchTripVacancies();
  }, []);

  // Fixed header scrolled state
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal"),
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Mobile menu body lock
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const IconCompass = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" strokeWidth="1.8" />
      <path d="M14.9 9.1 13 13l-3.9 1.9L11 11l3.9-1.9Z" strokeWidth="1.8" />
      <path
        d="M12 7.5v.01M12 16.5v.01M7.5 12v.01M16.5 12v.01"
        strokeWidth="2.2"
      />
    </svg>
  );

  const IconMap = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18 3 20V6l6-2 6 2 6-2v14l-6 2-6-2Z" strokeWidth="1.8" />
      <path d="M9 4v14M15 6v14" strokeWidth="1.8" />
    </svg>
  );

  const IconCard = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7.5h18v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
        strokeWidth="1.8"
      />
      <path d="M3 10h18" strokeWidth="1.8" />
      <path d="M7 15h5" strokeWidth="1.8" />
    </svg>
  );

  const IconChat = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 12a7.5 7.5 0 0 1-7.5 7.5H8l-4 2V19.5A7.5 7.5 0 0 1 12 4.5H12.5A7.5 7.5 0 0 1 20 12Z"
        strokeWidth="1.8"
      />
      <path d="M8.2 12h.01M12 12h.01M15.8 12h.01" strokeWidth="3" />
    </svg>
  );

  const IconCamera = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.5 7 10 5.5h4L15.5 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3.5Z"
        strokeWidth="1.8"
      />
      <path d="M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" strokeWidth="1.8" />
    </svg>
  );

  const IconGlobe = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" strokeWidth="1.8" />
      <path d="M3.6 9h16.8M3.6 15h16.8" strokeWidth="1.8" />
      <path d="M12 3a14 14 0 0 1 0 18" strokeWidth="1.8" />
      <path d="M12 3a14 14 0 0 0 0 18" strokeWidth="1.8" />
    </svg>
  );

  return (
    <>
      <div className="grain" aria-hidden="true" />

      <header className={`tm-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-inner">
          <Link to="/" className="logo" onClick={closeMenu}>
            TripMate
          </Link>

          <button
            className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <span />
          </button>

          <nav aria-label="Primary">
            <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
              <li>
                <a href="#features" onClick={closeMenu}>
                  Features
                </a>
              </li>
              <li>
                <a href="#how" onClick={closeMenu}>
                  How it works
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={closeMenu}>
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/login" className="btn btn-ghost" onClick={closeMenu}>
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="btn btn-primary"
                  onClick={closeMenu}
                >
                  Get started
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <p className="hero-badge">Social travel, reimagined</p>
              <h1>
                Find your travel tribe. <span>Plan together.</span>
              </h1>
              <p>
                Match with like-minded travelers, build shared itineraries,
                split costs, and explore the world with people who get it. No
                more solo planning— adventure is better together.
              </p>
              <div className="hero-ctas">
                <Link to="/signup" className="btn btn-primary">
                  Start matching free
                </Link>
                <a href="#how" className="btn btn-ghost">
                  See how it works
                </a>
              </div>
              <TripSearch />
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="hero-card-stack">
                <div className="hero-card">
                  <div className="hero-card-title">Tokyo · March 2026</div>
                  <div className="hero-card-meta">
                    Food & culture · 3 travelers
                  </div>
                  <div className="hero-card-avatars">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <div className="hero-card">
                  <div className="hero-card-title">Iceland · Adventure</div>
                  <div className="hero-card-meta">
                    Hiking & photography · 2 travelers
                  </div>
                  <div className="hero-card-avatars">
                    <span />
                    <span />
                  </div>
                </div>
                <div className="hero-card">
                  <div className="hero-card-title">Bali · Budget trip</div>
                  <div className="hero-card-meta">
                    Beach & wellness · 4 travelers
                  </div>
                  <div className="hero-card-avatars">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <div className="container">
            <div className="features-header">
              <p className="section-label reveal">What’s inside</p>
              <h2 className="section-title reveal">
                Everything you need to travel together
              </h2>
              <p className="section-desc reveal">
                From matching to splitting bills—one place for your whole trip.
              </p>
            </div>

            <div className="features-grid">
              <article className="feature-card reveal">
                <div className="feature-icon match">{IconCompass}</div>
                <h3>Smart matching</h3>
                <p>
                  Get matched by interests—adventure, culture, food, budget, or
                  luxury. Filter by destination and dates, and find travel
                  companions who share your pace and style.
                </p>
              </article>
              <article className="feature-card reveal reveal-delay-1">
                <div className="feature-icon plan">{IconMap}</div>
                <h3>Collaborative planning</h3>
                <p>
                  Shared itineraries, maps, and votes. Build mood boards, store
                  docs, and keep everyone aligned as plans evolve.
                </p>
              </article>
              <article className="feature-card reveal reveal-delay-2">
                <div className="feature-icon money">{IconCard}</div>
                <h3>Expenses & splitting</h3>
                <p>
                  Track and split costs across currencies. Settle up clearly so
                  nobody’s guessing who owes what.
                </p>
              </article>
            </div>

            <div className="features-grid" style={{ marginTop: 32 }}>
              <article className="feature-card reveal reveal-delay-1">
                <div className="feature-icon match">{IconChat}</div>
                <h3>Chat & coordination</h3>
                <p>
                  Group chat, polls, meeting points, and updates—built around
                  your trip so plans stay in sync.
                </p>
              </article>
              <article className="feature-card reveal reveal-delay-2">
                <div className="feature-icon plan">{IconCamera}</div>
                <h3>Destination content</h3>
                <p>
                  Local tips, guides, and hidden gems—so you travel smarter, not
                  harder.
                </p>
              </article>
              <article className="feature-card reveal reveal-delay-3">
                <div className="feature-icon money">{IconGlobe}</div>
                <h3>Accessible & global</h3>
                <p>
                  Keyboard-friendly UI, strong contrast, and a platform built
                  for travel across regions and time zones.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="how" id="how">
          <div className="container">
            <p className="section-label reveal">Simple steps</p>
            <h2 className="section-title reveal">
              From stranger to travel buddy in minutes
            </h2>
            <p className="section-desc reveal">
              Create your profile, set preferences, discover matches, and start
              planning your first shared trip.
            </p>
            <div className="how-steps">
              <div className="step reveal">
                <div className="step-num">1</div>
                <h3>Sign up & profile</h3>
                <p>
                  Add travel preferences, budget, pace, and verify your account.
                </p>
              </div>
              <div className="step reveal reveal-delay-1">
                <div className="step-num">2</div>
                <h3>Discover matches</h3>
                <p>
                  Filter by destination, dates, and interests. Find your tribe.
                </p>
              </div>
              <div className="step reveal reveal-delay-2">
                <div className="step-num">3</div>
                <h3>Plan together</h3>
                <p>
                  Create a shared trip, build the itinerary, and coordinate as a
                  group.
                </p>
              </div>
              <div className="step reveal reveal-delay-3">
                <div className="step-num">4</div>
                <h3>Travel & settle</h3>
                <p>
                  Split costs clearly, keep receipts, and wrap up with reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Trip requests">
          <div className="container">
            <div className="trips-section-header">
              <div>
                <p className="section-label reveal">Explore</p>
                <h2 className="section-title reveal">
                  Available trip requests
                </h2>
                <p className="section-desc reveal">
                  Browse real trips created by the community and offer to join.
                </p>
              </div>
            </div>

            {loading && (
              <div className="trips-loading">
                <p>Loading trips...</p>
              </div>
            )}
            {error && (
              <div className="trips-error" role="alert">
                <p>{error}</p>
              </div>
            )}
            {!loading && !error && tripVacancies.length === 0 && (
              <div className="trips-empty">
                <p>
                  No trip requests available at the moment. Check back soon.
                </p>
              </div>
            )}
            {!loading && !error && tripVacancies.length > 0 && (
              <div className="trips-grid">
                {tripVacancies.map((vacancy) => (
                  <TripCard
                    key={vacancy.id}
                    tripVacancy={vacancy}
                    onOfferClick={() => navigate("/login")}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="cta" id="pricing">
          <div className="container">
            <div className="cta-box">
              <p className="section-label">Ready to go</p>
              <h2 className="section-title">Your next adventure starts here</h2>
              <p className="section-desc">
                Join TripMate free. Upgrade for advanced matching, verified
                badges, and featured experiences when you need more.
              </p>
              <Link to="/signup" className="btn btn-primary">
                Create free account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="tm-footer">
        <div className="container">
          <div className="footer-inner">
            <Link to="/" className="footer-logo">
              TripMate
            </Link>
            <ul className="footer-links">
              <li>
                <a href="#">Privacy</a>
              </li>
              <li>
                <a href="#">Terms</a>
              </li>
              <li>
                <a href="#">Help</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
            <span className="footer-copy">
              © TripMate. Find your travel tribe.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
