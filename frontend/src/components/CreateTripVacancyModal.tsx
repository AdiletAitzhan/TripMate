import { useState } from "react";
import type {
  TripVacancyCreateRequest,
  TripVacancyUpdateRequest,
  TripVacancyResponse,
} from "../types/tripRequest";

const COUNTRIES = [
  "Kazakhstan",
  "Russia",
  "USA",
  "Germany",
  "France",
  "UK",
  "Japan",
  "China",
  "Italy",
  "Spain",
  "Other",
];

const TRANSPORTATION_OPTIONS = ["Plane", "Train", "Bus", "Car", "Ship", "Any"];

const ACCOMMODATION_OPTIONS = [
  "Hotel",
  "Hostel",
  "Apartment",
  "House",
  "Resort",
  "Camping",
  "Any",
];

const GENDER_OPTIONS = ["Male", "Female", "Any"];

type Props = {
  onClose: () => void;
  onCreate: (body: TripVacancyCreateRequest) => Promise<void>;
  onUpdate?: (
    vacancyId: number,
    body: TripVacancyUpdateRequest,
  ) => Promise<void>;
  editing?: TripVacancyResponse | null;
};

function formatDateForInput(s: string | undefined): string {
  if (!s) return "";
  const d = new Date(s);
  return d.toISOString().slice(0, 10);
}

