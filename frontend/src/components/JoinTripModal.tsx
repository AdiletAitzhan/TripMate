import { useEffect, useState } from "react";
import type { OfferCreateRequest } from "../types/offer";

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OfferCreateRequest) => Promise<void>;
  tripVacancyId: number;
  maxBudget?: string | null;
}

export function JoinTripModal({
  isOpen,
  onClose,
  onSubmit,
  tripVacancyId,
  maxBudget,
}: JoinTripModalProps) {
  const [message, setMessage] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (isOpen) {
      setMessage("");
      setProposedBudget("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data: OfferCreateRequest = {
        trip_vacancy_id: tripVacancyId,
        message: message.trim() || null,
        proposed_budget: proposedBudget ? Number(proposedBudget) : null,
      };

      await onSubmit(data);
      onClose();
    } catch (err) {
      setError((err as Error).message || "Failed to submit offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
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
          maxWidth: "500px",
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
            Join This Trip
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              color: "var(--text-muted)",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "background 0.2s",
              opacity: isSubmitting ? 0.5 : 1,
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = "var(--bg-elevated)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "none";
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              color: "var(--status-error)",
              padding: "12px 16px",
              background: "var(--status-error-bg)",
              borderRadius: "8px",
              border: "1px solid var(--status-error-border)",
              marginBottom: "20px",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="message"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you'd like to join this trip..."
              disabled={isSubmitting}
              rows={5}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.9375rem",
                color: "var(--text)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                resize: "vertical",
                fontFamily: "inherit",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="proposedBudget"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              Proposed Budget (KZT) (Optional)
            </label>
            {maxBudget && (
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  marginBottom: "8px",
                }}
              >
                Maximum budget for this trip: {maxBudget} KZT
              </p>
            )}
            <input
              type="number"
              id="proposedBudget"
              value={proposedBudget}
              onChange={(e) => setProposedBudget(e.target.value)}
              placeholder="Enter your budget"
              disabled={isSubmitting}
              min="0"
              step="1"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.9375rem",
                color: "var(--text)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontFamily: "inherit",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
              style={{
                padding: "12px 24px",
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                padding: "12px 24px",
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
