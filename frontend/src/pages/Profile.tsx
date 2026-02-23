import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationButton } from "../components/NotificationButton";
import { useAuth } from "../context/useAuth";
import { useUsersApi } from "../hooks/useUsersApi";
import { useTripRequestsApi } from "../hooks/useTripRequestsApi";
import { CreateTripRequestModal } from "../components/CreateTripRequestModal";
import type { ProfileData } from "../types/profile";
import type {
  CreateTripRequestRequest,
  TripRequestShortResponse,
  UpdateTripRequestRequest,
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
const LANGUAGES = ["English", "Russian", "Kazakh"];
const TIMEZONES = ["UTC+05:00", "UTC+06:00", "UTC+03:00", "UTC+00:00"];
const CURRENCIES = ["USD", "EUR", "KZT", "RUB"];
const PREFERRED_GENDERS = ["", "MALE", "FEMALE", "OTHER"];
const PROFILE_GENDER_KEY = "tripmate_profile_gender";
const PROFILE_LANGUAGE_KEY = "tripmate_profile_language";
const PROFILE_TIMEZONE_KEY = "tripmate_profile_timezone";

function nicknameFromEmail(email: string | undefined) {
  if (!email) return "";
  const i = email.indexOf("@");
  return i > 0 ? email.slice(0, i) : email;
}

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

function formatRequestDestination(
  dest: TripRequestShortResponse["destination"],
): string {
  const parts = [dest?.city, dest?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function formatRequestBudget(
  budget: TripRequestShortResponse["budget"],
): string {
  if (!budget?.amount) return "—";
  const curr = budget.currency ?? "USD";
  return `${budget.amount} ${curr}`;
}

export function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isReady, accessToken, refreshToken, clearAuth } = useAuth();
  const { getProfile, updateProfile, uploadPhoto, updatePreferences } =
    useUsersApi();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const photoHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [showPhotoHover, setShowPhotoHover] = useState(false);

  const [fullName, setFullName] = useState("");
  const [nickName, setNickName] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("English");
  const [timeZone, setTimeZone] = useState("UTC+05:00");

  const [interestsInput, setInterestsInput] = useState("");
  const [minAge, setMinAge] = useState<number | "">("");
  const [maxAge, setMaxAge] = useState<number | "">("");
  const [preferredGender, setPreferredGender] = useState("");
  const [budgetMin, setBudgetMin] = useState<number | "">("");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [budgetCurrency, setBudgetCurrency] = useState("USD");

  const { getMyRequests, createRequest, updateRequest, deleteRequest } =
    useTripRequestsApi();
  const [myRequests, setMyRequests] = useState<TripRequestShortResponse[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] =
    useState<TripRequestShortResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const photoDisplayUrl = photoUrlForBrowser(profile?.profilePhoto);

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

  const loadMyRequests = () => {
    if (!isReady || (!accessToken && !refreshToken)) return;
    setLoadingRequests(true);
    setRequestError(null);
    getMyRequests({ page: 1, limit: 50 })
      .then((res) => {
        const data = res.data;
        setMyRequests(data?.requests ?? []);
      })
      .catch((e) => setRequestError(e?.message ?? "Failed to load requests"))
      .finally(() => setLoadingRequests(false));
  };

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) return;
    loadMyRequests();
  }, [isReady, accessToken, refreshToken]);

  const handleCreateRequest = async (body: CreateTripRequestRequest) => {
    await createRequest(body);
    setRequestModalOpen(false);
    setEditingRequest(null);
    loadMyRequests();
  };

  const handleUpdateRequest = async (
    requestId: string,
    body: UpdateTripRequestRequest,
  ) => {
    await updateRequest(requestId, body);
    setRequestModalOpen(false);
    setEditingRequest(null);
    loadMyRequests();
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Удалить этот реквест?")) return;
    setDeletingId(id);
    try {
      await deleteRequest(id);
      loadMyRequests();
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateRequestModal = () => {
    setEditingRequest(null);
    setRequestModalOpen(true);
  };

  const openEditRequestModal = (r: TripRequestShortResponse) => {
    setEditingRequest(r);
    setRequestModalOpen(true);
  };

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getProfile()
      .then((res) => {
        if (cancelled) return;
        const data = (res as { success?: boolean; data?: ProfileData }).data;
        if (data) {
          setProfile(data);
          setFullName(data.fullName ?? "");
          setNickName(nicknameFromEmail(data.email));
          setGender(
            data.gender ?? sessionStorage.getItem(PROFILE_GENDER_KEY) ?? "",
          );
          setCountry(data.location?.country ?? "");
          const lang = sessionStorage.getItem(PROFILE_LANGUAGE_KEY);
          setLanguage(lang && LANGUAGES.includes(lang) ? lang : "English");
          const tz = sessionStorage.getItem(PROFILE_TIMEZONE_KEY);
          setTimeZone(tz && TIMEZONES.includes(tz) ? tz : "UTC+05:00");
          const prefs = data.preferences;
          setInterestsInput((data.interests ?? []).join(", "));
          if (prefs) {
            setMinAge(prefs.minAge ?? "");
            setMaxAge(prefs.maxAge ?? "");
            setPreferredGender(prefs.preferredGender ?? "");
            setBudgetMin(prefs.budgetRange?.min ?? "");
            setBudgetMax(prefs.budgetRange?.max ?? "");
            setBudgetCurrency(prefs.budgetRange?.currency ?? "USD");
          }
        }
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
  }, [isReady, accessToken, refreshToken, getProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSavedMessage(false);
    try {
      const body: {
        fullName?: string;
        location?: { city?: string; country?: string };
      } = {};
      if (fullName != null && fullName.trim() !== "")
        body.fullName = fullName.trim();
      if (country != null && country !== "")
        body.location = { country: country, city: profile?.location?.city };
      await updateProfile(body);
      await new Promise((r) => setTimeout(r, 300));
      const res = await getProfile();
      const data = (res as { success?: boolean; data?: ProfileData }).data;
      if (data) {
        setProfile(data);
        setFullName(data.fullName ?? "");
        setNickName(nicknameFromEmail(data.email));
        setGender(
          data.gender ?? sessionStorage.getItem(PROFILE_GENDER_KEY) ?? "",
        );
        setCountry(data.location?.country ?? "");
        const lang = sessionStorage.getItem(PROFILE_LANGUAGE_KEY);
        setLanguage(lang && LANGUAGES.includes(lang) ? lang : "English");
        const tz = sessionStorage.getItem(PROFILE_TIMEZONE_KEY);
        setTimeZone(tz && TIMEZONES.includes(tz) ? tz : "UTC+05:00");
        const prefs = data.preferences;
        setInterestsInput((data.interests ?? []).join(", "));
        if (prefs) {
          setMinAge(prefs.minAge ?? "");
          setMaxAge(prefs.maxAge ?? "");
          setPreferredGender(prefs.preferredGender ?? "");
          setBudgetMin(prefs.budgetRange?.min ?? "");
          setBudgetMax(prefs.budgetRange?.max ?? "");
          setBudgetCurrency(prefs.budgetRange?.currency ?? "USD");
        }
      }
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
      const result = await uploadPhoto(file);
      if (result?.data?.photoUrl) {
        setProfile((p) =>
          p ? { ...p, profilePhoto: result.data!.photoUrl } : null,
        );
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    setError(null);
    try {
      const interestsList = interestsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await updatePreferences({
        interests: interestsList.length ? interestsList : undefined,
        minAge: minAge === "" ? undefined : Number(minAge),
        maxAge: maxAge === "" ? undefined : Number(maxAge),
        preferredGender: preferredGender || undefined,
        budgetRange:
          budgetMin !== "" || budgetMax !== ""
            ? {
                min: budgetMin === "" ? undefined : Number(budgetMin),
                max: budgetMax === "" ? undefined : Number(budgetMax),
                currency: budgetCurrency,
              }
            : undefined,
      });
      const res = await getProfile();
      const data = (res as { success?: boolean; data?: ProfileData }).data;
      if (data) {
        setProfile(data);
        const prefs = data.preferences;
        setInterestsInput((data.interests ?? []).join(", "));
        if (prefs) {
          setMinAge(prefs.minAge ?? "");
          setMaxAge(prefs.maxAge ?? "");
          setPreferredGender(prefs.preferredGender ?? "");
          setBudgetMin(prefs.budgetRange?.min ?? "");
          setBudgetMax(prefs.budgetRange?.max ?? "");
          setBudgetCurrency(prefs.budgetRange?.currency ?? "USD");
        }
      }
      setEditingPreferences(false);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Failed to save preferences");
    } finally {
      setSavingPreferences(false);
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
              Catalog
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
                    {profile?.fullName || "—"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9375rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {profile?.email || user?.email || "—"}
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
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="input-wrap">
                  <label>Nick Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={nickName}
                    readOnly
                    style={{ background: "var(--bg)", cursor: "default" }}
                    aria-label="Nickname (from email)"
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
                  <label>Language</label>
                  <select
                    className="input-field"
                    value={language}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLanguage(v);
                      sessionStorage.setItem(PROFILE_LANGUAGE_KEY, v);
                    }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
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
                  <span>✉️</span> {profile?.email || user?.email || "—"}
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

              <section
                style={{
                  paddingTop: 24,
                  marginTop: 24,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      margin: 0,
                      color: "var(--text)",
                    }}
                  >
                    Preferences
                  </h3>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: "auto", padding: "8px 16px" }}
                    onClick={() =>
                      editingPreferences
                        ? handleSavePreferences()
                        : setEditingPreferences(true)
                    }
                    disabled={savingPreferences}
                  >
                    {editingPreferences
                      ? savingPreferences
                        ? "Saving…"
                        : "Save"
                      : "Edit"}
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 24,
                  }}
                >
                  <div className="input-wrap" style={{ gridColumn: "1 / -1" }}>
                    <label>Interests (comma-separated)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={interestsInput}
                      onChange={(e) => setInterestsInput(e.target.value)}
                      readOnly={!editingPreferences}
                      placeholder="e.g. travel, hiking, food"
                      style={
                        !editingPreferences
                          ? { background: "var(--bg)", cursor: "default" }
                          : undefined
                      }
                    />
                  </div>
                  <div className="input-wrap">
                    <label>Min age</label>
                    <input
                      type="number"
                      className="input-field"
                      min={18}
                      max={100}
                      value={minAge === "" ? "" : minAge}
                      onChange={(e) =>
                        setMinAge(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      readOnly={!editingPreferences}
                      style={
                        !editingPreferences
                          ? { background: "var(--bg)", cursor: "default" }
                          : undefined
                      }
                    />
                  </div>
                  <div className="input-wrap">
                    <label>Max age</label>
                    <input
                      type="number"
                      className="input-field"
                      min={18}
                      max={100}
                      value={maxAge === "" ? "" : maxAge}
                      onChange={(e) =>
                        setMaxAge(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      readOnly={!editingPreferences}
                      style={
                        !editingPreferences
                          ? { background: "var(--bg)", cursor: "default" }
                          : undefined
                      }
                    />
                  </div>
                  <div className="input-wrap">
                    <label>Preferred gender</label>
                    {editingPreferences ? (
                      <select
                        className="input-field"
                        value={preferredGender}
                        onChange={(e) => setPreferredGender(e.target.value)}
                      >
                        {PREFERRED_GENDERS.map((g) => (
                          <option key={g || "_"} value={g}>
                            {g || "—"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="input-field"
                        value={preferredGender || "—"}
                        readOnly
                        style={{ background: "var(--bg)", cursor: "default" }}
                      />
                    )}
                  </div>
                  <div className="input-wrap">
                    <label>Budget (min)</label>
                    <input
                      type="number"
                      className="input-field"
                      min={0}
                      value={budgetMin === "" ? "" : budgetMin}
                      onChange={(e) =>
                        setBudgetMin(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      readOnly={!editingPreferences}
                      style={
                        !editingPreferences
                          ? { background: "var(--bg)", cursor: "default" }
                          : undefined
                      }
                    />
                  </div>
                  <div className="input-wrap">
                    <label>Budget (max)</label>
                    <input
                      type="number"
                      className="input-field"
                      min={0}
                      value={budgetMax === "" ? "" : budgetMax}
                      onChange={(e) =>
                        setBudgetMax(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      readOnly={!editingPreferences}
                      style={
                        !editingPreferences
                          ? { background: "var(--bg)", cursor: "default" }
                          : undefined
                      }
                    />
                  </div>
                  <div className="input-wrap">
                    <label>Currency</label>
                    <select
                      className="input-field"
                      value={budgetCurrency}
                      onChange={(e) => setBudgetCurrency(e.target.value)}
                      disabled={!editingPreferences}
                      style={
                        !editingPreferences
                          ? { background: "var(--bg)", cursor: "default" }
                          : undefined
                      }
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
                My requests
              </h3>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "auto", padding: "8px 20px" }}
                onClick={openCreateRequestModal}
              >
                Create request
              </button>
            </div>
            {requestError && (
              <p
                style={{
                  color: "var(--status-error)",
                  fontSize: "0.9375rem",
                  marginBottom: 16,
                }}
                role="alert"
              >
                {requestError}
              </p>
            )}
            {loadingRequests ? (
              <p style={{ color: "var(--text-muted)" }}>Загрузка…</p>
            ) : myRequests.length === 0 ? (
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                You have no requests yet. Create your first one!
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {myRequests.map((r) => (
                  <div
                    key={r.id}
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
                      {formatRequestDestination(r.destination)}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      {formatRequestDate(r.startDate)} —{" "}
                      {formatRequestDate(r.endDate)}
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      Бюджет: {formatRequestBudget(r.budget)}
                    </p>
                    {r.status && (
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
                        {r.status}
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
                        onClick={() => openEditRequestModal(r)}
                        style={{ flex: 1, padding: "8px 16px" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleDeleteRequest(r.id)}
                        disabled={deletingId === r.id}
                        style={{
                          flex: 1,
                          padding: "8px 16px",
                          color: "var(--status-error)",
                          borderColor: "var(--status-error)",
                        }}
                      >
                        {deletingId === r.id ? "Deleting…" : "Delete"}
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

        {requestModalOpen && (
          <CreateTripRequestModal
            onClose={() => {
              setRequestModalOpen(false);
              setEditingRequest(null);
            }}
            onCreate={handleCreateRequest}
            onUpdate={editingRequest ? handleUpdateRequest : undefined}
            editing={editingRequest}
          />
        )}
      </div>
    </>
  );
}
