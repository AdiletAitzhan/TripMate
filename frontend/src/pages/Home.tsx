import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { NotificationButton } from "../components/NotificationButton";
import { UserAvatar } from "../components/UserAvatar";
import { FeatureCard } from "../components/FeatureCard";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  IconCatalog,
  IconProfile,
  IconRequests,
  IconOffers,
  IconLogout,
  IconMenu,
  IconClose,
} from "../components/icons";
import { useAuth } from "../context/useAuth";
import { useUsersApi } from "../hooks/useUsersApi";

function photoUrlForBrowser(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/http:\/\/minio:9000/, "http://localhost:9000");
}

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth();
  const { getProfile } = useUsersApi();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) return;
    let cancelled = false;
    getProfile()
      .then((body) => {
        if (cancelled) return;
        const data = (
          body as { success?: boolean; data?: { profilePhoto?: string } }
        )?.data;
        const photo = data?.profilePhoto;
        if (photo) setProfilePhoto(photoUrlForBrowser(photo) ?? photo);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isReady, accessToken, refreshToken, getProfile]);

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

  const avatarUrl = photoUrlForBrowser(profilePhoto ?? undefined);

  return (
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
            <IconClose />
          </button>
        </div>

        <nav>
          <Link
            to="/"
            className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <IconCatalog />
            Catalog
          </Link>
          <Link
            to="/profile"
            className={`sidebar-link ${location.pathname === "/profile" ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <IconProfile />
            Profile
          </Link>
          <Link
            to="/requests"
            className={`sidebar-link ${location.pathname === "/requests" ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <IconRequests />
            Requests
          </Link>
          <Link
            to="/offers"
            className={`sidebar-link ${location.pathname === "/offers" ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <IconOffers />
            Offers
          </Link>
        </nav>

        <div className="spacer" />

        <button
          onClick={handleLogout}
          type="button"
          className="sidebar-link logout"
        >
          <IconLogout />
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
            <IconMenu />
          </button>
          <Logo />
        </div>

        <div className="app-header-right">
          <ThemeToggle />
          <NotificationButton />
          <UserAvatar photoUrl={avatarUrl} />
        </div>
      </header>

      {/* Main content */}
      <main className="app-content">
        <section className="welcome-section">
          <h1 className="welcome-title">Welcome to TripMate</h1>
          <p className="welcome-description">
            Plan your perfect trip with friends. Share itineraries, split costs,
            and make memories together.
          </p>
        </section>

        <div className="features-grid">
          <FeatureCard
            emoji="🗺️"
            title="Plan Together"
            description="Create shared itineraries and collaborate in real-time with your travel group."
          />
          <FeatureCard
            emoji="💰"
            title="Split Expenses"
            description="Track group expenses and settle up easily. No more awkward money talks."
          />
          <FeatureCard
            emoji="📍"
            title="Discover Places"
            description="Get personalized recommendations based on your group's interests."
          />
        </div>

        <div className="cta-card">
          <h2 className="cta-title">Ready to start your adventure?</h2>
          <button
            className="btn btn-primary cta-button"
            onClick={() => navigate("/requests")}
          >
            Create New Trip
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        © 2026 TripMate. Travel together, explore forever.
      </footer>
    </div>
  );
}
