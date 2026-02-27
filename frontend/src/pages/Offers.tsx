import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/useAuth";
import { offersApi } from "../api/offersApi";
import { useTripVacanciesApi } from "../hooks/useTripVacanciesApi";
import type { OfferResponse } from "../types/offer";
import type { TripVacancyResponse } from "../types/tripRequest";

function formatDate(s: string): string {
  const d = new Date(s);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "accepted":
      return {
        bg: "var(--status-success-bg)",
        border: "var(--status-success-border)",
        text: "var(--status-success)",
      };
    case "rejected":
      return {
        bg: "var(--status-error-bg)",
        border: "var(--status-error-border)",
        text: "var(--status-error)",
      };
    case "cancelled":
      return {
        bg: "var(--bg-elevated)",
        border: "var(--border)",
        text: "var(--text-muted)",
      };
    default: // pending
      return {
        bg: "var(--accent-light)",
        border: "var(--accent)",
        text: "var(--accent)",
      };
  }
}

export function Offers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth();
  const { getVacancyById } = useTripVacanciesApi();

  const [offers, setOffers] = useState<OfferResponse[]>([]);
  const [vacancyDetails, setVacancyDetails] = useState<
    Map<number, TripVacancyResponse>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await offersApi.getMyOffers();
      setOffers(Array.isArray(data) ? data : []);

      // Load vacancy details for each offer
      const vacancyMap = new Map<number, TripVacancyResponse>();
      for (const offer of data) {
        if (!vacancyMap.has(offer.trip_vacancy_id)) {
          try {
            const vacancy = await getVacancyById(offer.trip_vacancy_id);
            vacancyMap.set(offer.trip_vacancy_id, vacancy);
          } catch (e) {
            console.error("Failed to load vacancy details", e);
          }
        }
      }
      setVacancyDetails(vacancyMap);
    } catch (e) {
      setError((e as Error)?.message ?? "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) {
      setLoading(false);
      return;
    }
    loadOffers();
  }, [isReady, accessToken, refreshToken]);

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
    if (isSidebarOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) setIsSidebarOpen(false);
    };
    if (isSidebarOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleCancelOffer = async (offerId: number) => {
    if (!confirm("Are you sure you want to cancel this offer?")) return;

    try {
      await offersApi.cancelOffer(offerId);
      loadOffers();
    } catch (e) {
      alert((e as Error)?.message ?? "Failed to cancel offer");
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="app-layout">
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
          onClick={closeSidebar}
          aria-hidden="true"
        />

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
              to="/home"
              className={`sidebar-link ${location.pathname === "/home" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              Home
            </Link>
            <Link
              to="/profile"
              className={`sidebar-link ${location.pathname === "/profile" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              Profile
            </Link>
            <Link
              to="/my-vacancies"
              className={`sidebar-link ${location.pathname === "/my-vacancies" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              My Vacancies
            </Link>
            <Link
              to="/offers"
              className={`sidebar-link ${location.pathname === "/offers" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              My Offers
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
            <ThemeToggle />
            <NotificationButton />
          </div>
        </header>

        <main
          className="app-content"
          style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}
        >
          <div style={{ marginBottom: 24, textAlign: "left" }}>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--text)",
                margin: "0 0 4px",
                letterSpacing: "-0.02em",
              }}
            >
              My Offers
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              View all offers you've sent to trip vacancies
            </p>
          </div>

          {error && (
            <p
              style={{
                color: "var(--status-error)",
                marginBottom: 16,
                fontSize: "0.9375rem",
                padding: "12px 16px",
                background: "var(--status-error-bg)",
                borderRadius: 8,
                border: "1px solid var(--status-error-border)",
              }}
              role="alert"
            >
              {error}
            </p>
          )}

          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading…</p>
          ) : offers.length === 0 ? (
            <div
              className="card-premium"
              style={{
                padding: 48,
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                You haven't sent any offers yet.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/home")}
                style={{ width: "auto", padding: "12px 24px" }}
              >
                Browse Trip Vacancies
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {offers.map((offer) => {
                const vacancy = vacancyDetails.get(offer.trip_vacancy_id);
                const statusColors = getStatusColor(offer.status);

                return (
                  <div
                    key={offer.id}
                    className="card-premium"
                    style={{
                      padding: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: 600,
                            color: "var(--text)",
                            margin: "0 0 8px",
                          }}
                        >
                          {vacancy
                            ? `${vacancy.destination_city}, ${vacancy.destination_country}`
                            : "Trip Vacancy"}
                        </h3>
                        {vacancy && (
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--text-muted)",
                              margin: 0,
                            }}
                          >
                            {formatDate(vacancy.start_date)} —{" "}
                            {formatDate(vacancy.end_date)}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          padding: "6px 16px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          borderRadius: 999,
                          background: statusColors.bg,
                          border: `1px solid ${statusColors.border}`,
                          color: statusColors.text,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {offer.status}
                      </span>
                    </div>

                    {offer.message && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            margin: "0 0 6px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Your Message
                        </p>
                        <p
                          style={{
                            fontSize: "0.9375rem",
                            color: "var(--text)",
                            margin: 0,
                            lineHeight: 1.6,
                          }}
                        >
                          {offer.message}
                        </p>
                      </div>
                    )}

                    {offer.proposed_budget && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            margin: "0 0 6px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Proposed Budget
                        </p>
                        <p
                          style={{
                            fontSize: "0.9375rem",
                            fontWeight: 600,
                            color: "var(--text)",
                            margin: 0,
                          }}
                        >
                          {offer.proposed_budget} KZT
                        </p>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        paddingTop: 8,
                        borderTop: "1px solid var(--border)",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-muted)",
                          margin: 0,
                        }}
                      >
                        Sent on {formatDate(offer.created_at)}
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        {vacancy && (
                          <button
                            onClick={() => navigate(`/requests/${vacancy.id}`)}
                            className="btn btn-secondary"
                            style={{
                              padding: "8px 16px",
                              fontSize: "0.875rem",
                            }}
                          >
                            View Trip
                          </button>
                        )}
                        {offer.status === "pending" && (
                          <button
                            onClick={() => handleCancelOffer(offer.id)}
                            className="btn btn-secondary"
                            style={{
                              padding: "8px 16px",
                              fontSize: "0.875rem",
                              color: "var(--status-error)",
                            }}
                          >
                            Cancel Offer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="app-footer">
          © 2026 TripMate. Travel together, explore forever.
        </footer>
      </div>
    </>
  );
}
