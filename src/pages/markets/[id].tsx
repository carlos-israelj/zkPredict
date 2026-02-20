import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import type { NextPageWithLayout } from '@/types';
import PlaceBet from '@/components/markets/PlaceBet';
import ResolveMarket from '@/components/markets/ResolveMarket';
import ClaimWinnings from '@/components/markets/ClaimWinnings';
import { Market, MarketCategory, CATEGORY_LABELS } from '@/types';
import Link from 'next/link';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { useMarketMetadata } from '@/hooks/useMarketMetadata';
import { useOnChainMarketPolling } from '@/hooks/useOnChainMarket';
import { MarketDetailSkeleton } from '@/components/ui/SkeletonLoader';

// Mock data - In production, fetch from blockchain + backend
const MOCK_MARKETS: Record<string, Market> = {
  '1738097234_Bitcoin_100k': {
    marketId: '1738097234_Bitcoin_100k',
    creator: 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
    createdAt: 0,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
    resolved: false,
    winningOutcome: 0,
    numOutcomes: 2,
    category: MarketCategory.Crypto,
    autoResolve: false,
    totalPool: 0,
    title: 'Will Bitcoin reach $100k in 2025?',
    description: 'Market resolves YES if Bitcoin (BTC) trades at $100,000 or higher on any major exchange before Dec 31, 2025. Resolution will be based on CoinMarketCap or CoinGecko data.',
    outcomeLabels: ['No', 'Yes'],
  },
};

const MOCK_POOLS: Record<string, number[]> = {
  '1738097234_Bitcoin_100k': [3500000, 6500000],
};

const MarketDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const { address } = useWallet();
  const [combinedMarket, setCombinedMarket] = useState<Market | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch metadata from backend
  const { metadata, loading: metadataLoading } = useMarketMetadata(id as string);

  // Fetch on-chain data (polls every 30 seconds)
  const {
    market: onChainMarket,
    pools: onChainPools,
    loading: onChainLoading,
    lastUpdate
  } = useOnChainMarketPolling(id as string, 30000);

  // Combine metadata and on-chain data
  useEffect(() => {
    if (!id) return;

    // Priority: on-chain data > metadata > mock data
    if (onChainMarket && metadata) {
      // Combine on-chain state with off-chain metadata
      setCombinedMarket({
        marketId: id as string,
        creator: onChainMarket.creator,
        createdAt: onChainMarket.created_at ?? 0,
        endTime: onChainMarket.end_time,
        resolved: onChainMarket.resolved,
        winningOutcome: onChainMarket.winning_outcome,
        numOutcomes: onChainMarket.num_outcomes,
        category: onChainMarket.category as MarketCategory,
        autoResolve: onChainMarket.auto_resolve,
        totalPool: onChainMarket.total_pool ?? 0,
        title: metadata.title,
        description: metadata.description,
        outcomeLabels: metadata.outcomeLabels,
      });
    } else if (metadata) {
      // Only metadata available, use mock on-chain data
      setCombinedMarket({
        marketId: id as string,
        creator: 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
        createdAt: 0,
        endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
        resolved: false,
        winningOutcome: 0,
        numOutcomes: metadata.outcomeLabels.length,
        category: MarketCategory.Other,
        autoResolve: false,
        totalPool: 0,
        title: metadata.title,
        description: metadata.description,
        outcomeLabels: metadata.outcomeLabels,
      });
    } else if (MOCK_MARKETS[id as string]) {
      // Fall back to mock data
      setCombinedMarket(MOCK_MARKETS[id as string]);
    }
  }, [id, onChainMarket, metadata]);

  const market = combinedMarket;
  const pools = onChainPools.yes_pool > 0 || onChainPools.no_pool > 0
    ? [onChainPools.no_pool, onChainPools.yes_pool]
    : (id ? MOCK_POOLS[id as string] || [] : []);

  if (metadataLoading || onChainLoading) {
    return <MarketDetailSkeleton />;
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
          <Link href="/markets" className="btn btn-primary">
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const totalPool = pools.reduce((sum, pool) => sum + pool, 0);
  const now = Math.floor(Date.now() / 1000);
  const isEnded = now >= market.endTime;
  const timeRemaining = market.endTime - now;

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Ended';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    return `${minutes} minutes`;
  };

  // Refresh market data after resolution or claim
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/markets">Markets</Link></li>
          <li>{market.title?.substring(0, 30) || 'Market'}</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Header */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <span
                  className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide"
                  style={{
                    background: (() => {
                      const styles = {
                        [MarketCategory.Sports]: 'rgba(16, 185, 129, 0.15)',
                        [MarketCategory.Politics]: 'rgba(59, 130, 246, 0.15)',
                        [MarketCategory.Crypto]: 'rgba(245, 158, 11, 0.15)',
                        [MarketCategory.Weather]: 'rgba(139, 92, 246, 0.15)',
                        [MarketCategory.Other]: 'rgba(236, 72, 153, 0.15)',
                      };
                      return styles[market.category] || styles[MarketCategory.Other];
                    })(),
                    border: (() => {
                      const borders = {
                        [MarketCategory.Sports]: '2px solid #10b981',
                        [MarketCategory.Politics]: '2px solid #3b82f6',
                        [MarketCategory.Crypto]: '2px solid #f59e0b',
                        [MarketCategory.Weather]: '2px solid #8b5cf6',
                        [MarketCategory.Other]: '2px solid #ec4899',
                      };
                      return borders[market.category] || borders[MarketCategory.Other];
                    })(),
                    color: (() => {
                      const colors = {
                        [MarketCategory.Sports]: '#059669',
                        [MarketCategory.Politics]: '#2563eb',
                        [MarketCategory.Crypto]: '#d97706',
                        [MarketCategory.Weather]: '#7c3aed',
                        [MarketCategory.Other]: '#db2777',
                      };
                      return colors[market.category] || colors[MarketCategory.Other];
                    })()
                  }}
                >
                  {CATEGORY_LABELS[market.category]}
                </span>
                {market.resolved ? (
                  <span
                    className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide"
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '2px solid #10b981',
                      color: '#059669'
                    }}
                  >
                    Resolved
                  </span>
                ) : isEnded ? (
                  <span
                    className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide"
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '2px solid #f59e0b',
                      color: '#d97706'
                    }}
                  >
                    Pending Resolution
                  </span>
                ) : (
                  <span
                    className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center gap-2"
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '2px solid #6366f1',
                      color: '#4f46e5'
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    Active
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4">{market.title}</h1>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {market.description}
              </p>

              {/* Market Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat bg-base-300 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Pool</div>
                  <div className="stat-value text-lg">{(totalPool / 1_000_000).toFixed(2)}</div>
                  <div className="stat-desc">credits</div>
                </div>
                <div className="stat bg-base-300 rounded-lg p-4">
                  <div className="stat-title text-xs">Outcomes</div>
                  <div className="stat-value text-lg">{market.numOutcomes}</div>
                  <div className="stat-desc">options</div>
                </div>
                <div className="stat bg-base-300 rounded-lg p-4">
                  <div className="stat-title text-xs">Ends In</div>
                  <div className="stat-value text-sm">{formatTimeRemaining(timeRemaining)}</div>
                  <div className="stat-desc">{new Date(market.endTime * 1000).toLocaleDateString()}</div>
                </div>
                <div className="stat bg-base-300 rounded-lg p-4">
                  <div className="stat-title text-xs">Auto-Resolve</div>
                  <div className="stat-value text-lg">{market.autoResolve ? 'Yes' : 'No'}</div>
                  <div className="stat-desc">Wave 2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Distribution */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Current Distribution</h2>
              <div className="space-y-4">
                {market.outcomeLabels?.map((label, index) => {
                  const pool = pools[index] || 0;
                  const percentage = totalPool > 0 ? (pool / totalPool) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">{label}</span>
                        <span>{(pool / 1_000_000).toFixed(2)} credits ({percentage.toFixed(1)}%)</span>
                      </div>
                      <progress
                        className={`progress ${market.resolved && market.winningOutcome === index ? 'progress-success' : 'progress-primary'} w-full`}
                        value={percentage}
                        max="100"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resolution Section (Wave 2) */}
          {!market.resolved && (
            <ResolveMarket market={market} onResolved={handleRefresh} />
          )}

          {/* Claim Winnings Section (Wave 2) */}
          {market.resolved && (
            <ClaimWinnings market={market} onClaimed={handleRefresh} />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <PlaceBet market={market} pools={pools} />
        </div>
      </div>
    </div>
  );
};

export default MarketDetailPage;
