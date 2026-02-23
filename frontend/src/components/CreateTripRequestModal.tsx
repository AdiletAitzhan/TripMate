import { useState } from "react"
import type {
  CreateTripRequestRequest,
  DestinationDto,
  TripRequestShortResponse,
  UpdateTripRequestRequest,
} from "../types/tripRequest"

const COUNTRIES = [
  "Kazakhstan",
  "Russia",
  "USA",
  "Germany",
  "France",
  "UK",
  "Other",
]
const CURRENCIES = ["USD", "EUR", "KZT", "RUB"]

type Props = {
  onClose: () => void
  onCreate: (body: CreateTripRequestRequest) => Promise<void>
  onUpdate?: (requestId: string, body: UpdateTripRequestRequest) => Promise<void>
  editing?: TripRequestShortResponse | null
}

function formatDateForInput(s: string | undefined): string {
  if (!s) return ""
  const d = new Date(s)
  return d.toISOString().slice(0, 10)
}

export function CreateTripRequestModal({
  onClose,
  onCreate,
  onUpdate,
  editing,
}: Props) {
  const [city, setCity] = useState(editing?.destination?.city ?? "")
  const [country, setCountry] = useState(
    editing?.destination?.country ?? COUNTRIES[0]
  )
  const [startDate, setStartDate] = useState(
    formatDateForInput(editing?.startDate)
  )
  const [endDate, setEndDate] = useState(formatDateForInput(editing?.endDate))
  const [budgetAmount, setBudgetAmount] = useState<number | "">(
    editing?.budget?.amount ?? ""
  )
  const [budgetCurrency, setBudgetCurrency] = useState(
    editing?.budget?.currency ?? "USD"
  )
  const [notifyOnMatch, setNotifyOnMatch] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const destination: DestinationDto = { city: city.trim() || undefined, country }

    if (editing && onUpdate) {
      const body: UpdateTripRequestRequest = {}
      if (startDate) body.startDate = startDate
      if (endDate) body.endDate = endDate
      if (budgetAmount !== "")
        body.budget = { amount: Number(budgetAmount), currency: budgetCurrency }
      try {
        await onUpdate(editing.id, body)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update")
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!startDate || !endDate) {
      setError("Start date and end date are required")
      setSubmitting(false)
      return
    }

    const body: CreateTripRequestRequest = {
      destination,
      startDate,
      endDate,
      notifyOnMatch,
    }
    if (budgetAmount !== "") {
      body.budget = { amount: Number(budgetAmount), currency: budgetCurrency }
    }

    try {
      await onCreate(body)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setSubmitting(false)
    }
  }

  const title = editing ? "Edit Trip Request" : "Create Trip Request"

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
      <form onSubmit={handleSubmit}>
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

        <div className="input-wrap">
          <label>City</label>
          <input
            type="text"
            className="input-field"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Almaty"
            readOnly={!!editing}
            style={editing ? { background: "var(--bg)", cursor: "default" } : undefined}
          />
        </div>
        <div className="input-wrap">
          <label>Country</label>
          <select
            className="input-field"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={!!editing}
            style={editing ? { background: "var(--bg)", cursor: "default" } : undefined}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="input-wrap">
            <label>Start Date</label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required={!editing}
            />
          </div>
          <div className="input-wrap">
            <label>End Date</label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required={!editing}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="input-wrap">
            <label>Budget (amount)</label>
            <input
              type="number"
              className="input-field"
              min={0}
              value={budgetAmount === "" ? "" : budgetAmount}
              onChange={(e) =>
                setBudgetAmount(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="Optional"
            />
          </div>
          <div className="input-wrap">
            <label>Currency</label>
            <select
              className="input-field"
              value={budgetCurrency}
              onChange={(e) => setBudgetCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!editing && (
          <div className="checkbox-wrap">
            <input
              type="checkbox"
              id="notify"
              checked={notifyOnMatch}
              onChange={(e) => setNotifyOnMatch(e.target.checked)}
            />
            <label htmlFor="notify">Notify me when there are matching offers</label>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 24,
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ width: "auto", padding: "12px 24px" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: "auto", padding: "12px 24px" }}
          >
            {submitting ? "Saving…" : editing ? "Update" : "Create"}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  )
}
