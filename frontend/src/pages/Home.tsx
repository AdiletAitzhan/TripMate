import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
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

function formatDestination(dest: TripRequestResponse["destination"]): string {
  const parts = [dest?.city, dest?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function formatBudget(budget: TripRequestResponse["budget"]): string {
  if (!budget?.amount) return "—";
  const curr = budget.currency ?? "USD";
  return `${budget.amount} ${curr}`;
}

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth();
  const { getAllRequests } = useTripRequestsApi();

  const [requests, setRequests] = useState<TripRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destinationSearch, setDestinationSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const loadRequests = () => {
    setLoading(true);
    setError(null);
    getAllRequests()
      .then((res) => {
        const data = res.data;
        setRequests(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e?.message ?? "Failed to load requests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) {
      setLoading(false);
      return;
    }
    loadRequests();
  }, [isReady, accessToken, refreshToken]);

  const clearFilters = () => setDestinationSearch("");
  const hasActiveFilters = !!destinationSearch.trim();

  const filteredRequests = useMemo(() => {
    let list = requests;

    if (destinationSearch.trim()) {
      const q = destinationSearch.trim().toLowerCase();
      list = list.filter((r) => {
        const dest = formatDestination(r.destination).toLowerCase();
        return dest.includes(q);
      });
    }

    return list;
  }, [requests, destinationSearch]);

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
              className={`sidebar-link ${location.pathname === "/requests" ? "active" : ""}`}
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
              Trip Requests
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Browse all available trip requests
            </p>
          </div>

          <section
            aria-label="Filters"
            style={{
              marginBottom: 24,
              padding: "16px 20px",
              background: "var(--card-bg)",
              borderRadius: 12,
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <label
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                Search destination
              </label>
              <input
                type="search"
                className="input-field"
                placeholder="City or country…"
                value={destinationSearch}
                onChange={(e) => setDestinationSearch(e.target.value)}
                style={{ width: "auto", minWidth: 160 }}
                aria-label="Search by destination"
              />
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearFilters}
                  style={{ marginLeft: "auto", padding: "8px 16px" }}
                >
                  Clear
                </button>
              )}
            </div>
          </section>

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
          ) : requests.length === 0 ? (
            <div
              className="card-premium"
              style={{
                padding: 48,
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text-muted)" }}>
                No trip requests yet.
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div
              className="card-premium"
              style={{
                padding: 48,
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                No requests match your destination search. Try a different term
                or clear filters.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearFilters}
                style={{ width: "auto", padding: "12px 24px" }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 24,
              }}
            >
              {filteredRequests.map((r) => (
                <Link
                  key={r.id}
                  to={`/requests/${r.id}`}
                  className="card-premium"
                  style={{
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        margin: "0 0 8px",
                      }}
                    >
                      {formatDestination(r.destination)}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        margin: "0 0 4px",
                      }}
                    >
                      {formatDate(r.startDate)} — {formatDate(r.endDate)}
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      Budget: {formatBudget(r.budget)}
                    </p>
                    {r.status && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 8,
                          padding: "4px 10px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          borderRadius: 999,
                          background: "var(--accent-light)",
                          color: "var(--accent)",
                        }}
                      >
                        {r.status}
                      </span>
                    )}
                    {r.matchCount != null && r.matchCount > 0 && (
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--status-success)",
                          margin: "4px 0 0",
                        }}
                      >
                        {r.matchCount} match{r.matchCount !== 1 ? "es" : ""}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
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
