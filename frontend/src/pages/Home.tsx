import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { BottomNav } from "../components/BottomNav";
import { AppSidebar } from "../components/AppSidebar";
import { CitySearchBar } from "../components/CitySearchBar";
import { FilterModal } from "../components/FilterModal";
import { ProfileModal } from "../components/ProfileModal";
import type { FilterValues } from "../components/AdvancedFilterSearch";
import { useAuth } from "../context/useAuth";
import { useTripVacanciesApi } from "../hooks/useTripVacanciesApi";
import { profilesApi } from "../api/profilesApi";
import { offersApi } from "../api/offersApi";
import type { TripVacancyResponse } from "../types/tripRequest";
import type { ProfileDetailResponse } from "../types/profile";
import type { OfferResponse } from "../types/offer";

function formatDate(s: string | undefined): string {
  if (!s) return "\u2014";
  const d = new Date(s);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatVacancyDestination(vacancy: TripVacancyResponse): string {
  const parts = [
    vacancy?.destination_city,
    vacancy?.destination_country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "\u2014";
}

function formatVacancyBudget(vacancy: TripVacancyResponse): string {
  const min = vacancy?.min_budget ? Number(vacancy.min_budget) : null;
  const max = vacancy?.max_budget ? Number(vacancy.max_budget) : null;
  if (min && max) return `${min.toLocaleString()} \u2013 ${max.toLocaleString()} KZT`;
  if (min) return `From ${min.toLocaleString()} KZT`;
  if (max) return `Up to ${max.toLocaleString()} KZT`;
  return "\u2014";
}

interface VacancyWithMatch extends TripVacancyResponse {
  isApproximateMatch?: boolean;
  matchScore?: number;
}

// SVG icons for vacancy card meta rows
const CalendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const WalletIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const UsersIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export function Home() {
  const navigate = useNavigate();
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth();
  const { getAllVacancies } = useTripVacanciesApi();

  const [vacancies, setVacancies] = useState<TripVacancyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [myOffers, setMyOffers] = useState<OfferResponse[]>([]);

  const [searchCity, setSearchCity] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    mustHave: {},
    niceToHave: {},
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileDetailResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadVacancies = () => {
    setLoading(true);
    setError(null);

    const apiFilters: {
      destination_city?: string | null;
      destination_country?: string | null;
      min_age?: number | null;
      max_age?: number | null;
      min_budget?: number | null;
      max_budget?: number | null;
      gender_preference?: string | null;
      from_city?: string | null;
      from_country?: string | null;
    } = {};

    if (searchCity.trim()) {
      apiFilters.destination_city = searchCity.trim();
    }
    if (filters.mustHave.ageMin !== undefined) apiFilters.min_age = filters.mustHave.ageMin;
    if (filters.mustHave.ageMax !== undefined) apiFilters.max_age = filters.mustHave.ageMax;
    if (filters.mustHave.budgetMin !== undefined) apiFilters.min_budget = filters.mustHave.budgetMin;
    if (filters.mustHave.budgetMax !== undefined) apiFilters.max_budget = filters.mustHave.budgetMax;
    if (filters.mustHave.gender && filters.mustHave.gender.trim() !== "") {
      apiFilters.gender_preference = filters.mustHave.gender;
    }
    if (filters.mustHave.fromCity) apiFilters.from_city = filters.mustHave.fromCity;
    if (filters.mustHave.fromCountry) apiFilters.from_country = filters.mustHave.fromCountry;
    if (filters.mustHave.toCountry) apiFilters.destination_country = filters.mustHave.toCountry;

    getAllVacancies(Object.keys(apiFilters).length > 0 ? apiFilters : undefined)
      .then((data) => {
        setVacancies(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e?.message ?? "Failed to load vacancies"))
      .finally(() => setLoading(false));
  };

  const loadMyOffers = async () => {
    try {
      const offers = await offersApi.getMyOffers();
      setMyOffers(offers);
    } catch (e) {
      console.error("Failed to load offers:", e);
    }
  };

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) {
      setLoading(false);
      return;
    }
    loadVacancies();
    loadMyOffers();
  }, [isReady, accessToken, refreshToken]);

  const handleSearch = () => {
    if (isReady && (accessToken || refreshToken)) {
      loadVacancies();
    }
  };

  const clearAllFilters = () => {
    setFilters({ mustHave: {}, niceToHave: {} });
  };

  const hasActiveFilters = () => {
    const { mustHave } = filters;
    return (
      !!mustHave.ageMin ||
      !!mustHave.ageMax ||
      !!mustHave.budgetMin ||
      !!mustHave.budgetMax ||
      !!mustHave.toCity ||
      !!mustHave.toCountry ||
      !!mustHave.fromCity ||
      !!mustHave.fromCountry ||
      (!!mustHave.gender && mustHave.gender.trim() !== "")
    );
  };

  const filteredVacancies = useMemo((): VacancyWithMatch[] => {
    return vacancies.map((v) => ({ ...v }));
  }, [vacancies]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleViewProfile = async (
    requesterId: number,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsProfileModalOpen(true);
    setProfileLoading(true);
    setProfileError(null);
    setSelectedProfile(null);

    try {
      const profile = await profilesApi.getProfile(requesterId);
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span>TripMate</span>
          </div>
          <div className="app-header-right">
            <ThemeToggle />
            <NotificationButton />
          </div>
        </header>

        <main className="app-content" style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="page-header">
            <h1 className="page-title">Trip Vacancies</h1>
            <p className="page-subtitle">Browse all available trip vacancies</p>
          </div>

          <CitySearchBar
            searchCity={searchCity}
            onSearchCityChange={setSearchCity}
            onOpenFilters={() => setIsFilterModalOpen(true)}
            onSearch={handleSearch}
            hasActiveFilters={hasActiveFilters()}
          />

          {error && (
            <div className="error-banner" role="alert">{error}</div>
          )}

          {loading ? (
            <div className="vacancy-grid">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="trip-card-skeleton"
                  style={{ minWidth: "unset", height: 200 }}
                />
              ))}
            </div>
          ) : vacancies.length === 0 ? (
            <div className="empty-state">
              <p>No trip vacancies yet.</p>
            </div>
          ) : filteredVacancies.length === 0 ? (
            <div className="empty-state">
              <p>No vacancies match your search. Try a different term or clear filters.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearAllFilters}
                style={{ width: "auto", padding: "10px 22px" }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="vacancy-grid">
              {filteredVacancies.map((v) => (
                <div key={v.id} className="vacancy-card">
                  <div className="vacancy-card-gradient" />
                  <div className="vacancy-card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <h3 className="vacancy-card-destination">
                        {formatVacancyDestination(v)}
                      </h3>
                      <button
                        onClick={(e) => handleViewProfile(v.requester_id, e)}
                        type="button"
                        className="vacancy-card-profile-btn"
                      >
                        View Profile
                      </button>
                    </div>

                    <Link to={`/requests/${v.id}`} className="vacancy-card-link">
                      <div className="vacancy-card-meta">
                        <div className="vacancy-card-meta-row">
                          {CalendarIcon}
                          <span>
                            {formatDate(v.start_date)} &mdash; {formatDate(v.end_date)}
                          </span>
                        </div>
                        <div className="vacancy-card-meta-row">
                          {WalletIcon}
                          <span>{formatVacancyBudget(v)}</span>
                        </div>
                        <div className="vacancy-card-meta-row">
                          {UsersIcon}
                          <span>
                            <strong>{v.people_needed}</strong> {v.people_needed === 1 ? "person" : "people"} needed
                          </span>
                        </div>
                      </div>

                      {v.description && (
                        <p className="vacancy-card-description">{v.description}</p>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="app-footer">
          &copy; 2026 TripMate. Travel together, explore forever.
        </footer>
      </div>

      <BottomNav />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClear={clearAllFilters}
        onApply={handleSearch}
      />

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
