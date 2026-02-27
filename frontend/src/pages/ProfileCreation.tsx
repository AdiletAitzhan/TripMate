import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useProfilesApi } from "../hooks/useProfilesApi";
import type {
  LanguageResponse,
  InterestResponse,
  TravelStyleResponse,
} from "../types/profile";

export function ProfileCreation() {
  const navigate = useNavigate();
  const { user, setHasProfile, hasProfile, isReady } = useAuth();
  const {
    createProfile,
    setLanguages,
    setInterests,
    setTravelStyles,
    getAllLanguages,
    getAllInterests,
    getAllTravelStyles,
  } = useProfilesApi();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Required fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  // Optional fields
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  // Selected IDs for multi-select fields
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [selectedTravelStyleIds, setSelectedTravelStyleIds] = useState<
    number[]
  >([]);

  // Redirect to home if user already has a profile
  useEffect(() => {
    if (isReady && hasProfile === true) {
      navigate("/home", { replace: true });
    }
  }, [isReady, hasProfile, navigate]);

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
        setError("Failed to load profile options. Please refresh the page.");
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
  }, [getAllLanguages, getAllInterests, getAllTravelStyles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth || !gender) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the profile
      await createProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth,
        gender: gender,
        country: country || null,
        city: city || null,
        bio: bio || null,
      });

      // Set languages, interests, and travel styles if any selected
      const promises = [];
      if (selectedLanguageIds.length > 0) {
        promises.push(setLanguages(selectedLanguageIds));
      }
      if (selectedInterestIds.length > 0) {
        promises.push(setInterests(selectedInterestIds));
      }
      if (selectedTravelStyleIds.length > 0) {
        promises.push(setTravelStyles(selectedTravelStyleIds));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // Update hasProfile state
      setHasProfile(true);

      // Redirect to home page after successful profile creation
      navigate("/home", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (id: number) => {
    setSelectedLanguageIds((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id],
    );
  };

  const toggleInterest = (id: number) => {
    setSelectedInterestIds((prev) =>
      prev.includes(id) ? prev.filter((iid) => iid !== id) : [...prev, id],
    );
  };

  const toggleTravelStyle = (id: number) => {
    setSelectedTravelStyleIds((prev) =>
      prev.includes(id) ? prev.filter((tsid) => tsid !== id) : [...prev, id],
    );
  };

  if (optionsLoading || !isReady) {
    return (
      <>
        <div className="grain" aria-hidden="true" />
        <div className="auth-layout">
          <div className="auth-card" style={{ maxWidth: 600 }}>
            <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
              Loading...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="auth-layout">
        <div className="auth-card" style={{ maxWidth: 700, padding: "48px" }}>
          <h1 className="auth-heading" style={{ fontSize: "2rem" }}>
            Create Your Profile
          </h1>
          <p className="auth-sub" style={{ marginBottom: 32 }}>
            Welcome, {user?.email}! Let's set up your profile to get started.
          </p>

          {error && (
            <p
              style={{
                color: "var(--status-error)",
                marginBottom: 20,
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

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: 20 }}>
              {/* Required Fields */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="input-wrap">
                  <label>
                    First Name{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label>
                    Last Name{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="input-wrap">
                  <label>
                    Date of Birth{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="input-wrap">
                  <label>
                    Gender{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <select
                    className="input-field"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Optional Fields */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="input-wrap">
                  <label>Country (optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., Kazakhstan"
                  />
                </div>
                <div className="input-wrap">
                  <label>City (optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Almaty"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="input-wrap">
                <label>Bio (optional)</label>
                <textarea
                  className="input-field"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  style={{ resize: "vertical", minHeight: 80 }}
                />
              </div>

              {/* Languages Multi-select */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                    fontSize: "0.9375rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  LANGUAGES (optional)
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 10,
                  }}
                >
                  {availableLanguages.length === 0 ? (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        margin: 0,
                        fontSize: "0.875rem",
                      }}
                    >
                      No languages available
                    </p>
                  ) : (
                    availableLanguages.map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => toggleLanguage(lang.id)}
                        style={{
                          padding: "12px 20px",
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          borderRadius: 30,
                          border: selectedLanguageIds.includes(lang.id)
                            ? "2px solid var(--primary)"
                            : "1px solid var(--border)",
                          background: selectedLanguageIds.includes(lang.id)
                            ? "var(--primary-light)"
                            : "var(--bg)",
                          color: selectedLanguageIds.includes(lang.id)
                            ? "var(--primary)"
                            : "var(--text)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textAlign: "center",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedLanguageIds.includes(lang.id)) {
                            e.currentTarget.style.borderColor =
                              "var(--primary)";
                            e.currentTarget.style.background =
                              "var(--bg-elevated)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedLanguageIds.includes(lang.id)) {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.background = "var(--bg)";
                          }
                        }}
                      >
                        {lang.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Interests Multi-select */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                    fontSize: "0.9375rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  INTERESTS (optional)
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 10,
                  }}
                >
                  {availableInterests.length === 0 ? (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        margin: 0,
                        fontSize: "0.875rem",
                      }}
                    >
                      No interests available
                    </p>
                  ) : (
                    availableInterests.map((interest) => (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        style={{
                          padding: "12px 20px",
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          borderRadius: 30,
                          border: selectedInterestIds.includes(interest.id)
                            ? "2px solid var(--primary)"
                            : "1px solid var(--border)",
                          background: selectedInterestIds.includes(interest.id)
                            ? "var(--primary-light)"
                            : "var(--bg)",
                          color: selectedInterestIds.includes(interest.id)
                            ? "var(--primary)"
                            : "var(--text)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textAlign: "center",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedInterestIds.includes(interest.id)) {
                            e.currentTarget.style.borderColor =
                              "var(--primary)";
                            e.currentTarget.style.background =
                              "var(--bg-elevated)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedInterestIds.includes(interest.id)) {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.background = "var(--bg)";
                          }
                        }}
                      >
                        {interest.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Travel Styles Multi-select */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                    fontSize: "0.9375rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  TRAVEL STYLES (optional)
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 10,
                  }}
                >
                  {availableTravelStyles.length === 0 ? (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        margin: 0,
                        fontSize: "0.875rem",
                      }}
                    >
                      No travel styles available
                    </p>
                  ) : (
                    availableTravelStyles.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => toggleTravelStyle(style.id)}
                        style={{
                          padding: "12px 20px",
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          borderRadius: 30,
                          border: selectedTravelStyleIds.includes(style.id)
                            ? "2px solid var(--primary)"
                            : "1px solid var(--border)",
                          background: selectedTravelStyleIds.includes(style.id)
                            ? "var(--primary-light)"
                            : "var(--bg)",
                          color: selectedTravelStyleIds.includes(style.id)
                            ? "var(--primary)"
                            : "var(--text)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textAlign: "center",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedTravelStyleIds.includes(style.id)) {
                            e.currentTarget.style.borderColor =
                              "var(--primary)";
                            e.currentTarget.style.background =
                              "var(--bg-elevated)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedTravelStyleIds.includes(style.id)) {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.background = "var(--bg)";
                          }
                        }}
                      >
                        {style.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? "Creating Profile..." : "Create Profile & Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
