import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { ProfileModal } from "../components/ProfileModal";
import { useAuth } from "../context/useAuth";
import { useTripVacanciesApi } from "../hooks/useTripVacanciesApi";
import { useTripPlansApi } from "../hooks/useTripPlansApi";
import { offersApi } from "../api/offersApi";
import { profilesApi } from "../api/profilesApi";
import { ApiRequestError } from "../api/tripPlansApi";
import { RecommendedPlacesList } from "../components/RecommendedPlacesList";
import type { TripVacancyResponse } from "../types/tripRequest";
import type { OfferResponse } from "../types/offer";
import type { ProfileDetailResponse } from "../types/profile";
import type { TripPlanResponse } from "../types/tripPlan";

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

export function MyVacancies() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth, isReady, accessToken, refreshToken, user } = useAuth();
  const { getMyVacancies } = useTripVacanciesApi();
  const { generatePlan, getTripPlanByTripVacancyId } = useTripPlansApi();

  const [vacancies, setVacancies] = useState<TripVacancyResponse[]>([]);
  const [vacancyOffers, setVacancyOffers] = useState<
    Map<number, OfferResponse[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileDetailResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [tripPlansByVacancyId, setTripPlansByVacancyId] = useState<
    Map<number, TripPlanResponse>
  >(new Map());
  const [recommendationsLoadingByVacancyId, setRecommendationsLoadingByVacancyId] =
    useState<Map<number, boolean>>(new Map());
  const [recommendationsErrorByVacancyId, setRecommendationsErrorByVacancyId] =
    useState<Map<number, string>>(new Map());

  const setRecommendationsLoading = (vacancyId: number, value: boolean) => {
    setRecommendationsLoadingByVacancyId((prev) => {
      const next = new Map(prev);
      next.set(vacancyId, value);
      return next;
    });
  };

  const setRecommendationsError = (
    vacancyId: number,
    value: string | null,
  ) => {
    setRecommendationsErrorByVacancyId((prev) => {
      const next = new Map(prev);
      if (value) next.set(vacancyId, value);
      else next.delete(vacancyId);
      return next;
    });
  };

  const setTripPlan = (vacancyId: number, plan: TripPlanResponse | null) => {
    setTripPlansByVacancyId((prev) => {
      const next = new Map(prev);
      if (plan) next.set(vacancyId, plan);
      else next.delete(vacancyId);
      return next;
    });
  };

  const loadVacanciesAndOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyVacancies();
      setVacancies(Array.isArray(data) ? data : []);

      // Load offers for each vacancy
      const offersMap = new Map<number, OfferResponse[]>();
      for (const vacancy of data) {
        try {
          const offers = await offersApi.getOffersForVacancy(vacancy.id);
          offersMap.set(vacancy.id, offers);
        } catch (e) {
          console.error("Failed to load offers for vacancy", e);
          offersMap.set(vacancy.id, []);
        }
      }
      setVacancyOffers(offersMap);
    } catch (e) {
      setError((e as Error)?.message ?? "Failed to load vacancies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) {
      setLoading(false);
      return;
    }
    loadVacanciesAndOffers();
  }, [isReady, accessToken, refreshToken]);

  // Clear recommendation cache when vacancy list changes.
  useEffect(() => {
    setTripPlansByVacancyId(new Map());
    setRecommendationsLoadingByVacancyId(new Map());
    setRecommendationsErrorByVacancyId(new Map());
  }, [vacancies.length]);

  // Preload already generated plans so recommendations appear without
  // needing to click "Generate".
  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) return;
    if (!user?.id) return;
    if (!vacancies.length) return;

    let cancelled = false;

    const loadExistingPlans = async () => {
      for (const v of vacancies) {
        if (cancelled) return;
        if (String(v.requester_id) !== String(user.id)) continue;
        try {
          const plan = await getTripPlanByTripVacancyId(v.id);
          if (cancelled) return;
          setTripPlan(v.id, plan);
        } catch (e) {
          const err = e as ApiRequestError;
          if (
            err instanceof ApiRequestError &&
            (err.status === 400 || err.status === 404)
          ) {
            continue;
          }
          if (cancelled) return;
          setRecommendationsError(
            v.id,
            err?.message ?? "Failed to load recommendations",
          );
        }
      }
    };

    loadExistingPlans();

    return () => {
      cancelled = true;
    };
  }, [
    isReady,
    accessToken,
    refreshToken,
    user?.id,
    vacancies,
    getTripPlanByTripVacancyId,
  ]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const canGenerateTripPlanForVacancy = (v: TripVacancyResponse) => {
    if (!user?.id) return false;
    return String(user.id) === String(v.requester_id);
  };

  const handleGenerateRecommendationsForVacancy = async (
    v: TripVacancyResponse,
  ) => {
    const vacancyId = v.id;
    if (!canGenerateTripPlanForVacancy(v)) return;
    if (recommendationsLoadingByVacancyId.get(vacancyId)) return;

    setRecommendationsLoading(vacancyId, true);
    setRecommendationsError(vacancyId, null);

    try {
      await generatePlan(vacancyId);

      // Poll until backend returns trip plan with recommended places.
      const maxAttempts = 18; // ~36s total
      const delayMs = 2000;
      let lastError: unknown = null;

      for (let i = 0; i < maxAttempts; i++) {
        try {
          const plan = await getTripPlanByTripVacancyId(vacancyId);
          setTripPlan(vacancyId, plan);
          return;
        } catch (e) {
          lastError = e;
          const err = e as ApiRequestError;
          if (err instanceof ApiRequestError && err.status === 401)
            throw e;
          if (i < maxAttempts - 1) await sleep(delayMs);
        }
      }

      const err = lastError as ApiRequestError | undefined;
      setTripPlan(vacancyId, null);
      setRecommendationsError(
        err?.message ?? "Recommendations were not ready in time.",
      );
    } catch (e) {
      const err = e as ApiRequestError;
      setTripPlan(vacancyId, null);
      setRecommendationsError(
        err?.message ?? "Failed to generate recommendations",
      );
    } finally {
      setRecommendationsLoading(vacancyId, false);
    }
  };

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

  const handleViewProfile = async (offererId: number) => {
    setIsProfileModalOpen(true);
    setProfileLoading(true);
    setProfileError(null);
    setSelectedProfile(null);

    try {
      const profile = await profilesApi.getProfile(offererId);
      setSelectedProfile(profile);
    } catch (error) {
      setProfileError((error as Error).message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedProfile(null);
    setProfileError(null);
  };

  const handleAcceptOffer = async (offerId: number) => {
    if (!confirm("Are you sure you want to accept this offer?")) return;

    try {
      await offersApi.updateStatus(offerId, "accepted");
      loadVacanciesAndOffers();
    } catch (e) {
      alert((e as Error)?.message ?? "Failed to accept offer");
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    if (!confirm("Are you sure you want to reject this offer?")) return;

    try {
      await offersApi.updateStatus(offerId, "rejected");
      loadVacanciesAndOffers();
    } catch (e) {
      alert((e as Error)?.message ?? "Failed to reject offer");
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

        <main
          className="app-content"
          style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}
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
              My Vacancies
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Manage your trip vacancies and review offers
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
          ) : vacancies.length === 0 ? (
            <div
              className="card-premium"
              style={{
                padding: 48,
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                You haven't created any trip vacancies yet.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              {vacancies.map((vacancy) => {
                const offers = vacancyOffers.get(vacancy.id) || [];
                const pendingOffers = offers.filter(
                  (o) => o.status === "pending",
                );

                return (
                  <div
                    key={vacancy.id}
                    className="card-premium"
                    style={{
                      padding: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                        paddingBottom: 16,
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: 600,
                            color: "var(--text)",
                            margin: "0 0 8px",
                          }}
                        >
                          {vacancy.destination_city},{" "}
                          {vacancy.destination_country}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-muted)",
                            margin: "0 0 8px",
                          }}
                        >
                          {formatDate(vacancy.start_date)} —{" "}
                          {formatDate(vacancy.end_date)}
                        </p>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-muted)",
                            margin: 0,
                          }}
                        >
                          People needed: {vacancy.people_needed}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          alignItems: "flex-end",
                        }}
                      >
                        <span
                          style={{
                            padding: "6px 16px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            borderRadius: 999,
                            background: "var(--accent-light)",
                            color: "var(--accent)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {offers.length} offer{offers.length !== 1 ? "s" : ""}
                        </span>
                        {pendingOffers.length > 0 && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {pendingOffers.length} pending
                          </span>
                        )}
                      </div>
                    </div>

                    {offers.length === 0 ? (
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.875rem",
                          margin: 0,
                          textAlign: "center",
                          padding: "16px 0",
                        }}
                      >
                        No offers received yet
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        {offers.map((offer) => {
                          const statusColors = getStatusColor(offer.status);

                          return (
                            <div
                              key={offer.id}
                              style={{
                                padding: 16,
                                background: "var(--bg-elevated)",
                                borderRadius: 8,
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: 16,
                                  marginBottom: 12,
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <p
                                    style={{
                                      fontSize: "0.875rem",
                                      color: "var(--text-muted)",
                                      margin: "0 0 4px",
                                    }}
                                  >
                                    Received on {formatDate(offer.created_at)}
                                  </p>
                                </div>
                                <span
                                  style={{
                                    padding: "4px 12px",
                                    fontSize: "0.6875rem",
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
                                <div style={{ marginBottom: 12 }}>
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
                                    Message
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "0.875rem",
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
                                <div style={{ marginBottom: 12 }}>
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
                                      fontSize: "0.875rem",
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
                                  gap: 8,
                                  paddingTop: 12,
                                  borderTop: "1px solid var(--border)",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    handleViewProfile(offer.offerer_id)
                                  }
                                  className="btn btn-secondary"
                                  style={{
                                    padding: "8px 16px",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  View Profile
                                </button>
                                {offer.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleAcceptOffer(offer.id)
                                      }
                                      className="btn btn-primary"
                                      style={{
                                        padding: "8px 16px",
                                        fontSize: "0.875rem",
                                      }}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejectOffer(offer.id)
                                      }
                                      className="btn btn-secondary"
                                      style={{
                                        padding: "8px 16px",
                                        fontSize: "0.875rem",
                                        color: "var(--status-error)",
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Recommendations */}
                    <div style={{ marginTop: 16 }}>
                      {!tripPlansByVacancyId.get(vacancy.id) && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            opacity: canGenerateTripPlanForVacancy(vacancy)
                              ? 1
                              : 0.6,
                          }}
                          disabled={
                            !canGenerateTripPlanForVacancy(vacancy) ||
                            recommendationsLoadingByVacancyId.get(vacancy.id) ===
                              true
                          }
                          onClick={() =>
                            handleGenerateRecommendationsForVacancy(vacancy)
                          }
                        >
                          {recommendationsLoadingByVacancyId.get(vacancy.id)
                            ? "Generating…"
                            : "Generate recommendations"}
                        </button>
                      )}

                      {recommendationsErrorByVacancyId.get(vacancy.id) && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: 12,
                            background: "var(--status-error-bg)",
                            border: "1px solid var(--status-error-border)",
                            borderRadius: 8,
                          }}
                          role="alert"
                        >
                          <p style={{ margin: 0, color: "var(--status-error)" }}>
                            {recommendationsErrorByVacancyId.get(vacancy.id)}
                          </p>
                        </div>
                      )}

                      {tripPlansByVacancyId.get(vacancy.id) && (
                        <div style={{ marginTop: 16 }}>
                          <RecommendedPlacesList
                            places={
                              tripPlansByVacancyId.get(vacancy.id)
                                ?.recommended_places || []
                            }
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/requests/${vacancy.id}`)}
                      className="btn btn-secondary"
                      style={{
                        padding: "10px 20px",
                        fontSize: "0.875rem",
                        width: "auto",
                        alignSelf: "flex-start",
                      }}
                    >
                      View Vacancy Details
                    </button>
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

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        profile={selectedProfile}
        loading={profileLoading}
        error={profileError}
      />
    </>
  );
}
