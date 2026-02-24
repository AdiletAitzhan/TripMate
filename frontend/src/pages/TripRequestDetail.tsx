import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/useAuth";
import { useTripRequestsApi } from "../hooks/useTripRequestsApi";
import type { TripRequestResponse } from "../types/tripRequest";

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

function formatDestination(dest: TripRequestResponse["destination"]): string {
  const parts = [dest?.city, dest?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function formatBudget(budget: TripRequestResponse["budget"]): string {
  if (!budget?.amount) return "—";
  const curr = budget.currency ?? "USD";
  return `${budget.amount} ${curr}`;
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

function formatPreferences(
  prefs: TripRequestResponse["preferences"],
): JSX.Element | null {
  if (!prefs) return null;

  const items: JSX.Element[] = [];

  if (prefs.mustHave) {
    const mustItems: string[] = [];

    if (prefs.mustHave.ageRange) {
      const { min, max } = prefs.mustHave.ageRange;
      mustItems.push(`Age: ${min ?? "?"}-${max ?? "?"}`);
    }

    if (prefs.mustHave.gender && prefs.mustHave.gender.length > 0) {
      const genders = prefs.mustHave.gender.join(", ");
      mustItems.push(`Gender: ${genders}`);
    }

    if (prefs.mustHave.verifiedOnly !== undefined) {
      mustItems.push(
        `Verified only: ${prefs.mustHave.verifiedOnly ? "Yes" : "No"}`,
      );
    }

    if (mustItems.length > 0) {
      items.push(
        <div key="must-have" style={{ marginBottom: 12 }}>
          <strong style={{ color: "var(--accent)", fontSize: "0.875rem" }}>
            Must Have:
          </strong>
          <ul
            style={{ margin: "4px 0 0", paddingLeft: 20, fontSize: "0.875rem" }}
          >
            {mustItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 2 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>,
      );
    }
  }

  if (prefs.niceToHave) {
    const niceItems: string[] = [];

    if (prefs.niceToHave.similarInterests) {
      niceItems.push(`Similar interests: ${prefs.niceToHave.similarInterests}`);
    }

    if (prefs.niceToHave.similarBudget) {
      niceItems.push(`Similar budget: ${prefs.niceToHave.similarBudget}`);
    }

    if (niceItems.length > 0) {
      items.push(
        <div key="nice-to-have">
          <strong style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Nice to Have:
          </strong>
          <ul
            style={{ margin: "4px 0 0", paddingLeft: 20, fontSize: "0.875rem" }}
          >
            {niceItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 2 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>,
      );
    }
  }

  return items.length > 0 ? <div>{items}</div> : null;
}

export function TripRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth();
  const { getById } = useTripRequestsApi();

  const [request, setRequest] = useState<TripRequestResponse | null>(null);
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
    getById(id)
      .then((res) => setRequest(res.data))
      .catch((e) => setError(e?.message ?? "Failed to load trip request"))
      .finally(() => setLoading(false));
  }, [id, isReady, accessToken, refreshToken, getById]);

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
              My Requests
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
            ← Back to Trip Requests
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
          ) : !request ? (
            <p style={{ color: "var(--text-muted)" }}>
              Trip request not found.
            </p>
          ) : (
            <div
              className="card-premium"
              style={{
                padding: 32,
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: "0 0 8px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatDestination(request.destination)}
                </h1>
                {request.status && (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      borderRadius: 999,
                      background: "var(--accent-light)",
                      color: "var(--accent)",
                    }}
                  >
                    {request.status}
                  </span>
                )}
              </div>

              <section
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 4px",
                    }}
                  >
                    Dates
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {formatDate(request.startDate)} —{" "}
                    {formatDate(request.endDate)}
                    {request.duration != null && (
                      <span
                        style={{ color: "var(--text-muted)", marginLeft: 8 }}
                      >
                        ({request.duration} day
                        {request.duration !== 1 ? "s" : ""})
                      </span>
                    )}
                  </p>
                  {request.flexibleDates && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        margin: "4px 0 0",
                      }}
                    >
                      Flexible dates
                    </p>
                  )}
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 4px",
                    }}
                  >
                    Budget
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {formatBudget(request.budget)}
                  </p>
                </div>

                {request.matchCount != null && request.matchCount > 0 && (
                  <div>
                    <h3
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: "0 0 4px",
                      }}
                    >
                      Matches
                    </h3>
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "var(--status-success)",
                        margin: 0,
                      }}
                    >
                      {request.matchCount} match
                      {request.matchCount !== 1 ? "es" : ""} found
                    </p>
                  </div>
                )}

                {request.notifyOnMatch != null && (
                  <div>
                    <h3
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: "0 0 4px",
                      }}
                    >
                      Notifications
                    </h3>
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "var(--text)",
                        margin: 0,
                      }}
                    >
                      {request.notifyOnMatch
                        ? "Notify on match"
                        : "No notifications"}
                    </p>
                  </div>
                )}

                {request.createdAt && (
                  <div>
                    <h3
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: "0 0 4px",
                      }}
                    >
                      Created
                    </h3>
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "var(--text)",
                        margin: 0,
                      }}
                    >
                      {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                )}

                {request.interests && request.interests.length > 0 && (
                  <div>
                    <h3
                      style={{
                        fontSize: "1rem",
                        marginBottom: "0.75rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      Interests
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      {request.interests.map((interest, idx) => {
                        const colors = getInterestColor(idx);
                        return (
                          <span
                            key={idx}
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "12px",
                              backgroundColor: colors.bg,
                              color: colors.text,
                              fontSize: "0.875rem",
                              fontWeight: "500",
                            }}
                          >
                            {interest}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
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
