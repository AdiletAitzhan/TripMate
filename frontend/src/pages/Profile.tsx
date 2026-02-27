import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/useAuth";
import { useProfilesApi } from "../hooks/useProfilesApi";
import { useTripVacanciesApi } from "../hooks/useTripVacanciesApi";
import { CreateTripVacancyModal } from "../components/CreateTripVacancyModal";
import type {
  ProfileDetailResponse,
  LanguageResponse,
  InterestResponse,
  TravelStyleResponse,
} from "../types/profile";
import type {
  TripVacancyCreateRequest,
  TripVacancyResponse,
  TripVacancyUpdateRequest,
} from "../types/tripRequest";

const COUNTRIES = [
  "Kazakhstan",
  "Russia",
  "USA",
  "Germany",
  "France",
  "UK",
  "Other",
];
const TIMEZONES = ["UTC+05:00", "UTC+06:00", "UTC+03:00", "UTC+00:00"];
const PROFILE_GENDER_KEY = "tripmate_profile_gender";
const PROFILE_TIMEZONE_KEY = "tripmate_profile_timezone";

/** Подмена minio:9000 на localhost:9000, чтобы браузер мог загрузить фото (бэк отдаёт внутренний хост). */
function photoUrlForBrowser(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/http:\/\/minio:9000/, "http://localhost:9000");
}

function formatRequestDate(s: string | undefined): string {
  if (!s) return "—";
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
  return parts.length ? parts.join(", ") : "—";
}

function formatVacancyBudget(vacancy: TripVacancyResponse): string {
  const min = vacancy?.min_budget ? Number(vacancy.min_budget) : null;
  const max = vacancy?.max_budget ? Number(vacancy.max_budget) : null;
  if (min && max) return `${min} - ${max} KZT`;
  if (min) return `From ${min} KZT`;
  if (max) return `Up to ${max} KZT`;
  return "—";
}

