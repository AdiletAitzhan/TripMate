import type { TripRequestResponse } from "../types/tripRequest";

interface TripCardProps {
  tripRequest?: TripRequestResponse;
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
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return `${days} day${days !== 1 ? 's' : ''}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TripCard({
  tripRequest,
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
  // Use tripRequest data if provided, otherwise fall back to legacy props
  const image = tripRequest 
    ? `https://source.unsplash.com/800x600/?${encodeURIComponent(tripRequest.destination.city || tripRequest.destination.country || 'travel')}`
    : legacyImage || '';
  const destination = tripRequest?.destination.city || legacyDestination || 'Unknown';
  const country = tripRequest?.destination.country || legacyCountry || '';
  const duration = tripRequest 
    ? calculateDuration(tripRequest.startDate, tripRequest.endDate)
    : legacyDuration || '';
  const price = tripRequest?.budget?.amount || legacyPrice || 0;
  const currency = tripRequest?.budget?.currency || 'USD';
  const matchCount = tripRequest?.matchCount || 0;
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
          <span>{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
        </div>
      )}
      <div className="trip-image-wrapper">
        <img
          src={image}
          alt={`${destination}, ${country}`}
          className="trip-image"
          loading="lazy"
        />
        {!tripRequest && (
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
              <span className="trip-date-value">{formatDate(tripRequest.startDate)}</span>
            </div>
            <div className="trip-date-item">
              <span className="trip-date-label">End:</span>
              <span className="trip-date-value">{formatDate(tripRequest.endDate)}</span>
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
                {currency === 'USD' ? '$' : currency + ' '}
                {price.toLocaleString()}
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
