import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { CitySearchBar } from "../components/CitySearchBar";
import { FilterModal } from "../components/FilterModal";
import type { FilterValues } from "../components/AdvancedFilterSearch";
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

function formatGender(genders: string[] | undefined): string {
  if (!genders || genders.length === 0) return "Any";
  return genders.join(", ");
}

function formatInterests(interests: string[] | undefined): string {
  if (!interests || interests.length === 0) return "None";
  return interests.join(", ");
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

interface RequestWithMatch extends TripRequestResponse {
  isApproximateMatch?: boolean;
  matchScore?: number;
}

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth();
  const { getAllRequests } = useTripRequestsApi();

  const [requests, setRequests] = useState<TripRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [searchCity, setSearchCity] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    mustHave: {},
    niceToHave: {},
  });

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

  const clearAllFilters = () => {
    setFilters({
      mustHave: {},
      niceToHave: {},
    });
  };

  const hasActiveFilters = () => {
    const { mustHave, niceToHave } = filters;
    return (
      !!mustHave.ageMin ||
      !!mustHave.ageMax ||
      !!mustHave.budgetMin ||
      !!mustHave.budgetMax ||
      !!mustHave.fromCity ||
      !!mustHave.fromCountry ||
      (mustHave.requiredInterests && mustHave.requiredInterests.length > 0) ||
      (niceToHave.preferredInterests &&
        niceToHave.preferredInterests.length > 0) ||
      !!niceToHave.approximateBudget ||
      !!niceToHave.flexibleAge
    );
  };

  const filteredRequests = useMemo((): RequestWithMatch[] => {
    let list: RequestWithMatch[] = requests.map((r) => ({ ...r }));

    // PRIMARY FILTER: Search City (Destination) - Required field
    if (searchCity.trim()) {
      list = list.filter((req) => {
        const reqCity = req.destination?.city?.toLowerCase();
        return reqCity && reqCity.includes(searchCity.toLowerCase());
      });
    }

    const { mustHave, niceToHave } = filters;

    // MUST HAVE FILTERS - Hard requirements (exclude if not met)
    list = list.filter((req) => {
      // Age filter (would need user age data from request creator)
      // For now, checking if preferences exist
      if (mustHave.ageMin !== undefined || mustHave.ageMax !== undefined) {
        const reqAgeMin = req.preferences?.mustHave?.ageRange?.min;
        const reqAgeMax = req.preferences?.mustHave?.ageRange?.max;

        if (mustHave.ageMin !== undefined && reqAgeMax !== undefined) {
          if (reqAgeMax < mustHave.ageMin) return false;
        }
        if (mustHave.ageMax !== undefined && reqAgeMin !== undefined) {
          if (reqAgeMin > mustHave.ageMax) return false;
        }
      }

      // Budget filter
      if (
        mustHave.budgetMin !== undefined ||
        mustHave.budgetMax !== undefined
      ) {
        const reqBudget = req.budget?.amount;
        if (reqBudget !== undefined) {
          if (
            mustHave.budgetMin !== undefined &&
            reqBudget < mustHave.budgetMin
          ) {
            return false;
          }
          if (
            mustHave.budgetMax !== undefined &&
            reqBudget > mustHave.budgetMax
          ) {
            return false;
          }
        }
      }

      // From City filter
      if (mustHave.fromCity) {
        const reqCity = req.destination?.city?.toLowerCase();
        if (!reqCity || !reqCity.includes(mustHave.fromCity.toLowerCase())) {
          return false;
        }
      }

      // From Country filter
      if (mustHave.fromCountry) {
        const reqCountry = req.destination?.country?.toLowerCase();
        if (
          !reqCountry ||
          !reqCountry.includes(mustHave.fromCountry.toLowerCase())
        ) {
          return false;
        }
      }

      // Required interests (all must match)
      // Note: This would require user interests data from the request creator's profile
      // For now, this is a placeholder implementation
      if (mustHave.requiredInterests && mustHave.requiredInterests.length > 0) {
        // In a real implementation, you'd check against user's interests
        // For demonstration, we assume all required interests must be mentioned somewhere
      }

      return true;
    });

    // NICE TO HAVE FILTERS - Soft preferences (mark as approximate if not perfect match)
    list = list.map((req) => {
      let matchScore = 100; // Perfect match
      let isApproximate = false;

      // Flexible age check
      if (niceToHave.flexibleAge && (mustHave.ageMin || mustHave.ageMax)) {
        const reqAgeMin = req.preferences?.mustHave?.ageRange?.min;
        const reqAgeMax = req.preferences?.mustHave?.ageRange?.max;

        if (reqAgeMin !== undefined && mustHave.ageMax !== undefined) {
          const ageDiff = Math.abs(reqAgeMin - mustHave.ageMax);
          if (ageDiff > 5) {
            matchScore -= 10;
            isApproximate = true;
          }
        }
        if (reqAgeMax !== undefined && mustHave.ageMin !== undefined) {
          const ageDiff = Math.abs(reqAgeMax - mustHave.ageMin);
          if (ageDiff > 5) {
            matchScore -= 10;
            isApproximate = true;
          }
        }
      }

      // Approximate budget check
      if (
        niceToHave.approximateBudget &&
        (mustHave.budgetMin || mustHave.budgetMax)
      ) {
        const reqBudget = req.budget?.amount;
        if (
          reqBudget !== undefined &&
          (mustHave.budgetMin || mustHave.budgetMax)
        ) {
          const midpoint =
            ((mustHave.budgetMin || 0) + (mustHave.budgetMax || reqBudget)) / 2;
          const diff = Math.abs(reqBudget - midpoint) / midpoint;
          if (diff > 0.2) {
            matchScore -= 15;
            isApproximate = true;
          }
        }
      }

      // Preferred interests (some match is good)
      if (
        niceToHave.preferredInterests &&
        niceToHave.preferredInterests.length > 0
      ) {
        // In real implementation, check intersection with user's interests
        // For now, just mark as approximate if preferences exist
        isApproximate = true;
        matchScore -= 5;
      }

      return {
        ...req,
        isApproximateMatch: isApproximate,
        matchScore,
      };
    });

    // Sort by match score (best matches first)
    list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return list;
  }, [requests, filters, searchCity]);

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

          <CitySearchBar
            searchCity={searchCity}
            onSearchCityChange={setSearchCity}
            onOpenFilters={() => setIsFilterModalOpen(true)}
            hasActiveFilters={hasActiveFilters()}
          />

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
                        margin: "0 0 12px",
                      }}
                    >
                      {formatDestination(r.destination)}
                    </h3>

                    <div style={{ marginBottom: 12 }}>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-muted)",
                          margin: "0 0 4px",
                          fontWeight: 500,
                        }}
                      >
                        <strong style={{ color: "var(--text)" }}>Dates:</strong>{" "}
                        {formatDate(r.startDate)} — {formatDate(r.endDate)}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-muted)",
                          margin: "0 0 4px",
                          fontWeight: 500,
                        }}
                      >
                        <strong style={{ color: "var(--text)" }}>
                          Budget:
                        </strong>{" "}
                        {formatBudget(r.budget)}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-muted)",
                          margin: 0,
                          fontWeight: 500,
                        }}
                      >
                        <strong style={{ color: "var(--text)" }}>
                          Created:
                        </strong>{" "}
                        {formatDate(r.createdAt)}
                      </p>
                    </div>

                    {r.interests && r.interests.length > 0 && (
                      <div
                        style={{
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "var(--primary)",
                            margin: "0 0 8px",
                          }}
                        >
                          Interests
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          {r.interests.slice(0, 6).map((interest, idx) => {
                            const color = getInterestColor(idx);
                            return (
                              <span
                                key={idx}
                                style={{
                                  display: "inline-block",
                                  padding: "4px 12px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  borderRadius: 100,
                                  background: color.bg,
                                  color: color.text,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {interest}
                              </span>
                            );
                          })}
                          {r.interests.length > 6 && (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                              }}
                            >
                              +{r.interests.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {r.isApproximateMatch && (
                      <div style={{ marginTop: 8 }}>
                        <span className="match-indicator">
                          <svg
                            className="match-indicator-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          Approx Match
                        </span>
                      </div>
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

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClear={clearAllFilters}
      />
    </>
  );
}