export function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isReady, accessToken, refreshToken, clearAuth } = useAuth();
  const {
    getMyProfile,
    updateMyProfile,
    setLanguages,
    setInterests,
    setTravelStyles,
    getAllLanguages,
    getAllInterests,
    getAllTravelStyles,
  } = useProfilesApi();
  const [profile, setProfile] = useState<ProfileDetailResponse | null>(null);

  // Available options from backend
  const [availableLanguages, setAvailableLanguages] = useState<
    LanguageResponse[]
  >([]);
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponse[]
  >([]);
  const [availableTravelStyles, setAvailableTravelStyles] = useState<
    TravelStyleResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const photoHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [showPhotoHover, setShowPhotoHover] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [timeZone, setTimeZone] = useState("UTC+05:00");

  // Selected IDs for multi-select fields
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [selectedTravelStyleIds, setSelectedTravelStyleIds] = useState<
    number[]
  >([]);

  const { getMyVacancies, createVacancy, updateVacancy, deleteVacancy } =
    useTripVacanciesApi();
  const [myVacancies, setMyVacancies] = useState<TripVacancyResponse[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(false);
  const [vacancyError, setVacancyError] = useState<string | null>(null);
  const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] =
    useState<TripVacancyResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const photoDisplayUrl = photoUrlForBrowser(
    profile?.profile_photo_url ?? undefined,
  );

  // Close sidebar when clicking outside
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

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handlePhotoMouseEnter = () => {
    photoHoverTimeoutRef.current = setTimeout(
      () => setShowPhotoHover(true),
      500,
    );
  };
  const handlePhotoMouseLeave = () => {
    if (photoHoverTimeoutRef.current) {
      clearTimeout(photoHoverTimeoutRef.current);
      photoHoverTimeoutRef.current = null;
    }
    setShowPhotoHover(false);
  };

  useEffect(() => {
    return () => {
      if (photoHoverTimeoutRef.current)
        clearTimeout(photoHoverTimeoutRef.current);
    };
  }, []);

  const loadMyVacancies = () => {
    if (!isReady || (!accessToken && !refreshToken)) return;
    setLoadingVacancies(true);
    setVacancyError(null);
    getMyVacancies(0, 50)
      .then((data) => {
        setMyVacancies(data ?? []);
      })
      .catch((e) => setVacancyError(e?.message ?? "Failed to load vacancies"))
      .finally(() => setLoadingVacancies(false));
  };

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) return;
    loadMyVacancies();
  }, [isReady, accessToken, refreshToken]);

  const handleCreateVacancy = async (body: TripVacancyCreateRequest) => {
    await createVacancy(body);
    setVacancyModalOpen(false);
    setEditingVacancy(null);
    loadMyVacancies();
  };

  const handleUpdateVacancy = async (
    vacancyId: number,
    body: TripVacancyUpdateRequest,
  ) => {
    await updateVacancy(vacancyId, body);
    setVacancyModalOpen(false);
    setEditingVacancy(null);
    loadMyVacancies();
  };

  const handleDeleteVacancy = async (id: number) => {
    if (!confirm("Delete this vacancy?")) return;
    setDeletingId(id);
    try {
      await deleteVacancy(id);
      loadMyVacancies();
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateVacancyModal = () => {
    setEditingVacancy(null);
    setVacancyModalOpen(true);
  };

  const openEditVacancyModal = (v: TripVacancyResponse) => {
    setEditingVacancy(v);
    setVacancyModalOpen(true);
  };

  // Load available options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [languages, interests, travelStyles] = await Promise.all([
          getAllLanguages(),
          getAllInterests(),
          getAllTravelStyles(),
        ]);
        setAvailableLanguages(languages);
        setAvailableInterests(interests);
        setAvailableTravelStyles(travelStyles);
      } catch (e) {
        console.error("Failed to load options:", e);
      }
    };
    loadOptions();
  }, [getAllLanguages, getAllInterests, getAllTravelStyles]);

  // Load profile data
  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getMyProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
        setGender(
          data.gender ?? sessionStorage.getItem(PROFILE_GENDER_KEY) ?? "",
        );
        setCountry(data.country ?? "");
        setCity(data.city ?? "");
        setBio(data.bio ?? "");
        const tz = sessionStorage.getItem(PROFILE_TIMEZONE_KEY);
        setTimeZone(tz && TIMEZONES.includes(tz) ? tz : "UTC+05:00");

        // Set selected IDs for multi-select fields
        setSelectedLanguageIds(data.languages?.map((l) => l.language_id) ?? []);
        setSelectedInterestIds(data.interests?.map((i) => i.interest_id) ?? []);
        setSelectedTravelStyleIds(
          data.travel_styles?.map((ts) => ts.travel_style_id) ?? [],
        );
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isReady, accessToken, refreshToken, getMyProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSavedMessage(false);
    try {
      // Update basic profile fields
      await updateMyProfile({
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        gender: gender || undefined,
        country: country || undefined,
        city: city || undefined,
        bio: bio || undefined,
      });

      // Update languages, interests, and travel styles
      await Promise.all([
        setLanguages(selectedLanguageIds),
        setInterests(selectedInterestIds),
        setTravelStyles(selectedTravelStyleIds),
      ]);

      // Reload profile
      const updatedProfile = await getMyProfile();
      setProfile(updatedProfile);

      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      // TODO: Implement photo upload
      // For now, this is a placeholder
      console.warn("Photo upload not implemented");
      setError("Photo upload feature coming soon");
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading profile…</p>
      </div>
    );
  }

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="app-layout">
        {/* Sidebar overlay */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
          onClick={closeSidebar}
          aria-hidden="true"
        />

        {/* Sidebar */}
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
              to="/"
              className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
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

        {/* Header */}
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

        {/* Main content */}
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
              My Profile
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Manage your personal information
            </p>
          </div>

          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <span
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                Personal info
              </span>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "auto", padding: "8px 20px" }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {error && (
                <p
                  style={{
                    color: "var(--status-error)",
                    marginBottom: 16,
                    fontSize: "0.9375rem",
                    fontWeight: 500,
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
              {savedMessage && (
                <p
                  style={{
                    color: "var(--status-success)",
                    marginBottom: 16,
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    padding: "12px 16px",
                    background: "var(--status-success-bg)",
                    borderRadius: 8,
                    border: "1px solid var(--status-success-border)",
                  }}
                  role="status"
                >
                  Saved successfully.
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 24,
                  marginBottom: 32,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="profile-photo-btn"
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={handlePhotoMouseEnter}
                  onMouseLeave={handlePhotoMouseLeave}
                  disabled={uploadingPhoto}
                  title={
                    photoDisplayUrl ? "Изменить фото профиля" : "Добавить фото"
                  }
                  aria-label={
                    photoDisplayUrl
                      ? "Change profile photo"
                      : "Upload profile photo"
                  }
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    border: "none",
                    overflow: "hidden",
                    padding: 0,
                    cursor: uploadingPhoto ? "wait" : "pointer",
                    flexShrink: 0,
                    position: "relative",
                    background: photoDisplayUrl
                      ? `center/cover url(${photoDisplayUrl})`
                      : "var(--primary-light)",
                  }}
                >
                  {!photoDisplayUrl ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        color: "var(--accent)",
                      }}
                    >
                      +
                    </span>
                  ) : (
                    showPhotoHover && (
                      <span className="profile-photo-overlay">
                        <span
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            color: "white",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              textAlign: "center",
                              padding: "4px 8px",
                              background: "rgba(0,0,0,0.5)",
                              borderRadius: 6,
                            }}
                          >
                            Изменить фото профиля
                          </span>
                        </span>
                      </span>
                    )
                  )}
                </button>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      margin: "0 0 4px",
                      color: "var(--text)",
                    }}
                  >
                    {profile
                      ? `${profile.first_name} ${profile.last_name}`
                      : "—"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9375rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {user?.email || "—"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                  marginBottom: 24,
                }}
              >
                <div className="input-wrap">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="input-wrap">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="input-wrap">
                  <label>Gender</label>
                  <select
                    className="input-field"
                    value={gender}
                    onChange={(e) => {
                      const v = e.target.value;
                      setGender(v);
                      if (v) sessionStorage.setItem(PROFILE_GENDER_KEY, v);
                      else sessionStorage.removeItem(PROFILE_GENDER_KEY);
                    }}
                  >
                    <option value="">—</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="input-wrap">
                  <label>Country</label>
                  <select
                    className="input-field"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">—</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-wrap">
                  <label>City</label>
                  <input
                    type="text"
                    className="input-field"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city"
                  />
                </div>
                <div className="input-wrap">
                  <label>Time Zone</label>
                  <select
                    className="input-field"
                    value={timeZone}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTimeZone(v);
                      sessionStorage.setItem(PROFILE_TIMEZONE_KEY, v);
                    }}
                  >
                    {TIMEZONES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Languages Section - Chip Based */}
              <div
                style={{
                  marginBottom: 32,
                  padding: "24px",
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-muted)",
                    margin: "0 0 16px",
                  }}
                >
                  Languages
                </h3>
                {availableLanguages.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", margin: 0 }}>
                    Loading languages...
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {availableLanguages.map((lang) => {
                      const isSelected = selectedLanguageIds.includes(lang.id);
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedLanguageIds(
                                selectedLanguageIds.filter(
                                  (id) => id !== lang.id,
                                ),
                              );
                            } else {
                              setSelectedLanguageIds([
                                ...selectedLanguageIds,
                                lang.id,
                              ]);
                            }
                          }}
                          style={{
                            padding: "10px 16px",
                            fontSize: "0.875rem",
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected
                              ? "var(--primary)"
                              : "var(--text)",
                            background: isSelected
                              ? "var(--primary-light)"
                              : "var(--bg-elevated)",
                            border: isSelected
                              ? "2px solid var(--primary)"
                              : "1px solid var(--border)",
                            borderRadius: 999,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "var(--bg-hover)";
                              e.currentTarget.style.borderColor =
                                "var(--primary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "var(--bg-elevated)";
                              e.currentTarget.style.borderColor =
                                "var(--border)";
                            }
                          }}
                        >
                          {isSelected && (
                            <span style={{ fontSize: "0.75rem" }}>✓</span>
                          )}
                          {lang.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Interests Section - Chip Based */}
              <div
                style={{
                  marginBottom: 32,
                  padding: "24px",
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-muted)",
                    margin: "0 0 16px",
                  }}
                >
                  Interests
                </h3>
                {availableInterests.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", margin: 0 }}>
                    Loading interests...
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {availableInterests.map((interest) => {
                      const isSelected = selectedInterestIds.includes(
                        interest.id,
                      );
                      return (
                        <button
                          key={interest.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedInterestIds(
                                selectedInterestIds.filter(
                                  (id) => id !== interest.id,
                                ),
                              );
                            } else {
                              setSelectedInterestIds([
                                ...selectedInterestIds,
                                interest.id,
                              ]);
                            }
                          }}
                          style={{
                            padding: "10px 16px",
                            fontSize: "0.875rem",
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected
                              ? "var(--primary)"
                              : "var(--text)",
                            background: isSelected
                              ? "var(--primary-light)"
                              : "var(--bg-elevated)",
                            border: isSelected
                              ? "2px solid var(--primary)"
                              : "1px solid var(--border)",
                            borderRadius: 999,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "var(--bg-hover)";
                              e.currentTarget.style.borderColor =
                                "var(--primary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "var(--bg-elevated)";
                              e.currentTarget.style.borderColor =
                                "var(--border)";
                            }
                          }}
                        >
                          {isSelected && (
                            <span style={{ fontSize: "0.75rem" }}>✓</span>
                          )}
                          {interest.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Travel Styles Section - Chip Based */}
              <div
                style={{
                  marginBottom: 32,
                  padding: "24px",
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-muted)",
                    margin: "0 0 16px",
                  }}
                >
                  Travel Styles
                </h3>
                {availableTravelStyles.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", margin: 0 }}>
                    Loading travel styles...
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {availableTravelStyles.map((style) => {
                      const isSelected = selectedTravelStyleIds.includes(
                        style.id,
                      );
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTravelStyleIds(
                                selectedTravelStyleIds.filter(
                                  (id) => id !== style.id,
                                ),
                              );
                            } else {
                              setSelectedTravelStyleIds([
                                ...selectedTravelStyleIds,
                                style.id,
                              ]);
                            }
                          }}
                          style={{
                            padding: "10px 16px",
                            fontSize: "0.875rem",
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected
                              ? "var(--primary)"
                              : "var(--text)",
                            background: isSelected
                              ? "var(--primary-light)"
                              : "var(--bg-elevated)",
                            border: isSelected
                              ? "2px solid var(--primary)"
                              : "1px solid var(--border)",
                            borderRadius: 999,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "var(--bg-hover)";
                              e.currentTarget.style.borderColor =
                                "var(--primary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "var(--bg-elevated)";
                              e.currentTarget.style.borderColor =
                                "var(--border)";
                            }
                          }}
                        >
                          {isSelected && (
                            <span style={{ fontSize: "0.75rem" }}>✓</span>
                          )}
                          {style.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bio field */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 500,
                    color: "var(--text)",
                  }}
                >
                  Bio
                </label>
                <textarea
                  className="input-field"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                  style={{ resize: "vertical", minHeight: 100, width: "100%" }}
                />
              </div>

              <section
                style={{ paddingTop: 16, borderTop: "1px solid var(--border)" }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    margin: "0 0 8px",
                    color: "var(--text)",
                  }}
                >
                  My email Address
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9375rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>✉️</span> {user?.email || "—"}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                  }}
                >
                  1 day ago
                </p>
              </section>
            </div>
          </div>

          <section
            style={{
              marginTop: 32,
              padding: 24,
              background: "var(--card-bg)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  margin: 0,
                  color: "var(--text)",
                }}
              >
                My Trip Vacancies
              </h3>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "auto", padding: "8px 20px" }}
                onClick={openCreateVacancyModal}
              >
                Create Vacancy
              </button>
            </div>
            {vacancyError && (
              <p
                style={{
                  color: "var(--status-error)",
                  fontSize: "0.9375rem",
                  marginBottom: 16,
                }}
                role="alert"
              >
                {vacancyError}
              </p>
            )}
            {loadingVacancies ? (
              <p style={{ color: "var(--text-muted)" }}>Loading…</p>
            ) : myVacancies.length === 0 ? (
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                You have no vacancies yet. Create your first one!
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {myVacancies.map((v) => (
                  <div
                    key={v.id}
                    className="card-premium"
                    style={{
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        margin: "0 0 4px",
                      }}
                    >
                      {formatVacancyDestination(v)}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      {formatRequestDate(v.start_date)} —{" "}
                      {formatRequestDate(v.end_date)}
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      Budget: {formatVacancyBudget(v)}
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      People needed: {v.people_needed}
                    </p>
                    {v.status && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          borderRadius: 999,
                          background: "var(--accent-light)",
                          color: "var(--accent)",
                          width: "fit-content",
                        }}
                      >
                        {v.status}
                      </span>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openEditVacancyModal(v)}
                        style={{ flex: 1, padding: "8px 16px" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleDeleteVacancy(v.id)}
                        disabled={deletingId === v.id}
                        style={{
                          flex: 1,
                          padding: "8px 16px",
                          color: "var(--status-error)",
                          borderColor: "var(--status-error)",
                        }}
                      >
                        {deletingId === v.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          © 2026 TripMate. Travel together, explore forever.
        </footer>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          style={{ display: "none" }}
        />

        {vacancyModalOpen && (
          <CreateTripVacancyModal
            onClose={() => {
              setVacancyModalOpen(false);
              setEditingVacancy(null);
            }}
            onCreate={handleCreateVacancy}
            onUpdate={editingVacancy ? handleUpdateVacancy : undefined}
            editing={editingVacancy}
          />
        )}
      </div>
    </>
  );
}
