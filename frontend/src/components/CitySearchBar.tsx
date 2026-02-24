import { useState, useRef, useEffect } from "react";

interface CitySearchBarProps {
  searchCity: string;
  onSearchCityChange: (city: string) => void;
  onOpenFilters: () => void;
  hasActiveFilters: boolean;
}

// Popular cities for suggestions
const POPULAR_CITIES = [
  "Paris",
  "London",
  "Tokyo",
  "New York",
  "Barcelona",
  "Rome",
  "Dubai",
  "Amsterdam",
  "Bangkok",
  "Istanbul",
  "Prague",
  "Vienna",
  "Berlin",
  "Madrid",
  "Los Angeles",
  "Singapore",
  "Sydney",
  "Almaty",
  "Astana",
  "Tbilisi",
];

export function CitySearchBar({
  searchCity,
  onSearchCityChange,
  onOpenFilters,
  hasActiveFilters,
}: CitySearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused) {
      if (!searchCity.trim()) {
        // Show all popular cities when empty
        setSuggestions(POPULAR_CITIES);
      } else {
        // Filter cities based on input
        const filtered = POPULAR_CITIES.filter((city) =>
          city.toLowerCase().includes(searchCity.toLowerCase()),
        );
        setSuggestions(filtered);
      }
    } else {
      setSuggestions([]);
    }
  }, [searchCity, isFocused]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (city: string) => {
    onSearchCityChange(city);
    setIsFocused(false);
  };

  const handleClear = () => {
    onSearchCityChange("");
    setIsFocused(true);
  };

  return (
    <div className="city-search-container" ref={searchRef}>
      <div className="city-search-bar">
        <svg
          className="search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>

        <input
          type="text"
          className="city-search-input"
          placeholder="Where do you want to go?"
          value={searchCity}
          onChange={(e) => onSearchCityChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />

        {searchCity && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}

        <button
          type="button"
          className={`filter-icon-btn ${hasActiveFilters ? "active" : ""}`}
          onClick={onOpenFilters}
          aria-label="Open filters"
          title="Advanced filters"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="8" cy="6" r="2" fill="currentColor" />
            <circle cx="16" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="18" r="2" fill="currentColor" />
          </svg>
          {hasActiveFilters && <span className="filter-active-dot" />}
        </button>
      </div>

      {isFocused && suggestions.length > 0 && (
        <div className="city-suggestions">
          <div className="city-suggestions-header">
            {searchCity ? "Matching Cities" : "Popular Destinations"}
          </div>
          <div className="city-suggestions-list">
            {suggestions.map((city) => (
              <button
                key={city}
                type="button"
                className="city-suggestion-item"
                onClick={() => handleSuggestionClick(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
