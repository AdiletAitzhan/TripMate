import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { CitySearchBar } from "../components/CitySearchBar";
import { FilterModal } from "../components/FilterModal";
import type { FilterValues } from "../components/AdvancedFilterSearch";
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

interface VacancyWithMatch extends TripVacancyResponse {
  isApproximateMatch?: boolean;
  matchScore?: number;
}

export function Requests() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth();
  const { getAllVacancies } = useTripVacanciesApi();

  const [vacancies, setVacancies] = useState<TripVacancyResponse[]>([]);
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

  const loadVacancies = () => {
    setLoading(true);
    setError(null);
    getAllVacancies()
      .then((data) => {
        setVacancies(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e?.message ?? "Failed to load vacancies"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) {
      setLoading(false);
      return;
    }
    loadVacancies();
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

  const filteredVacancies = useMemo((): VacancyWithMatch[] => {
    let list: VacancyWithMatch[] = vacancies.map((v) => ({ ...v }));

    // PRIMARY FILTER: Search City (Destination)
    if (searchCity.trim()) {
      list = list.filter((vacancy) => {
        const vacancyCity = vacancy.destination_city?.toLowerCase();
        return vacancyCity && vacancyCity.includes(searchCity.toLowerCase());
      });
    }

    const { mustHave } = filters;

    // MUST HAVE FILTERS - Hard requirements (exclude if not met)
    list = list.filter((vacancy) => {
      // Age filter
      if (mustHave.ageMin !== undefined || mustHave.ageMax !== undefined) {
        const vacancyAgeMin = vacancy.min_age;
        const vacancyAgeMax = vacancy.max_age;

        if (
          mustHave.ageMin !== undefined &&
          vacancyAgeMax !== undefined &&
          vacancyAgeMax !== null
        ) {
          if (vacancyAgeMax < mustHave.ageMin) return false;
        }
        if (
          mustHave.ageMax !== undefined &&
          vacancyAgeMin !== undefined &&
          vacancyAgeMin !== null
        ) {
          if (vacancyAgeMin > mustHave.ageMax) return false;
        }
      }

      // Budget filter
      if (
        mustHave.budgetMin !== undefined ||
        mustHave.budgetMax !== undefined
      ) {
        const vacancyMaxBudget = vacancy.max_budget;
        if (vacancyMaxBudget !== undefined) {
          if (
            mustHave.budgetMin !== undefined &&
            vacancyMaxBudget < mustHave.budgetMin
          ) {
            return false;
          }
          if (
            mustHave.budgetMax !== undefined &&
            vacancyMaxBudget > mustHave.budgetMax
          ) {
            return false;
          }
        }
      }

      return true;
    });

    return list;
  }, [vacancies, filters, searchCity]);

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
              Trip Vacancies
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Browse all trip vacancies
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
          ) : vacancies.length === 0 ? (
            <div
              className="card-premium"
              style={{
                padding: 48,
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text-muted)" }}>
                No trip vacancies yet.
              </p>
            </div>
          ) : filteredVacancies.length === 0 ? (
            <div
              className="card-premium"
              style={{
                padding: 48,
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                No vacancies match your destination search. Try a different term
                or clear filters.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearAllFilters}
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
              {filteredVacancies.map((v) => (
                <Link
                  key={v.id}
                  to={`/requests/${v.id}`}
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
                      {formatVacancyDestination(v)}
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
                        {formatDate(v.start_date)} — {formatDate(v.end_date)}
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
                        {formatVacancyBudget(v)}
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
                          People needed:
                        </strong>{" "}
                        {v.people_needed}
                      </p>
                    </div>

                    {v.description && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-muted)",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {v.description}
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
