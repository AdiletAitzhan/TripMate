import type { RecommendedPlaceResponse } from "../types/tripPlan";

function formatMaybe(s: string | null | undefined): string | null {
  if (s == null) return null;
  const v = String(s).trim();
  return v ? v : null;
}

export function RecommendedPlacesList({
  places,
}: {
  places: RecommendedPlaceResponse[];
}) {
  if (!places.length) {
    return (
      <p style={{ color: "var(--text-muted)", margin: 0 }}>
        No recommended places yet.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        marginTop: 16,
      }}
    >
      {places.map((place) => {
        const category = formatMaybe(place.category);
        const shortDescription = formatMaybe(place.short_description);
        const whyRecommended = formatMaybe(place.why_recommended);
        const addressParts = [place.city, place.country].filter(Boolean);

        return (
          <div
            key={place.id}
            className="card-premium"
            style={{
              padding: 16,
              background: "var(--card-bg)",
            }}
          >
            {place.image_url && (
              <img
                src={place.image_url}
                alt={place.name}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 12,
                  marginBottom: 12,
                  border: "1px solid var(--border)",
                }}
              />
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {place.name}
                </h3>
                {(addressParts.length > 0 || category) && (
                  <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
                    {[
                      ...(category ? [category] : []),
                      ...(addressParts.length ? [addressParts.join(", ")] : []),
                    ].join(" · ")}
                  </p>
                )}
              </div>
            </div>

            {(shortDescription || whyRecommended) && (
              <div style={{ marginTop: 10 }}>
                {shortDescription && (
                  <p
                    style={{
                      margin: "0 0 10px",
                      color: "var(--text)",
                      lineHeight: 1.6,
                      fontSize: "0.9375rem",
                    }}
                  >
                    {shortDescription}
                  </p>
                )}
                {whyRecommended && (
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {whyRecommended}
                  </p>
                )}
              </div>
            )}

            {(place.tags?.length ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 14,
                }}
              >
                {place.tags!.slice(0, 6).map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                      background: "rgba(13, 92, 99, 0.08)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {(place.rating || place.reviews_count != null) && (
              <div style={{ marginTop: 14 }}>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {place.rating ? `Rating: ${place.rating}` : ""}
                  {place.rating && place.reviews_count != null ? " · " : ""}
                  {place.reviews_count != null
                    ? `Reviews: ${place.reviews_count}`
                    : ""}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

