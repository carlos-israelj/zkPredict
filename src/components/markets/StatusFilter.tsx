interface StatusFilterProps {
  filterStatus: 'all' | 'active' | 'ended' | 'resolved';
  onStatusChange: (status: 'all' | 'active' | 'ended' | 'resolved') => void;
}

// Color accents for different statuses
const STATUS_ACCENTS: Record<'all' | 'active' | 'ended' | 'resolved', string> = {
  all: '#6366f1', // Indigo - neutral
  active: '#10b981', // Emerald - live/positive
  ended: '#f59e0b', // Amber - warning/transition
  resolved: '#8b5cf6', // Purple - completed
};

export default function StatusFilter({ filterStatus, onStatusChange }: StatusFilterProps) {
  const statuses: Array<{ id: 'all' | 'active' | 'ended' | 'resolved'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'ended', label: 'Ended' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="status-filter-wrapper">
      <style jsx>{`
        .status-filter-wrapper {
          display: inline-flex;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 0.5rem;
          padding: 0.25rem;
          gap: 0.25rem;
          width: 100%;
        }

        @media (min-width: 640px) {
          .status-filter-wrapper {
            width: auto;
          }
        }

        .status-btn {
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
        }

        @media (min-width: 640px) {
          .status-btn {
            flex: 0 1 auto;
          }
        }

        .status-btn::before {
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

        .status-btn:hover:not(.active) {
          background: rgba(0, 0, 0, 0.06);
        }

        .status-btn.active {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .status-btn.active::before {
          transform: scaleX(1);
        }

        .status-label {
          position: relative;
          z-index: 1;
          white-space: nowrap;
        }
      `}</style>

      {statuses.map((status) => {
        const isActive = filterStatus === status.id;
        const accentColor = STATUS_ACCENTS[status.id];

        return (
          <button
            key={status.id}
            className={`status-btn ${isActive ? 'active' : ''}`}
            onClick={() => onStatusChange(status.id)}
            style={{
              '--accent-color': accentColor,
            } as React.CSSProperties}
            aria-label={`Filter by ${status.label}`}
            aria-pressed={isActive}
          >
            <span className="status-label">{status.label}</span>
          </button>
        );
      })}
    </div>
  );
}
