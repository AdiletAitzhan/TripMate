import type { Filters, FilterValues } from "./AdvancedFilterSearch";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onClear: () => void;
  onApply?: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClear,
  onApply,
}: FilterModalProps) {
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
      (!!mustHave.gender && mustHave.gender.trim() !== "")
    );
  };

  const handleApply = () => {
    if (onApply) {
      onApply();
    }
    onClose();
  };

  const handleClear = () => {
    onClear();
    if (onApply) {
      onApply();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="filter-modal">
        <div className="filter-modal-header">
          <h2 className="filter-modal-title">Filters</h2>
          <button
            type="button"
            className="filter-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="filter-modal-content">
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

        <div className="filter-modal-footer">
          {hasActiveFilters() && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
            >
              Clear All
            </button>
          )}
          <div className="filter-modal-footer-spacer" />
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleApply}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
