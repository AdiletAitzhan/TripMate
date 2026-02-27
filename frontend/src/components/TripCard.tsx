import type {
  TripRequestResponse,
  TripVacancyResponse,
} from "../types/tripRequest";

interface TripCardProps {
  tripRequest?: TripRequestResponse;
  tripVacancy?: TripVacancyResponse;
  onOfferClick?: () => void;
  // Legacy props for backward compatibility
  image?: string;
  destination?: string;
  country?: string;
  duration?: string;
  price?: number;
  travelers?: number;
  rating?: number;
  featured?: boolean;
  trending?: boolean;
}

function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return `${days} day${days !== 1 ? "s" : ""}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Generate a consistent color based on destination name
function getDestinationColor(destination: string): string {
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)",
  ];

  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    hash = destination.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function TripCard({
  tripRequest,
  tripVacancy,
  onOfferClick,
  image: legacyImage,
  destination: legacyDestination,
  country: legacyCountry,
  duration: legacyDuration,
  price: legacyPrice,
  travelers: legacyTravelers,
  rating = 4.5,
  featured = false,
  trending = false,
}: TripCardProps) {
  // Use tripVacancy or tripRequest data if provided, otherwise fall back to legacy props
  const destination =
    tripVacancy?.destination_city ||
    tripRequest?.destination.city ||
    legacyDestination ||
    "Unknown";
  const country =
    tripVacancy?.destination_country ||
    tripRequest?.destination.country ||
    legacyCountry ||
    "";

  const duration = tripVacancy
    ? calculateDuration(tripVacancy.start_date, tripVacancy.end_date)
    : tripRequest
      ? calculateDuration(tripRequest.startDate, tripRequest.endDate)
      : legacyDuration || "";

  const price = tripVacancy?.max_budget
    ? Number(tripVacancy.max_budget)
    : tripRequest?.budget?.amount || legacyPrice || 0;

  const currency = tripVacancy ? "KZT" : tripRequest?.budget?.currency || "USD";
  const matchCount = tripRequest?.matchCount || 0;
  const peopleNeeded = tripVacancy?.people_needed;

  // Generate gradient background based on destination
  const backgroundGradient = getDestinationColor(destination);
  return (
    <div
      className={`trip-card ${featured ? "trip-card-featured" : ""}`}
      data-aos="fade-up"
    >
      {trending && (
        <div className="trip-badge trending">
          <span>Trending</span>
        </div>
      )}
      {featured && (
        <div className="trip-badge featured">
          <span>Featured</span>
        </div>
      )}
      {tripRequest && matchCount > 0 && (
        <div className="trip-badge featured">
          <span>
            {matchCount} match{matchCount !== 1 ? "es" : ""}
          </span>
        </div>
      )}
      {tripVacancy && peopleNeeded && (
        <div className="trip-badge featured">
          <span>
            {peopleNeeded} spot{peopleNeeded !== 1 ? "s" : ""} available
          </span>
        </div>
      )}
      <div className="trip-image-wrapper">
        <div
          className="trip-image"
          style={{
            background: backgroundGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2.5rem",
            fontWeight: "700",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            minHeight: "200px",
          }}
        >
          {destination.charAt(0).toUpperCase()}
        </div>
        {!tripRequest && !tripVacancy && (
          <div className="trip-overlay">
            <div className="trip-rating">
              <span className="trip-rating-value">{rating}</span>
              <span className="trip-rating-stars">★★★★★</span>
            </div>
          </div>
        )}
      </div>
      <div className="trip-content">
        <div className="trip-location">
          <span className="trip-destination">{destination}</span>
          <span className="trip-country">{country}</span>
        </div>
        {tripRequest && (
          <div className="trip-dates">
            <div className="trip-date-item">
              <span className="trip-date-label">Start:</span>
              <span className="trip-date-value">
                {formatDate(tripRequest.startDate)}
              </span>
            </div>
            <div className="trip-date-item">
              <span className="trip-date-label">End:</span>
              <span className="trip-date-value">
                {formatDate(tripRequest.endDate)}
              </span>
            </div>
          </div>
        )}
        {tripVacancy && (
          <div className="trip-dates">
            <div className="trip-date-item">
              <span className="trip-date-label">Start:</span>
              <span className="trip-date-value">
                {formatDate(tripVacancy.start_date)}
              </span>
            </div>
            <div className="trip-date-item">
              <span className="trip-date-label">End:</span>
              <span className="trip-date-value">
                {formatDate(tripVacancy.end_date)}
              </span>
            </div>
          </div>
        )}
        <div className="trip-details">
          <div className="trip-detail-item">
            <span>{duration}</span>
          </div>
          {!tripRequest && legacyTravelers && (
            <div className="trip-detail-item">
              <span>{legacyTravelers} travelers</span>
            </div>
          )}
        </div>
        <div className="trip-footer">
          {price > 0 && (
            <div className="trip-price">
              <span className="trip-price-amount">
                {currency === "USD" ? "$" : currency + " "}
                {price.toLocaleString()}
                {tripVacancy && onOfferClick && (
                  <button
                    className="trip-book-btn"
                    onClick={onOfferClick}
                    aria-label={`Offer to join trip to ${destination}`}
                  >
                    Offer to Join
                  </button>
                )}{" "}
              </span>
              <span className="trip-price-label">budget</span>
            </div>
          )}
          {tripRequest && onOfferClick && (
            <button
              className="trip-book-btn"
              onClick={onOfferClick}
              aria-label={`Offer to join trip to ${destination}`}
            >
              Offer to Join
            </button>
          )}
          {!tripRequest && (
            <button
              className="trip-book-btn"
              aria-label={`Book trip to ${destination}`}
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
