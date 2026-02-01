import { MarketCategory, CATEGORY_LABELS } from '@/types';

interface CategoryFilterProps {
  selectedCategory: MarketCategory | 'all';
  onCategoryChange: (category: MarketCategory | 'all') => void;
}

// Subtle category accent colors for the active state indicator
const CATEGORY_ACCENTS: Record<MarketCategory | 'all', string> = {
  all: '#6366f1', // Indigo
  [MarketCategory.Sports]: '#10b981', // Emerald
  [MarketCategory.Politics]: '#3b82f6', // Blue
  [MarketCategory.Crypto]: '#f59e0b', // Amber
  [MarketCategory.Weather]: '#8b5cf6', // Purple
  [MarketCategory.Other]: '#ec4899', // Pink
};

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories: Array<{ id: MarketCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: MarketCategory.Sports, label: CATEGORY_LABELS[MarketCategory.Sports] },
    { id: MarketCategory.Politics, label: CATEGORY_LABELS[MarketCategory.Politics] },
    { id: MarketCategory.Crypto, label: CATEGORY_LABELS[MarketCategory.Crypto] },
    { id: MarketCategory.Weather, label: CATEGORY_LABELS[MarketCategory.Weather] },
    { id: MarketCategory.Other, label: CATEGORY_LABELS[MarketCategory.Other] },
  ];

  return (
    <div className="category-filter-wrapper">
      <style jsx>{`
        .category-filter-wrapper {
          display: inline-flex;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          padding: 0.25rem;
          flex-wrap: wrap;
          gap: 0.25rem;
          width: 100%;
        }

        @media (min-width: 640px) {
          .category-filter-wrapper {
            width: auto;
          }
        }

        .category-btn {
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
          color: var(--text-primary);
        }

        @media (min-width: 640px) {
          .category-btn {
            flex: 0 1 auto;
            min-width: 80px;
          }
        }

        .category-btn::before {
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

        .category-btn:hover:not(.active) {
          background: var(--bg-hover);
        }

        .category-btn.active {
          background: var(--bg-active);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .category-btn.active::before {
          transform: scaleX(1);
        }

        .category-label {
          position: relative;
          z-index: 1;
          white-space: nowrap;
        }

        /* Dark mode variables */
        @media (prefers-color-scheme: dark) {
          .category-filter-wrapper {
            --bg-secondary: rgba(255, 255, 255, 0.05);
            --bg-hover: rgba(255, 255, 255, 0.08);
            --bg-active: rgba(255, 255, 255, 0.1);
            --text-primary: rgba(255, 255, 255, 0.9);
          }
        }

        /* Light mode variables */
        @media (prefers-color-scheme: light) {
          .category-filter-wrapper {
            --bg-secondary: rgba(0, 0, 0, 0.04);
            --bg-hover: rgba(0, 0, 0, 0.06);
            --bg-active: rgba(255, 255, 255, 0.9);
            --text-primary: rgba(0, 0, 0, 0.9);
          }
        }

        /* DaisyUI theme support (overrides prefers-color-scheme) */
        [data-theme='dark'] .category-filter-wrapper {
          --bg-secondary: rgba(255, 255, 255, 0.05);
          --bg-hover: rgba(255, 255, 255, 0.08);
          --bg-active: rgba(255, 255, 255, 0.1);
          --text-primary: rgba(255, 255, 255, 0.9);
        }

        [data-theme='light'] .category-filter-wrapper {
          --bg-secondary: rgba(0, 0, 0, 0.04);
          --bg-hover: rgba(0, 0, 0, 0.06);
          --bg-active: rgba(255, 255, 255, 0.9);
          --text-primary: rgba(0, 0, 0, 0.9);
        }
      `}</style>

      {categories.map((category) => {
        const isActive = selectedCategory === category.id;
        const accentColor = CATEGORY_ACCENTS[category.id];

        return (
          <button
            key={category.id}
            className={`category-btn ${isActive ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
            style={{
              '--accent-color': accentColor,
            } as React.CSSProperties}
            aria-label={`Filter by ${category.label}`}
            aria-pressed={isActive}
          >
            <span className="category-label">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
