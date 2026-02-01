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

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const getCategoryBadgeStyle = (category: number) => {
    const styles = {
      0: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#059669' }, // Sports - Emerald
      1: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#2563eb' }, // Politics - Blue
      2: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#d97706' }, // Crypto - Amber
      3: { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', text: '#7c3aed' }, // Weather - Purple
      4: { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', text: '#db2777' }, // Other - Pink
    };
    return styles[category as keyof typeof styles] || styles[4];
  };

  // Calculate distribution percentages for visual representation
  const distribution = pools?.map(pool =>
    totalPool > 0 ? (pool / totalPool) * 100 : 0
  ) || [];

  // Get status badge with enhanced styling
  const getStatusBadge = () => {
    if (market.resolved) {
      return (
        <span
          className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1.5px solid #10b981',
            color: '#059669'
          }}
        >
          Resolved
        </span>
      );
    }
    if (isEnded) {
      return (
        <span
          className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid #ef4444',
            color: '#dc2626'
          }}
        >
          Ended
        </span>
      );
    }
    return (
      <span
        className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-1"
        style={{
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1.5px solid #6366f1',
          color: '#4f46e5'
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
        Live
      </span>
    );
  };

  return (
    <Link href={`/markets/${market.marketId}`}>
      <div className="group card bg-base-200 hover:bg-base-300 border-2 border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
        <div className="card-body p-5 gap-3">
          {/* Top meta row - status and time */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2 items-center">
              <span
                className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide"
                style={{
                  background: getCategoryBadgeStyle(market.category).bg,
                  border: `1.5px solid ${getCategoryBadgeStyle(market.category).border}`,
                  color: getCategoryBadgeStyle(market.category).text
                }}
              >
                {CATEGORY_LABELS[market.category]}
              </span>
              {getStatusBadge()}
            </div>
            <span className="text-xs font-bold opacity-60 tabular-nums">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>

          {/* Title - big and bold like Polymarket */}
          <h3 className="font-display text-lg font-bold line-clamp-2 leading-tight min-h-[3rem]">
            {market.title || `Market ${market.marketId.substring(0, 8)}...`}
          </h3>

          {/* Description - subtle */}
          {market.description && (
            <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">
              {market.description}
            </p>
          )}

          {/* Outcomes - MAIN FOCUS like Polymarket */}
          {market.outcomeLabels && distribution.length > 0 && (
            <div className="space-y-2 my-2">
              {market.outcomeLabels.map((label, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    market.resolved && market.winningOutcome === index
                      ? 'bg-success/10 border-success'
                      : 'bg-base-100 border-base-content/10 hover:border-primary/30'
                  }`}
                >
                  <span className="font-semibold text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`text-2xl font-black tabular-nums ${
                        market.resolved && market.winningOutcome === index
                          ? 'text-success'
                          : 'text-primary'
                      }`}>
                        {distribution[index].toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pool value - secondary info */}
          <div className="flex items-center justify-between pt-2 border-t-2 border-base-300">
            <span className="text-xs font-bold uppercase tracking-wide opacity-50">Volume</span>
            <span className="text-sm font-bold tabular-nums">
              {(totalPool / 1_000_000).toFixed(2)} <span className="text-xs opacity-50">credits</span>
            </span>
          </div>

          {/* Winner badge for resolved markets */}
          {market.resolved && market.outcomeLabels && (
            <div className="alert alert-success py-2 text-xs font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Winner: {market.outcomeLabels[market.winningOutcome]}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
