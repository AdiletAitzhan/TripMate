import { useState } from "react";

export interface Filters {
  ageMin?: number;
  ageMax?: number;
  budgetMin?: number;
  budgetMax?: number;
  toCity?: string;
  toCountry?: string;
  fromCity?: string;
  fromCountry?: string;
  gender?: string;
}

export interface FilterValues {
  mustHave: Filters;
  niceToHave: {};
}

interface AdvancedFilterSearchProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onClear: () => void;
}

export function AdvancedFilterSearch({
  filters,
  onFiltersChange,
  onClear,
}: AdvancedFilterSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<Filters>) => {
    onFiltersChange({
      ...filters,
      mustHave: { ...filters.mustHave, ...updates },
    });
  };

  const hasActiveFilters = () => {
    const { mustHave } = filters;
    return (
      !!mustHave.ageMin ||
      !!mustHave.ageMax ||
      !!mustHave.budgetMin ||
      !!mustHave.budgetMax ||
      !!mustHave.toCity ||
      !!mustHave.toCountry ||
      !!mustHave.fromCity ||
      !!mustHave.fromCountry ||
      !!mustHave.gender
    );
  };

  return (
    <div className="filter-search-container">
      <div className="filter-search-header">
        <button
          type="button"
          className="filter-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span className="filter-toggle-icon">{isExpanded ? "−" : "+"}</span>
          <span className="filter-toggle-text">Filters</span>
          {hasActiveFilters() && (
            <span className="filter-active-badge">Active</span>
          )}
        </button>
        {hasActiveFilters() && (
          <button
            type="button"
            className="btn btn-secondary filter-clear-btn"
            onClick={onClear}
          >
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filter-search-content">
          <div className="filter-section">
            <div className="filter-grid">
              {/* Age Range */}
              <div className="filter-field">
                <label className="filter-label">Age Range</label>
                <div className="filter-range-inputs">
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Min"
                    min="18"
                    max="99"
                    value={filters.mustHave.ageMin || ""}
                    onChange={(e) =>
                      updateFilters({
                        ageMin: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                  <span className="filter-range-separator">to</span>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Max"
                    min="18"
                    max="99"
                    value={filters.mustHave.ageMax || ""}
                    onChange={(e) =>
                      updateFilters({
                        ageMax: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* Budget Range */}
              <div className="filter-field">
                <label className="filter-label">Budget (USD)</label>
                <div className="filter-range-inputs">
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Min"
                    min="0"
                    value={filters.mustHave.budgetMin || ""}
                    onChange={(e) =>
                      updateFilters({
                        budgetMin: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                  <span className="filter-range-separator">to</span>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Max"
                    min="0"
                    value={filters.mustHave.budgetMax || ""}
                    onChange={(e) =>
                      updateFilters({
                        budgetMax: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* To City (Destination) */}
              <div className="filter-field">
                <label className="filter-label">City To (Destination)</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g., Paris"
                  value={filters.mustHave.toCity || ""}
                  onChange={(e) => updateFilters({ toCity: e.target.value })}
                />
              </div>

              {/* To Country */}
              <div className="filter-field">
                <label className="filter-label">Country To</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g., France"
                  value={filters.mustHave.toCountry || ""}
                  onChange={(e) => updateFilters({ toCountry: e.target.value })}
                />
              </div>

              {/* From City */}
              <div className="filter-field">
                <label className="filter-label">
                  Posted by person from (City)
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g., Almaty"
                  value={filters.mustHave.fromCity || ""}
                  onChange={(e) => updateFilters({ fromCity: e.target.value })}
                />
              </div>

              {/* From Country */}
              <div className="filter-field">
                <label className="filter-label">
                  Posted by person from (Country)
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g., Kazakhstan"
                  value={filters.mustHave.fromCountry || ""}
                  onChange={(e) =>
                    updateFilters({ fromCountry: e.target.value })
                  }
                />
              </div>

              {/* Gender Preference */}
              <div className="filter-field">
                <label className="filter-label">Gender Preference</label>
                <select
                  className="filter-input"
                  value={filters.mustHave.gender || ""}
                  onChange={(e) =>
                    updateFilters({ gender: e.target.value || undefined })
                  }
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
