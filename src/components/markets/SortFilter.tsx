interface SortFilterProps {
  sortBy: 'newest' | 'ending-soon' | 'most-volume';
  onSortChange: (sort: 'newest' | 'ending-soon' | 'most-volume') => void;
}

// Color accents for different sort options
const SORT_ACCENTS: Record<'newest' | 'ending-soon' | 'most-volume', string> = {
  newest: '#3b82f6', // Blue - chronological
  'ending-soon': '#f59e0b', // Amber - urgency
  'most-volume': '#10b981', // Emerald - popularity/activity
};

export default function SortFilter({ sortBy, onSortChange }: SortFilterProps) {
  const sortOptions: Array<{ id: 'newest' | 'ending-soon' | 'most-volume'; label: string }> = [
    { id: 'newest', label: 'Newest' },
    { id: 'ending-soon', label: 'Ending Soon' },
    { id: 'most-volume', label: 'Volume' },
  ];

  return (
    <div className="sort-filter-wrapper">
      <style jsx>{`
        .sort-filter-wrapper {
          display: inline-flex;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 0.5rem;
          padding: 0.25rem;
          gap: 0.25rem;
          width: 100%;
        }

        @media (min-width: 640px) {
          .sort-filter-wrapper {
            width: auto;
          }
        }

        .sort-btn {
          position: relative;
          flex: 1 1 auto;
          min-width: 0;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 600;
          font-size: 0.875rem;
          line-height: 1.25rem;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          color: rgba(0, 0, 0, 0.9);
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .sort-btn {
            flex: 0 1 auto;
          }
        }

        .sort-btn::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent-color);
          transform: scaleX(0);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sort-btn:hover:not(.active) {
          background: rgba(0, 0, 0, 0.06);
        }

        .sort-btn.active {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .sort-btn.active::before {
          transform: scaleX(1);
        }

        .sort-label {
          position: relative;
          z-index: 1;
        }
      `}</style>

      {sortOptions.map((option) => {
        const isActive = sortBy === option.id;
        const accentColor = SORT_ACCENTS[option.id];

        return (
          <button
            key={option.id}
            className={`sort-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSortChange(option.id)}
            style={{
              '--accent-color': accentColor,
            } as React.CSSProperties}
            aria-label={`Sort by ${option.label}`}
            aria-pressed={isActive}
          >
            <span className="sort-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
