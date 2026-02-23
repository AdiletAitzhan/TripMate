import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { useAuth } from "../context/useAuth";

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        closeSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSidebarOpen]);

  // Scroll animations using Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("aos-animate");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll("[data-aos]");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="app-layout">
        {/* Sidebar overlay */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
          onClick={closeSidebar}
          aria-hidden="true"
        />

        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`sidebar ${isSidebarOpen ? "open" : ""}`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="sidebar-header">
            <span className="sidebar-title">Menu</span>
            <button
              type="button"
              className="menu-button"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <nav>
            <Link
              to="/dashboard"
              className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              Catalog
            </Link>
            <Link
              to="/profile"
              className={`sidebar-link ${location.pathname === "/profile" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              Profile
            </Link>
            <Link
              to="/requests"
              className={`sidebar-link ${location.pathname === "/requests" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              Requests
            </Link>
            <Link
              to="/offers"
              className={`sidebar-link ${location.pathname === "/offers" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              Offers
            </Link>
          </nav>

          <div className="spacer" />

          <button
            onClick={handleLogout}
            type="button"
            className="sidebar-link logout"
          >
            Log out
          </button>
        </aside>

        {/* Header */}
        <header className="app-header">
          <div className="app-header-left">
            <button
              type="button"
              className="menu-button"
              onClick={toggleSidebar}
              aria-label="Open menu"
              aria-expanded={isSidebarOpen}
            >
              ☰
            </button>
            <span>TripMate</span>
          </div>

          <div className="app-header-right">
            <NotificationButton />
          </div>
        </header>

        {/* Main content */}
        <main className="app-content">
          {/* Hero Section */}
          <section className="hero-section" data-aos="fade-up">
            <div className="hero-background">
              <div className="hero-gradient"></div>
              <div className="hero-pattern"></div>
            </div>
            <div className="hero-content">
              <h1 className="hero-title">
                Welcome Back!
                <span className="hero-title-accent">
                  {" "}
                  Let's Plan Your Next Adventure
                </span>
              </h1>
              <p className="hero-subtitle">
                Create new trips, manage expenses, and explore destinations with
                your group. Everything you need for seamless group travel
                planning.
              </p>
              <div className="hero-cta-group">
                <button
                  className="btn btn-primary hero-cta-primary"
                  onClick={() => navigate("/requests")}
                  aria-label="Create a new trip"
                >
                  Create New Trip
                </button>
                <button
                  className="btn btn-secondary hero-cta-secondary"
                  onClick={() => navigate("/profile")}
                  aria-label="Go to profile"
                >
                  My Profile
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title">TripMate</h3>
              <p className="footer-tagline">
                Travel together, explore forever.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 TripMate. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
