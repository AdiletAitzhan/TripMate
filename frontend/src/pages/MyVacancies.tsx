import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { BottomNav } from "../components/BottomNav";
import { ProfileModal } from "../components/ProfileModal";
import { useAuth } from "../context/useAuth";
import { useTripVacanciesApi } from "../hooks/useTripVacanciesApi";
import { offersApi } from "../api/offersApi";
import { profilesApi } from "../api/profilesApi";
import type { TripVacancyResponse } from "../types/tripRequest";
import type { OfferResponse } from "../types/offer";
import type { ProfileDetailResponse } from "../types/profile";

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
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth();
  const { getMyVacancies } = useTripVacanciesApi();

  const [vacancies, setVacancies] = useState<TripVacancyResponse[]>([]);
  const [vacancyOffers, setVacancyOffers] = useState<
    Map<number, OfferResponse[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileDetailResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

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
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          onLogout={handleLogout}
        />

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

      <BottomNav />

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
