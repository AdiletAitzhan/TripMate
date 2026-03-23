import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { RecommendedPlaceResponse } from "../types/tripPlan";

function formatMaybe(s: string | null | undefined): string | null {
  if (s == null) return null;
  const v = String(s).trim();
  return v ? v : null;
}

function getPlaceColor(name: string): string {
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function PlaceImage({
  src,
  alt,
  placeName,
  className,
  height,
}: {
  src?: string | null;
  alt: string;
  placeName: string;
  className?: string;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: "100%", height: height ?? 160, objectFit: "cover", display: "block" }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        background: getPlaceColor(placeName),
        width: "100%",
        height: height ?? 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.5rem",
        fontWeight: 700,
        color: "rgba(255,255,255,0.95)",
        textShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      {placeName.charAt(0).toUpperCase()}
    </div>
  );
}

function PlaceDetailModal({
  place,
  onClose,
}: {
  place: RecommendedPlaceResponse;
  onClose: () => void;
}) {
  const category = formatMaybe(place.category);
  const shortDescription = formatMaybe(place.short_description);
  const whyRecommended = formatMaybe(place.why_recommended);
  const whyPeopleGo = formatMaybe(place.why_people_go);
  const estimatedCost = formatMaybe(place.estimated_cost);
  const ticketPrice = formatMaybe(place.ticket_price);
  const bestTimeOfDay = formatMaybe(place.best_time_of_day);
  const address = formatMaybe(place.address);
  const addressParts = [place.city, place.country].filter(Boolean);

  return createPortal(
    <>
      <div
        className="rec-modal-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="rec-modal" role="dialog" aria-modal="true">
        <button
          className="rec-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="rec-modal-image-wrap">
          <PlaceImage
            src={place.image_url}
            alt={place.name}
            placeName={place.name}
            height={260}
          />
          <div className="rec-modal-image-overlay">
            <h2 className="rec-modal-title">{place.name}</h2>
            {category && <span className="rec-modal-cat">{category}</span>}
          </div>
        </div>

        <div className="rec-modal-body">
          {addressParts.length > 0 && (
            <p className="rec-modal-location">
              📍 {address ? `${address}, ` : ""}{addressParts.join(", ")}
            </p>
          )}

          {shortDescription && (
            <p className="rec-modal-desc">{shortDescription}</p>
          )}

          {whyRecommended && (
            <div className="rec-modal-section">
              <p className="rec-modal-section-label">Why recommended</p>
              <p className="rec-modal-section-text">{whyRecommended}</p>
            </div>
          )}

          {whyPeopleGo && (
            <div className="rec-modal-section">
              <p className="rec-modal-section-label">Why people go</p>
              <p className="rec-modal-section-text">{whyPeopleGo}</p>
            </div>
          )}

          {(place.highlights?.length ?? 0) > 0 && (
            <div className="rec-modal-section">
              <p className="rec-modal-section-label">Highlights</p>
              <ul className="rec-modal-highlights">
                {place.highlights!.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rec-modal-meta-grid">
            {place.rating && (
              <div className="rec-modal-meta-item">
                <span className="rec-modal-meta-label">Rating</span>
                <span className="rec-modal-meta-value">★ {place.rating}</span>
              </div>
            )}
            {place.reviews_count != null && (
              <div className="rec-modal-meta-item">
                <span className="rec-modal-meta-label">Reviews</span>
                <span className="rec-modal-meta-value">{place.reviews_count}</span>
              </div>
            )}
            {estimatedCost && (
              <div className="rec-modal-meta-item">
                <span className="rec-modal-meta-label">Est. cost</span>
                <span className="rec-modal-meta-value">{estimatedCost}</span>
              </div>
            )}
            {ticketPrice && (
              <div className="rec-modal-meta-item">
                <span className="rec-modal-meta-label">Ticket</span>
                <span className="rec-modal-meta-value">{ticketPrice}</span>
              </div>
            )}
            {place.visit_duration_minutes != null && (
              <div className="rec-modal-meta-item">
                <span className="rec-modal-meta-label">Visit time</span>
                <span className="rec-modal-meta-value">
                  {place.visit_duration_minutes < 60
                    ? `${place.visit_duration_minutes} min`
                    : `${Math.round(place.visit_duration_minutes / 60)} hr`}
                </span>
              </div>
            )}
            {bestTimeOfDay && (
              <div className="rec-modal-meta-item">
                <span className="rec-modal-meta-label">Best time</span>
                <span className="rec-modal-meta-value">{bestTimeOfDay}</span>
              </div>
            )}
          </div>

          {(place.best_season?.length ?? 0) > 0 && (
            <div className="rec-modal-section">
              <p className="rec-modal-section-label">Best season</p>
              <div className="rec-place-tags">
                {place.best_season!.map((s) => (
                  <span key={s} className="rec-place-tag">{s}</span>
                ))}
              </div>
            </div>
          )}

          {(place.tags?.length ?? 0) > 0 && (
            <div className="rec-modal-section">
              <p className="rec-modal-section-label">Tags</p>
              <div className="rec-place-tags">
                {place.tags!.map((t) => (
                  <span key={t} className="rec-place-tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {(place.audience?.length ?? 0) > 0 && (
            <div className="rec-modal-section">
              <p className="rec-modal-section-label">Great for</p>
              <div className="rec-place-tags">
                {place.audience!.map((a) => (
                  <span key={a} className="rec-place-tag">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

export function RecommendedPlacesList({
  places,
}: {
  places: RecommendedPlaceResponse[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<RecommendedPlaceResponse | null>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  if (!places.length) {
    return (
      <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.875rem" }}>
        No recommended places yet.
      </p>
    );
  }

  return (
    <>
      <div className="rec-places-wrapper">
        <div className="rec-places-header">
          <p className="rec-places-title">Recommended places</p>
          {places.length > 1 && (
            <div className="trips-scroll-arrows">
              <button
                className="trips-scroll-btn"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
              >
                ←
              </button>
              <button
                className="trips-scroll-btn"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
          )}
        </div>

        <div className="rec-places-scroll-wrapper">
          <div className="rec-places-scroll" ref={scrollRef}>
            {places.map((place) => {
              const category = formatMaybe(place.category);
              return (
                <button
                  key={place.id}
                  className="rec-place-card"
                  onClick={() => setSelected(place)}
                  aria-label={`View details for ${place.name}`}
                >
                  <div className="rec-place-img-wrapper">
                    <PlaceImage
                      src={place.image_url}
                      alt={place.name}
                      placeName={place.name}
                      height={160}
                    />
                    <div className="rec-place-img-overlay">
                      <span className="rec-place-name-overlay">{place.name}</span>
                      {category && (
                        <span className="rec-place-cat">{category}</span>
                      )}
                    </div>
                  </div>

                  <div className="rec-place-card-footer">
                    {[place.city, place.country].filter(Boolean).length > 0 && (
                      <span className="rec-place-footer-location">
                        📍 {[place.city, place.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {place.rating && (
                      <span className="rec-place-footer-rating">★ {place.rating}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="trips-edge-fade trips-edge-fade-left" />
          <div className="trips-edge-fade trips-edge-fade-right" />
        </div>
      </div>

      {selected && (
        <PlaceDetailModal place={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
