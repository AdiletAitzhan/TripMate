import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/useAuth";
import { useTripVacanciesApi } from "../hooks/useTripVacanciesApi";
import type { TripVacancyResponse } from "../types/tripRequest";

function formatDate(s: string | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(s: string | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVacancyDestination(v: TripVacancyResponse): string {
  const parts = [v.destination_city, v.destination_country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function formatVacancyBudget(v: TripVacancyResponse): string {
  const min = v.min_budget;
  const max = v.max_budget;
  if (!min && !max) return "—";
  if (min && max) return `${min} - ${max} KZT`;
  if (min) return `From ${min} KZT`;
  if (max) return `Up to ${max} KZT`;
  return "—";
}

const INTEREST_COLORS = [
  { bg: "#E8D5F2", text: "#6B2D8F" }, // Purple
  { bg: "#FFE5E5", text: "#C92A2A" }, // Red
  { bg: "#D3F5F7", text: "#0C7792" }, // Cyan
  { bg: "#FFF3C4", text: "#8B6914" }, // Yellow
  { bg: "#C8E6C9", text: "#2E7D32" }, // Green
  { bg: "#FFCCBC", text: "#D84315" }, // Orange
  { bg: "#BBDEFB", text: "#1565C0" }, // Blue
  { bg: "#F8BBD0", text: "#AD1457" }, // Pink
];

function getInterestColor(index: number) {
  return INTEREST_COLORS[index % INTEREST_COLORS.length];
}

export function TripRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth();
  const { getVacancyById } = useTripVacanciesApi();

  const [vacancy, setVacancy] = useState<TripVacancyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !isReady || (!accessToken && !refreshToken)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getVacancyById(Number(id))
      .then((data) => setVacancy(data))
      .catch((e) => setError(e?.message ?? "Failed to load trip vacancy"))
      .finally(() => setLoading(false));
  }, [id, isReady, accessToken, refreshToken, getVacancyById]);

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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const goBack = () => navigate("/requests");

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
              to="/requests"
              className={`sidebar-link ${location.pathname.startsWith("/requests") ? "active" : ""}`}
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
          style={{ padding: 32, maxWidth: 700, margin: "0 auto" }}
        >
          <button
            type="button"
            onClick={goBack}
            className="btn btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              padding: "8px 16px",
            }}
            aria-label="Back to requests"
          >
            ← Back to Trip Vacancies
          </button>

          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading…</p>
          ) : error ? (
            <div
              className="card-premium"
              style={{
                padding: 24,
                background: "var(--status-error-bg)",
                border: "1px solid var(--status-error-border)",
              }}
            >
              <p style={{ color: "var(--status-error)", margin: 0 }}>{error}</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={goBack}
                style={{ marginTop: 16 }}
              >
                Back
              </button>
            </div>
          ) : !vacancy ? (
            <p style={{ color: "var(--text-muted)" }}>
              Trip vacancy not found.
            </p>
          ) : (
            <>
              {/* Header Section */}
              <div
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "24px 32px",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: "0 0 8px",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {formatVacancyDestination(vacancy)}
                    </h1>
                    {vacancy.status && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 16px",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          borderRadius: 999,
                          background: "var(--accent-light)",
                          color: "var(--accent)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {vacancy.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip Overview Card - 2 Columns */}
              <div
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "24px 32px",
                  marginBottom: 24,
                }}
              >
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: "0 0 20px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Trip Overview
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 24,
                  }}
                >
                  {/* Left Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* Dates */}
                    <div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "var(--text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        Travel Dates
                      </div>
                      <div
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          color: "var(--text)",
                        }}
                      >
                        {formatDate(vacancy.start_date)} —{" "}
                        {formatDate(vacancy.end_date)}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "var(--text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        Budget Range
                      </div>
                      <div
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          color: "var(--text)",
                        }}
                      >
                        {formatVacancyBudget(vacancy) || "Not specified"}
                      </div>
                    </div>

                    {/* Description */}
                    {vacancy.description && (
                      <div>
                        <div
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--text-muted)",
                            marginBottom: 6,
                          }}
                        >
                          Description
                        </div>
                        <div
                          style={{
                            fontSize: "0.9375rem",
                            color: "var(--text)",
                            lineHeight: 1.6,
                          }}
                        >
                          {vacancy.description}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* People Needed */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "var(--bg-elevated)",
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                        }}
                      >
                        People Needed
                      </span>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {vacancy.people_needed}
                      </span>
                    </div>

                    {/* Age Range */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "var(--bg-elevated)",
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                        }}
                      >
                        Age Range
                      </span>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {vacancy.min_age ?? "Any"} - {vacancy.max_age ?? "Any"}
                      </span>
                    </div>

                    {/* Gender */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "var(--bg-elevated)",
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                        }}
                      >
                        Gender
                      </span>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {vacancy.gender_preference || "Any"}
                      </span>
                    </div>

                    {/* Transportation */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "var(--bg-elevated)",
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                        }}
                      >
                        Transportation
                      </span>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {vacancy.transportation_preference || "Any"}
                      </span>
                    </div>

                    {/* Accommodation */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "var(--bg-elevated)",
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                        }}
                      >
                        Accommodation
                      </span>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {vacancy.accommodation_preference || "Any"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities & Destinations Card */}
              {(vacancy.planned_activities || vacancy.planned_destinations) && (
                <div
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: "24px 32px",
                    marginBottom: 24,
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      margin: "0 0 20px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Activities & Destinations
                  </h2>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 24,
                    }}
                  >
                    {vacancy.planned_activities && (
                      <div>
                        <div
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--text-muted)",
                            marginBottom: 6,
                          }}
                        >
                          Planned Activities
                        </div>
                        <div
                          style={{
                            fontSize: "0.9375rem",
                            color: "var(--text)",
                            lineHeight: 1.6,
                          }}
                        >
                          {vacancy.planned_activities}
                        </div>
                      </div>
                    )}

                    {vacancy.planned_destinations && (
                      <div>
                        <div
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--text-muted)",
                            marginBottom: 6,
                          }}
                        >
                          Planned Destinations
                        </div>
                        <div
                          style={{
                            fontSize: "0.9375rem",
                            color: "var(--text)",
                            lineHeight: 1.6,
                          }}
                        >
                          {vacancy.planned_destinations}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Created Date - Small Footer */}
              {vacancy.created_at && (
                <div
                  style={{
                    padding: "12px 0",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>📅</span>
                    <span>Created on {formatDateTime(vacancy.created_at)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        <footer className="app-footer">
          © 2026 TripMate. Travel together, explore forever.
        </footer>
      </div>
    </>
  );
}
