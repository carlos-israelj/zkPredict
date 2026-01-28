import { useRouter } from 'next/router';
import { useState } from 'react';
import type { NextPageWithLayout } from '@/types';
import PlaceBet from '@/components/markets/PlaceBet';
import { Market, MarketCategory, CATEGORY_LABELS } from '@/types';
import Link from 'next/link';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';

// Mock data - In production, fetch from blockchain + backend
const MOCK_MARKETS: Record<string, Market> = {
  '1738097234_Bitcoin_100k': {
    marketId: '1738097234_Bitcoin_100k',
    creator: 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
    endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
    resolved: false,
    winningOutcome: 0,
    numOutcomes: 2,
    category: MarketCategory.Crypto,
    autoResolve: false,
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
  const { publicKey, requestTransaction } = useWallet();
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionOutcome, setResolutionOutcome] = useState(0);

  const market = id ? MOCK_MARKETS[id as string] : null;
  const pools = id ? MOCK_POOLS[id as string] || [] : [];

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
  const canResolve = market.creator === publicKey && !market.resolved;
  const canAutoResolve = market.autoResolve && isEnded && !market.resolved;

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Ended';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    return `${minutes} minutes`;
  };

  const handleResolveMarket = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    setIsResolving(true);

    try {
      const currentTime = Math.floor(Date.now() / 1000);

      const inputs = [
        market.marketId,
        `${resolutionOutcome}u8`,
        `${currentTime}u32`,
      ];

      const txResponse = await requestTransaction({
        programId: 'zkpredict.aleo',
        functionName: 'resolve_market',
        inputs,
        fee: 500000,
      });

      console.log('Market resolved:', txResponse);
      alert('Market resolved successfully!');

    } catch (error) {
      console.error('Error resolving market:', error);
      alert('Failed to resolve market. Please try again.');
    } finally {
      setIsResolving(false);
    }
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
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className={`badge badge-lg ${
                  market.category === MarketCategory.Crypto ? 'badge-warning' :
                  market.category === MarketCategory.Sports ? 'badge-success' :
                  market.category === MarketCategory.Politics ? 'badge-info' :
                  'badge-secondary'
                }`}>
                  {CATEGORY_LABELS[market.category]}
                </span>
                {market.resolved ? (
                  <span className="badge badge-accent badge-lg">Resolved</span>
                ) : isEnded ? (
                  <span className="badge badge-warning badge-lg">Pending Resolution</span>
                ) : (
                  <span className="badge badge-primary badge-lg">Active</span>
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
          {(canResolve || canAutoResolve) && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Resolve Market</h2>
                {canAutoResolve && (
                  <div className="alert alert-info mb-4">
                    <span>This market has auto-resolve enabled. Anyone can resolve it after the end time.</span>
                  </div>
                )}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Select Winning Outcome</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={resolutionOutcome}
                    onChange={(e) => setResolutionOutcome(Number(e.target.value))}
                  >
                    {market.outcomeLabels?.map((label, index) => (
                      <option key={index} value={index}>{label}</option>
                    ))}
                  </select>
                </div>
                <button
                  className={`btn btn-primary mt-4 ${isResolving ? 'loading' : ''}`}
                  onClick={handleResolveMarket}
                  disabled={isResolving}
                >
                  {isResolving ? 'Resolving...' : 'Resolve Market'}
                </button>
              </div>
            </div>
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
