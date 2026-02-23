import { useState } from "react";

export function TripSearch() {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState("2");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log({ destination, date, travelers });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="trip-search-form"
      data-aos="fade-up"
    >
      <div className="trip-search-inputs">
        <div className="trip-search-field">
          <input
            type="text"
            placeholder="Where do you want to go?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="trip-search-input"
            aria-label="Destination"
          />
        </div>
        <div className="trip-search-field">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="trip-search-input"
            aria-label="Travel date"
          />
        </div>
        <div className="trip-search-field">
          <select
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            className="trip-search-input"
            aria-label="Number of travelers"
          >
            <option value="1">1 Traveler</option>
            <option value="2">2 Travelers</option>
            <option value="3">3 Travelers</option>
            <option value="4">4 Travelers</option>
            <option value="5+">5+ Travelers</option>
          </select>
        </div>
        <button
          type="submit"
          className="trip-search-button"
          aria-label="Search trips"
        >
          Search
        </button>
      </div>
    </form>
  );
}
