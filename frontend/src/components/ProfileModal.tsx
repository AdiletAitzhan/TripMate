import { useEffect } from "react";
import type { ProfileDetailResponse } from "../types/profile";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileDetailResponse | null;
  loading: boolean;
  error: string | null;
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export function ProfileModal({
  isOpen,
  onClose,
  profile,
  loading,
  error,
}: ProfileModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Profile Information
          </h2>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "none";
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading && (
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
            Loading profile...
          </p>
        )}

        {error && (
          <div
            style={{
              color: "var(--status-error)",
              padding: "12px 16px",
              background: "var(--status-error-bg)",
              borderRadius: "8px",
              border: "1px solid var(--status-error-border)",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {profile && !loading && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Profile Photo */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: profile.profile_photo_url
                    ? `url(${profile.profile_photo_url}) center/cover`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "2rem",
                  fontWeight: "700",
                }}
              >
                {!profile.profile_photo_url &&
                  `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()}
              </div>
            </div>

            {/* Name */}
            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  margin: "0 0 4px",
                }}
              >
                {profile.first_name} {profile.last_name}
              </h3>
              {profile.city && profile.country && (
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    margin: 0,
                  }}
                >
                  {profile.city}, {profile.country}
                </p>
              )}
            </div>

            {/* Basic Info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  Age
                </p>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {calculateAge(profile.date_of_birth)} years
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  Gender
                </p>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text)",
                    margin: 0,
                    textTransform: "capitalize",
                  }}
                >
                  {profile.gender}
                </p>
              </div>

              {profile.nationality && (
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      margin: "0 0 4px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                  >
                    Nationality
                  </p>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {profile.nationality}
                  </p>
                </div>
              )}

              {profile.phone && (
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      margin: "0 0 4px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                  >
                    Phone
                  </p>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {profile.phone}
                  </p>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    margin: "0 0 8px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  Bio
                </p>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    margin: "0 0 8px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  Languages
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {profile.languages.map((lang) => (
                    <span
                      key={lang.id}
                      style={{
                        padding: "4px 12px",
                        background: "var(--bg-elevated)",
                        borderRadius: "16px",
                        fontSize: "0.875rem",
                        color: "var(--text)",
                      }}
                    >
                      {lang.language.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    margin: "0 0 8px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  Interests
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {profile.interests.map((interest) => (
                    <span
                      key={interest.id}
                      style={{
                        padding: "4px 12px",
                        background: "var(--bg-elevated)",
                        borderRadius: "16px",
                        fontSize: "0.875rem",
                        color: "var(--text)",
                      }}
                    >
                      {interest.interest.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Travel Styles */}
            {profile.travel_styles && profile.travel_styles.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    margin: "0 0 8px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  Travel Styles
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {profile.travel_styles.map((style) => (
                    <span
                      key={style.id}
                      style={{
                        padding: "4px 12px",
                        background: "var(--bg-elevated)",
                        borderRadius: "16px",
                        fontSize: "0.875rem",
                        color: "var(--text)",
                      }}
                    >
                      {style.travel_style.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {(profile.instagram_handle || profile.telegram_handle) && (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    margin: "0 0 8px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  Social Media
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {profile.instagram_handle && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.875rem",
                        }}
                      >
                        Instagram:
                      </span>
                      <span
                        style={{ color: "var(--text)", fontSize: "0.875rem" }}
                      >
                        @{profile.instagram_handle}
                      </span>
                    </div>
                  )}
                  {profile.telegram_handle && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.875rem",
                        }}
                      >
                        Telegram:
                      </span>
                      <span
                        style={{ color: "var(--text)", fontSize: "0.875rem" }}
                      >
                        @{profile.telegram_handle}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