export function CreateTripVacancyModal({
  onClose,
  onCreate,
  onUpdate,
  editing,
}: Props) {
  const [destinationCity, setDestinationCity] = useState(
    editing?.destination_city ?? "",
  );
  const [destinationCountry, setDestinationCountry] = useState(
    editing?.destination_country ?? COUNTRIES[0],
  );
  const [startDate, setStartDate] = useState(
    formatDateForInput(editing?.start_date),
  );
  const [endDate, setEndDate] = useState(formatDateForInput(editing?.end_date));
  const [minBudget, setMinBudget] = useState<number | "">(
    editing?.min_budget ? Number(editing.min_budget) : "",
  );
  const [maxBudget, setMaxBudget] = useState<number | "">(
    editing?.max_budget ? Number(editing.max_budget) : "",
  );
  const [peopleNeeded, setPeopleNeeded] = useState<number>(
    editing?.people_needed ?? 1,
  );
  const [description, setDescription] = useState(editing?.description ?? "");
  const [plannedActivities, setPlannedActivities] = useState(
    editing?.planned_activities ?? "",
  );
  const [plannedDestinations, setPlannedDestinations] = useState(
    editing?.planned_destinations ?? "",
  );
  const [transportationPreference, setTransportationPreference] = useState(
    editing?.transportation_preference ?? "Any",
  );
  const [accommodationPreference, setAccommodationPreference] = useState(
    editing?.accommodation_preference ?? "Any",
  );
  const [minAge, setMinAge] = useState<number | "">(editing?.min_age ?? "");
  const [maxAge, setMaxAge] = useState<number | "">(editing?.max_age ?? "");
  const [genderPreference, setGenderPreference] = useState(
    editing?.gender_preference ?? "Any",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (editing && onUpdate) {
      const body: TripVacancyUpdateRequest = {
        destination_city: destinationCity.trim() || null,
        destination_country: destinationCountry || null,
        start_date: startDate || null,
        end_date: endDate || null,
        min_budget: minBudget !== "" ? Number(minBudget) : null,
        max_budget: maxBudget !== "" ? Number(maxBudget) : null,
        people_needed: peopleNeeded || null,
        description: description.trim() || null,
        planned_activities: plannedActivities.trim() || null,
        planned_destinations: plannedDestinations.trim() || null,
        transportation_preference: transportationPreference || null,
        accommodation_preference: accommodationPreference || null,
        min_age: minAge !== "" ? Number(minAge) : null,
        max_age: maxAge !== "" ? Number(maxAge) : null,
        gender_preference: genderPreference || null,
      };
      try {
        await onUpdate(editing.id, body);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Validate required fields
    if (!destinationCity.trim()) {
      setError("Destination city is required");
      setSubmitting(false);
      return;
    }
    if (!destinationCountry) {
      setError("Destination country is required");
      setSubmitting(false);
      return;
    }
    if (!startDate || !endDate) {
      setError("Start date and end date are required");
      setSubmitting(false);
      return;
    }
    if (peopleNeeded < 1) {
      setError("At least 1 person is needed");
      setSubmitting(false);
      return;
    }

    const body: TripVacancyCreateRequest = {
      destination_city: destinationCity.trim(),
      destination_country: destinationCountry,
      start_date: startDate,
      end_date: endDate,
      people_needed: peopleNeeded,
      min_budget: minBudget !== "" ? Number(minBudget) : null,
      max_budget: maxBudget !== "" ? Number(maxBudget) : null,
      description: description.trim() || null,
      planned_activities: plannedActivities.trim() || null,
      planned_destinations: plannedDestinations.trim() || null,
      transportation_preference: transportationPreference || null,
      accommodation_preference: accommodationPreference || null,
      min_age: minAge !== "" ? Number(minAge) : null,
      max_age: maxAge !== "" ? Number(maxAge) : null,
      gender_preference: genderPreference || null,
    };

    try {
      await onCreate(body);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const title = editing ? "Edit Trip Vacancy" : "Create Trip Vacancy";

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 800,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 0,
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          background: "var(--card-bg)",
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-elevated)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="modal-close"
            style={{
              position: "absolute",
              top: 24,
              right: 32,
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--text-muted)",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            ×
          </button>
        </div>
        <div
          className="modal-body"
          style={{
            padding: "32px",
            background:
              "linear-gradient(to bottom, var(--bg-elevated) 0%, var(--bg) 100%)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <p
                style={{
                  color: "var(--status-error)",
                  marginBottom: 24,
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

            {/* Section: Destination */}
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--primary)",
                  marginBottom: 16,
                }}
              >
                Destination
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    City <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="e.g. Almaty"
                    required
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  />
                </div>
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Country{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <select
                    className="input-field"
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    required
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Dates */}
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--primary)",
                  marginBottom: 16,
                }}
              >
                Travel Dates
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Start Date{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  />
                </div>
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    End Date{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section: Budget & People */}
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--primary)",
                  marginBottom: 16,
                }}
              >
                Budget & Group Size
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Min Budget
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min={0}
                    value={minBudget === "" ? "" : minBudget}
                    onChange={(e) =>
                      setMinBudget(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="Optional"
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  />
                </div>
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Max Budget
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min={0}
                    value={maxBudget === "" ? "" : maxBudget}
                    onChange={(e) =>
                      setMaxBudget(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="Optional"
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  />
                </div>
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    People Needed{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min={1}
                    value={peopleNeeded}
                    onChange={(e) => setPeopleNeeded(Number(e.target.value))}
                    required
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section: Description */}
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--primary)",
                  marginBottom: 16,
                }}
              >
                Trip Details
              </h3>
              <div className="input-wrap" style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Description
                </label>
                <textarea
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your trip plans and what you're looking for..."
                  rows={3}
                  style={{
                    resize: "vertical",
                    minHeight: 80,
                    padding: "12px 16px",
                    fontSize: "0.9375rem",
                    borderRadius: 8,
                    lineHeight: 1.5,
                  }}
                />
              </div>
              <div className="input-wrap" style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Planned Activities
                </label>
                <textarea
                  className="input-field"
                  value={plannedActivities}
                  onChange={(e) => setPlannedActivities(e.target.value)}
                  placeholder="e.g., Hiking, sightseeing, museums, local cuisine"
                  rows={2}
                  style={{
                    resize: "vertical",
                    minHeight: 60,
                    padding: "12px 16px",
                    fontSize: "0.9375rem",
                    borderRadius: 8,
                    lineHeight: 1.5,
                  }}
                />
              </div>
              <div className="input-wrap">
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Planned Destinations
                </label>
                <textarea
                  className="input-field"
                  value={plannedDestinations}
                  onChange={(e) => setPlannedDestinations(e.target.value)}
                  placeholder="e.g., City center, mountains, beaches, historical sites"
                  rows={2}
                  style={{
                    resize: "vertical",
                    minHeight: 60,
                    padding: "12px 16px",
                    fontSize: "0.9375rem",
                    borderRadius: 8,
                    lineHeight: 1.5,
                  }}
                />
              </div>
            </div>

            {/* Section: Preferences */}
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--primary)",
                  marginBottom: 16,
                }}
              >
                Preferences
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Transportation
                  </label>
                  <select
                    className="input-field"
                    value={transportationPreference}
                    onChange={(e) =>
                      setTransportationPreference(e.target.value)
                    }
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  >
                    {TRANSPORTATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Accommodation
                  </label>
                  <select
                    className="input-field"
                    value={accommodationPreference}
                    onChange={(e) => setAccommodationPreference(e.target.value)}
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  >
                    {ACCOMMODATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Min Age
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min={18}
                    max={120}
                    value={minAge === "" ? "" : minAge}
                    onChange={(e) =>
                      setMinAge(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="Any"
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  />
                </div>
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Max Age
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min={18}
                    max={120}
                    value={maxAge === "" ? "" : maxAge}
                    onChange={(e) =>
                      setMaxAge(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="Any"
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  />
                </div>
                <div className="input-wrap">
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Gender
                  </label>
                  <select
                    className="input-field"
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value)}
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.9375rem",
                      borderRadius: 8,
                    }}
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{
                  width: "auto",
                  padding: "12px 32px",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  width: "auto",
                  padding: "12px 32px",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                }}
              >
                {submitting
                  ? "Saving…"
                  : editing
                    ? "Update Vacancy"
                    : "Create Vacancy"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
