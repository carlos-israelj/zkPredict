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
      <div className="group relative card bg-base-300 border border-glow hover:border-cyan-500/50 transition-all duration-300 cursor-pointer h-full overflow-hidden">
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Cyber grid background */}
        <div className="absolute inset-0 cyber-grid opacity-30" />

        <div className="card-body relative z-10">
          {/* Header with category and status */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex gap-2 flex-wrap">
              <span className={`badge ${getCategoryBadgeColor(market.category)} border-0 font-medium`}>
                {CATEGORY_LABELS[market.category]}
              </span>
              {getStatusBadge()}
            </div>
            <span className="badge badge-ghost border border-base-content/20 text-xs font-mono">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-xl font-bold line-clamp-2 min-h-[3.5rem] mb-2 group-hover:text-cyan-400 transition-colors duration-300">
            {market.title || `Market ${market.marketId.substring(0, 8)}...`}
          </h3>

          {/* Description */}
          {market.description && (
            <p className="text-sm text-base-content/70 line-clamp-2 mb-4 font-light">
              {market.description}
            </p>
          )}

          {/* Pool Information with enhanced styling */}
          <div className="mt-auto pt-4 border-t border-base-content/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-base-content/60">Total Pool</span>
              <span className="font-display text-2xl font-bold gradient-text-cyan">
                {(totalPool / 1_000_000).toFixed(2)}
              </span>
            </div>
            <div className="text-[10px] text-base-content/50 text-right font-mono -mt-2 mb-3">CREDITS</div>

            {/* Outcome Distribution with enhanced bars */}
            {market.outcomeLabels && distribution.length > 0 && (
              <div className="space-y-3 mt-4">
                {market.outcomeLabels.map((label, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-base-content/80">{label}</span>
                      <span className="font-mono font-semibold text-cyan-400">{distribution[index].toFixed(1)}%</span>
                    </div>
                    <div className="relative w-full bg-base-100/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 relative ${
                          market.resolved && market.winningOutcome === index
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 glow-emerald'
                            : 'bg-gradient-to-r from-cyan-400 to-cyan-500'
                        }`}
                        style={{ width: `${distribution[index]}%` }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 shimmer opacity-50" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved Outcome with enhanced styling */}
          {market.resolved && market.outcomeLabels && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-emerald-400">
                  Winner: <span className="font-bold">{market.outcomeLabels[market.winningOutcome]}</span>
                </span>
              </div>
            </div>
          )}

          {/* Auto-resolve indicator with enhanced design */}
          {!market.resolved && market.autoResolve && (
            <div className="flex items-center gap-2 mt-3 text-xs text-base-content/50 font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>AUTO-RESOLVE ENABLED</span>
            </div>
          )}

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </Link>
  );
}
