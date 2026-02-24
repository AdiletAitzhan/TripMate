import { useState } from "react";

export interface MustHaveFilters {
  ageMin?: number;
  ageMax?: number;
  budgetMin?: number;
  budgetMax?: number;
  toCity?: string;
  toCountry?: string;
  fromCity?: string;
  fromCountry?: string;
  requiredInterests?: string[];
}

export interface NiceToHaveFilters {
  preferredInterests?: string[];
  approximateBudget?: boolean;
  flexibleAge?: boolean;
}

export interface FilterValues {
  mustHave: MustHaveFilters;
  niceToHave: NiceToHaveFilters;
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
  const [interestInput, setInterestInput] = useState("");
  const [niceInterestInput, setNiceInterestInput] = useState("");

  const updateMustHave = (updates: Partial<MustHaveFilters>) => {
    onFiltersChange({
      ...filters,
      mustHave: { ...filters.mustHave, ...updates },
    });
  };

  const updateNiceToHave = (updates: Partial<NiceToHaveFilters>) => {
    onFiltersChange({
      ...filters,
      niceToHave: { ...filters.niceToHave, ...updates },
    });
  };

  const addRequiredInterest = () => {
    const interest = interestInput.trim();
    if (interest && !filters.mustHave.requiredInterests?.includes(interest)) {
      updateMustHave({
        requiredInterests: [
          ...(filters.mustHave.requiredInterests || []),
          interest,
        ],
      });
      setInterestInput("");
    }
  };

  const removeRequiredInterest = (interest: string) => {
    updateMustHave({
      requiredInterests: filters.mustHave.requiredInterests?.filter(
        (i) => i !== interest,
      ),
    });
  };

  const addPreferredInterest = () => {
    const interest = niceInterestInput.trim();
    if (
      interest &&
      !filters.niceToHave.preferredInterests?.includes(interest)
    ) {
      updateNiceToHave({
        preferredInterests: [
          ...(filters.niceToHave.preferredInterests || []),
          interest,
        ],
      });
      setNiceInterestInput("");
    }
  };

  const removePreferredInterest = (interest: string) => {
    updateNiceToHave({
      preferredInterests: filters.niceToHave.preferredInterests?.filter(
        (i) => i !== interest,
      ),
    });
  };

  const hasActiveFilters = () => {
    const { mustHave, niceToHave } = filters;
    return (
      !!mustHave.ageMin ||
      !!mustHave.ageMax ||
      !!mustHave.budgetMin ||
      !!mustHave.budgetMax ||
      !!mustHave.toCity ||
      !!mustHave.toCountry ||
      !!mustHave.fromCity ||
      !!mustHave.fromCountry ||
      (mustHave.requiredInterests && mustHave.requiredInterests.length > 0) ||
      (niceToHave.preferredInterests &&
        niceToHave.preferredInterests.length > 0) ||
      !!niceToHave.approximateBudget ||
      !!niceToHave.flexibleAge
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
          <span className="filter-toggle-text">Advanced Filters</span>
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
          {/* Must Have Section */}
          <div className="filter-section">
            <div className="filter-section-header">
              <h3 className="filter-section-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                Must Have
              </h3>
              <p className="filter-section-desc">
                Required criteria — requests not matching will be hidden
              </p>
            </div>

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
                      updateMustHave({
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
                      updateMustHave({
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
                      updateMustHave({
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
                      updateMustHave({
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
                  onChange={(e) => updateMustHave({ toCity: e.target.value })}
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
                  onChange={(e) =>
                    updateMustHave({ toCountry: e.target.value })
                  }
                />
              </div>

              {/* From City */}
              <div className="filter-field">
                <label className="filter-label">From City</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g., Almaty"
                  value={filters.mustHave.fromCity || ""}
                  onChange={(e) => updateMustHave({ fromCity: e.target.value })}
                />
              </div>

              {/* From Country */}
              <div className="filter-field">
                <label className="filter-label">From Country</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g., Kazakhstan"
                  value={filters.mustHave.fromCountry || ""}
                  onChange={(e) =>
                    updateMustHave({ fromCountry: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Required Interests */}
            <div className="filter-field filter-field-full">
              <label className="filter-label">Required Interests</label>
              <div className="filter-tag-input">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Add interest and press Enter"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRequiredInterest();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addRequiredInterest}
                  disabled={!interestInput.trim()}
                >
                  Add
                </button>
              </div>
              {filters.mustHave.requiredInterests &&
                filters.mustHave.requiredInterests.length > 0 && (
                  <div className="filter-tags">
                    {filters.mustHave.requiredInterests.map((interest) => (
                      <span
                        key={interest}
                        className="filter-tag filter-tag-must"
                      >
                        {interest}
                        <button
                          type="button"
                          className="filter-tag-remove"
                          onClick={() => removeRequiredInterest(interest)}
                          aria-label={`Remove ${interest}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Nice to Have Section */}
          <div className="filter-section">
            <div className="filter-section-header">
              <h3 className="filter-section-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                Nice to Have
              </h3>
              <p className="filter-section-desc">
                Preferred criteria — approximate matches will be shown
              </p>
            </div>

            <div className="filter-grid">
              {/* Flexible Age */}
              <div className="filter-field filter-field-checkbox">
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={filters.niceToHave.flexibleAge || false}
                    onChange={(e) =>
                      updateNiceToHave({ flexibleAge: e.target.checked })
                    }
                  />
                  <span>Flexible Age Range (±5 years)</span>
                </label>
              </div>

              {/* Approximate Budget */}
              <div className="filter-field filter-field-checkbox">
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={filters.niceToHave.approximateBudget || false}
                    onChange={(e) =>
                      updateNiceToHave({ approximateBudget: e.target.checked })
                    }
                  />
                  <span>Approximate Budget Match (±20%)</span>
                </label>
              </div>
            </div>

            {/* Preferred Interests */}
            <div className="filter-field filter-field-full">
              <label className="filter-label">Preferred Interests</label>
              <div className="filter-tag-input">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Add interest and press Enter"
                  value={niceInterestInput}
                  onChange={(e) => setNiceInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPreferredInterest();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addPreferredInterest}
                  disabled={!niceInterestInput.trim()}
                >
                  Add
                </button>
              </div>
              {filters.niceToHave.preferredInterests &&
                filters.niceToHave.preferredInterests.length > 0 && (
                  <div className="filter-tags">
                    {filters.niceToHave.preferredInterests.map((interest) => (
                      <span
                        key={interest}
                        className="filter-tag filter-tag-nice"
                      >
                        {interest}
                        <button
                          type="button"
                          className="filter-tag-remove"
                          onClick={() => removePreferredInterest(interest)}
                          aria-label={`Remove ${interest}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
