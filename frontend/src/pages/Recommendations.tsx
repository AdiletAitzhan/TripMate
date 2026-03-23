import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { RecommendedPlacesList } from "../components/RecommendedPlacesList";
import { useAuth } from "../context/useAuth";
import { useTripVacanciesApi } from "../hooks/useTripVacanciesApi";
import { useTripPlansApi } from "../hooks/useTripPlansApi";
import { ApiRequestError } from "../api/tripPlansApi";
import type { TripVacancyResponse } from "../types/tripRequest";
import type { TripPlanResponse } from "../types/tripPlan";

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Recommendations() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth, isReady, accessToken, refreshToken, user } = useAuth();
  const { getMyVacancies } = useTripVacanciesApi();
  const { generatePlan, getTripPlanByTripVacancyId } = useTripPlansApi();

  const [vacancies, setVacancies] = useState<TripVacancyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [tripPlansByVacancyId, setTripPlansByVacancyId] = useState<
    Map<number, TripPlanResponse>
  >(new Map());
  const [loadingByVacancyId, setLoadingByVacancyId] = useState<
    Map<number, boolean>
  >(new Map());
  const [errorByVacancyId, setErrorByVacancyId] = useState<
    Map<number, string>
  >(new Map());

  const setPlanLoading = (id: number, v: boolean) =>
    setLoadingByVacancyId((p) => new Map(p).set(id, v));

  const setPlanError = (id: number, v: string | null) =>
    setErrorByVacancyId((p) => {
      const next = new Map(p);
      v ? next.set(id, v) : next.delete(id);
      return next;
    });

  const setTripPlan = (id: number, plan: TripPlanResponse | null) =>
    setTripPlansByVacancyId((p) => {
      const next = new Map(p);
      plan ? next.set(id, plan) : next.delete(id);
      return next;
    });

  // Load vacancies
  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await getMyVacancies();
        setVacancies(Array.isArray(data) ? data : []);
      } catch (e) {
        setError((e as Error)?.message ?? "Failed to load vacancies");
      } finally {
        setLoading(false);
      }
    })();
  }, [isReady, accessToken, refreshToken]);

  // Auto-load existing plans
  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) return;
    if (!user?.id || !vacancies.length) return;

    let cancelled = false;
    (async () => {
      for (const v of vacancies) {
        if (cancelled) return;
        if (String(v.requester_id) !== String(user.id)) continue;
        try {
          const plan = await getTripPlanByTripVacancyId(v.id);
          if (!cancelled) setTripPlan(v.id, plan);
        } catch (e) {
          const err = e as ApiRequestError;
          if (
            err instanceof ApiRequestError &&
            (err.status === 400 || err.status === 404)
          )
            continue;
          if (!cancelled)
            setPlanError(v.id, err?.message ?? "Failed to load recommendations");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, accessToken, refreshToken, user?.id, vacancies]);

  const handleGenerate = async (v: TripVacancyResponse) => {
    if (loadingByVacancyId.get(v.id)) return;
    setPlanLoading(v.id, true);
    setPlanError(v.id, null);
    try {
      await generatePlan(v.id);
      const maxAttempts = 18;
      let lastErr: unknown = null;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const plan = await getTripPlanByTripVacancyId(v.id);
          setTripPlan(v.id, plan);
          return;
        } catch (e) {
          lastErr = e;
          const err = e as ApiRequestError;
          if (err instanceof ApiRequestError && err.status === 401) throw e;
          if (i < maxAttempts - 1) await sleep(2000);
        }
      }
      setTripPlan(v.id, null);
      setPlanError(
        v.id,
        (lastErr as ApiRequestError)?.message ??
          "Recommendations were not ready in time.",
      );
    } catch (e) {
      setTripPlan(v.id, null);
      setPlanError(
        v.id,
        (e as ApiRequestError)?.message ?? "Failed to generate recommendations",
      );
    } finally {
      setPlanLoading(v.id, false);
    }
  };

  // Sidebar close on outside click / escape
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      )
        setIsSidebarOpen(false);
    };
    if (isSidebarOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    if (isSidebarOpen) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isSidebarOpen]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
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
              to="/recommendations"
              className={`sidebar-link ${location.pathname === "/recommendations" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              Recommendations
            </Link>
            <Link
              to="/offers"
              className={`sidebar-link ${location.pathname === "/offers" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              My Offers
            </Link>
            <Link
              to="/chat"
              className={`sidebar-link ${location.pathname === "/chat" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              Messages
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

        <main className="app-content" style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
          <div className="recs-page-header">
            <h1 className="recs-page-title">Recommendations</h1>
            <p className="recs-page-subtitle">
              AI-generated place recommendations for each of your trip vacancies
            </p>
          </div>

          {error && (
            <p
              role="alert"
              style={{
                color: "var(--status-error)",
                padding: "12px 16px",
                background: "var(--status-error-bg)",
                borderRadius: 8,
                border: "1px solid var(--status-error-border)",
                marginBottom: 24,
              }}
            >
              {error}
            </p>
          )}

          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading…</p>
          ) : vacancies.length === 0 ? (
            <div
              className="card-premium"
              style={{ padding: 48, textAlign: "center" }}
            >
              <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                You haven't created any trip vacancies yet.
              </p>
              <Link to="/my-vacancies" className="btn btn-primary">
                Create a vacancy
              </Link>
            </div>
          ) : (
            <div className="recs-vacancy-list">
              {vacancies.map((vacancy) => {
                const plan = tripPlansByVacancyId.get(vacancy.id);
                const isLoading = loadingByVacancyId.get(vacancy.id) === true;
                const planError = errorByVacancyId.get(vacancy.id);
                const isOwner =
                  user?.id && String(user.id) === String(vacancy.requester_id);

                return (
                  <div
                    key={vacancy.id}
                    className={[
                      "card-premium",
                      "recs-vacancy-card",
                      isLoading && "recs-vacancy-card--loading",
                      plan && !isLoading && "recs-vacancy-card--has-plan",
                      planError && "recs-vacancy-card--error",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="recs-vacancy-header">
                      <div>
                        <h2 className="recs-vacancy-title">
                          {vacancy.destination_city}, {vacancy.destination_country}
                        </h2>
                        <p className="recs-vacancy-dates">
                          {formatDate(vacancy.start_date)} — {formatDate(vacancy.end_date)}
                        </p>
                      </div>
                      {isOwner && !plan && (
                        <button
                          type="button"
                          className="btn btn-primary recs-generate-btn"
                          disabled={isLoading}
                          onClick={() => handleGenerate(vacancy)}
                        >
                          {isLoading ? "Generating…" : "Generate"}
                        </button>
                      )}
                    </div>

                    {planError && (
                      <div className="recs-error" role="alert">
                        <p>{planError}</p>
                      </div>
                    )}

                    {isLoading && (
                      <div className="trips-skeleton-row">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="trip-card-skeleton recs-skeleton-card" />
                        ))}
                      </div>
                    )}

                    {plan && !isLoading && (
                      <RecommendedPlacesList places={plan.recommended_places || []} />
                    )}

                    {!plan && !isLoading && !planError && (
                      <p className="recs-empty-hint">
                        {isOwner
                          ? "Tap Generate to get AI-powered place recommendations."
                          : "No recommendations available yet."}
                      </p>
                    )}
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
