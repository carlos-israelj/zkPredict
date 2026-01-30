import { Market, CATEGORY_LABELS } from '@/types';
import Link from 'next/link';

interface MarketCardProps {
  market: Market;
  pools?: number[];
}

export default function MarketCard({ market, pools }: MarketCardProps) {
  const totalPool = pools?.reduce((sum, pool) => sum + pool, 0) || 0;
  const now = Math.floor(Date.now() / 1000);
  const isEnded = now >= market.endTime;
  const timeRemaining = market.endTime - now;

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Ended';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getCategoryBadgeColor = (category: number): string => {
    const colors = {
      0: 'badge-success', // Sports
      1: 'badge-info', // Politics
      2: 'badge-warning', // Crypto
      3: 'badge-primary', // Weather
      4: 'badge-secondary', // Other
    };
    return colors[category as keyof typeof colors] || 'badge-secondary';
  };

  // Calculate distribution percentages for visual representation
  const distribution = pools?.map(pool =>
    totalPool > 0 ? (pool / totalPool) * 100 : 0
  ) || [];

  // Get status badge
  const getStatusBadge = () => {
    if (market.resolved) {
      return <span className="badge badge-success">Resolved</span>;
    }
    if (isEnded) {
      return <span className="badge badge-error">Ended</span>;
    }
    return <span className="badge badge-primary">Active</span>;
  };

  return (
    <Link href={`/markets/${market.marketId}`}>
      <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
        <div className="card-body">
          {/* Header with category and status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex gap-2">
              <span className={`badge ${getCategoryBadgeColor(market.category)}`}>
                {CATEGORY_LABELS[market.category]}
              </span>
              {getStatusBadge()}
            </div>
            <span className="badge badge-ghost text-xs">{formatTimeRemaining(timeRemaining)}</span>
          </div>

          {/* Title */}
          <h3 className="card-title text-lg line-clamp-2 min-h-[3.5rem]">
            {market.title || `Market ${market.marketId.substring(0, 8)}...`}
          </h3>

          {/* Description */}
          {market.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {market.description}
            </p>
          )}

          {/* Pool Information */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Total Pool</span>
              <span className="text-lg font-bold">{(totalPool / 1_000_000).toFixed(2)} credits</span>
            </div>

            {/* Outcome Distribution (Wave 3: Multi-outcome support) */}
            {market.outcomeLabels && distribution.length > 0 && (
              <div className="space-y-2 mt-3">
                {market.outcomeLabels.map((label, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{label}</span>
                      <span>{distribution[index].toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          market.resolved && market.winningOutcome === index
                            ? 'bg-success'
                            : 'bg-primary'
                        }`}
                        style={{ width: `${distribution[index]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved Outcome */}
          {market.resolved && market.outcomeLabels && (
            <div className="alert alert-success mt-4">
              <span className="text-sm">
                <strong>Winner:</strong> {market.outcomeLabels[market.winningOutcome]}
              </span>
            </div>
          )}

          {/* Auto-resolve indicator (Wave 2) */}
          {!market.resolved && market.autoResolve && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Auto-resolves after end time</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
