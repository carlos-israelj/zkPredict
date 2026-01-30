import { useState, useEffect } from 'react';
import type { NextPageWithLayout } from '@/types';
import MarketList from '@/components/markets/MarketList';
import CreateMarket from '@/components/markets/CreateMarket';
import { Market, MarketCategory } from '@/types';
import { useAllMarketsMetadata } from '@/hooks/useMarketMetadata';
import Link from 'next/link';

// Mock data for demonstration - In production, this would come from on-chain data + backend API
const MOCK_MARKETS: Market[] = [
  {
    marketId: '1738097234_Bitcoin_100k',
    creator: 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
    endTime: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
    resolved: false,
    winningOutcome: 0,
    numOutcomes: 2,
    category: MarketCategory.Crypto,
    autoResolve: false,
    title: 'Will Bitcoin reach $100k in 2025?',
    description: 'Market resolves YES if Bitcoin (BTC) trades at $100,000 or higher on any major exchange before Dec 31, 2025.',
    outcomeLabels: ['No', 'Yes'],
  },
  {
    marketId: '1738097235_World_Cup_Winner',
    creator: 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
    endTime: Math.floor(Date.now() / 1000) + 86400 * 60, // 60 days from now
    resolved: false,
    winningOutcome: 0,
    numOutcomes: 4,
    category: MarketCategory.Sports,
    autoResolve: false,
    title: 'Who will win the next World Cup?',
    description: 'Predict the winner of the upcoming FIFA World Cup tournament.',
    outcomeLabels: ['Brazil', 'Argentina', 'France', 'Other'],
  },
  {
    marketId: '1738097236_US_Election',
    creator: 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
    endTime: Math.floor(Date.now() / 1000) + 86400 * 90, // 90 days from now
    resolved: false,
    winningOutcome: 0,
    numOutcomes: 3,
    category: MarketCategory.Politics,
    autoResolve: true,
    title: 'US Presidential Election 2024 Outcome',
    description: 'Which party will win the 2024 US Presidential Election?',
    outcomeLabels: ['Democratic', 'Republican', 'Independent'],
  },
  {
    marketId: '1738097237_ETH_Upgrade',
    creator: 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
    endTime: Math.floor(Date.now() / 1000) + 86400 * 180, // 180 days from now
    resolved: false,
    winningOutcome: 0,
    numOutcomes: 2,
    category: MarketCategory.Crypto,
    autoResolve: false,
    title: 'Will Ethereum complete its next major upgrade on time?',
    description: 'Market resolves YES if the planned Ethereum upgrade is completed by the scheduled date without significant delays.',
    outcomeLabels: ['No', 'Yes'],
  },
  {
    marketId: '1738097238_Weather_Prediction',
    creator: 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
    endTime: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
    resolved: false,
    winningOutcome: 0,
    numOutcomes: 3,
    category: MarketCategory.Weather,
    autoResolve: true,
    title: 'Temperature in NYC next week',
    description: 'What will be the average high temperature in New York City next week?',
    outcomeLabels: ['Below 40°F', '40-60°F', 'Above 60°F'],
  },
];

// Mock pool data
const MOCK_POOLS = new Map<string, number[]>([
  ['1738097234_Bitcoin_100k', [3500000, 6500000]], // 3.5 credits NO, 6.5 credits YES
  ['1738097235_World_Cup_Winner', [2000000, 3000000, 4000000, 1000000]], // Multi-outcome
  ['1738097236_US_Election', [4500000, 4000000, 500000]],
  ['1738097237_ETH_Upgrade', [2000000, 5000000]],
  ['1738097238_Weather_Prediction', [1000000, 3000000, 1000000]],
]);

const MarketsPage: NextPageWithLayout = () => {
  const [showCreateMarket, setShowCreateMarket] = useState(false);
  const { markets: metadataMarkets, loading, error } = useAllMarketsMetadata();
  const [combinedMarkets, setCombinedMarkets] = useState<Market[]>(MOCK_MARKETS);

  // Combine metadata from backend with mock on-chain data
  useEffect(() => {
    if (!loading) {
      // Convert metadata from Supabase to Market objects
      const realMarkets = metadataMarkets.map(metadata => {
        // Try to detect category from title/description
        let category = MarketCategory.Other;
        const text = `${metadata.title} ${metadata.description}`.toLowerCase();

        if (text.includes('bitcoin') || text.includes('btc') || text.includes('ethereum') ||
            text.includes('eth') || text.includes('crypto') || text.includes('blockchain') ||
            text.includes('aleo') || text.includes('token')) {
          category = MarketCategory.Crypto;
        } else if (text.includes('sport') || text.includes('football') || text.includes('soccer') ||
                   text.includes('basketball') || text.includes('nfl') || text.includes('nba')) {
          category = MarketCategory.Sports;
        } else if (text.includes('election') || text.includes('president') || text.includes('politics') ||
                   text.includes('government')) {
          category = MarketCategory.Politics;
        } else if (text.includes('weather') || text.includes('temperature') || text.includes('rain') ||
                   text.includes('snow') || text.includes('climate')) {
          category = MarketCategory.Weather;
        }

        return {
          marketId: metadata.marketId,
          creator: 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
          endTime: Math.floor(Date.now() / 1000) + 86400 * 30, // Mock: 30 days from now
          resolved: false,
          winningOutcome: 0,
          numOutcomes: metadata.outcomeLabels.length,
          category,
          autoResolve: false,
          title: metadata.title,
          description: metadata.description,
          outcomeLabels: metadata.outcomeLabels,
        } as Market;
      });

      // Combine real markets from Supabase with mock demo markets
      setCombinedMarkets([...realMarkets, ...MOCK_MARKETS]);
    }
  }, [metadataMarkets, loading]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li>Markets</li>
        </ul>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Prediction Markets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and bet on outcomes with complete privacy powered by Aleo
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateMarket(!showCreateMarket)}
        >
          {showCreateMarket ? 'View Markets' : 'Create Market'}
        </button>
      </div>

      {/* Statistics */}
      <div className="stats stats-vertical lg:stats-horizontal shadow mb-8 w-full">
        <div className="stat">
          <div className="stat-title">Total Markets</div>
          <div className="stat-value">{loading ? '...' : combinedMarkets.length}</div>
          <div className="stat-desc">Across all categories</div>
        </div>
        <div className="stat">
          <div className="stat-title">Active Markets</div>
          <div className="stat-value">
            {loading ? '...' : combinedMarkets.filter(m => !m.resolved && Math.floor(Date.now() / 1000) < m.endTime).length}
          </div>
          <div className="stat-desc">Currently accepting bets</div>
        </div>
        <div className="stat">
          <div className="stat-title">Total Volume</div>
          <div className="stat-value">
            {(Array.from(MOCK_POOLS.values())
              .flat()
              .reduce((sum, pool) => sum + pool, 0) / 1_000_000
            ).toFixed(2)}
          </div>
          <div className="stat-desc">Credits locked</div>
        </div>
      </div>

      {/* Main Content */}
      {showCreateMarket ? (
        <CreateMarket />
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>Error loading markets: {error}</span>
        </div>
      ) : (
        <MarketList markets={combinedMarkets} poolsMap={MOCK_POOLS} />
      )}

      {/* Features Info */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Private Betting</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your bets are completely private using Aleo's zero-knowledge proofs. Only you know your positions.
            </p>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Multi-Outcome Markets</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Wave 3: Support for markets with 2-255 possible outcomes, not just binary YES/NO.
            </p>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Smart Categories</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Wave 4: Discover markets by category - Sports, Politics, Crypto, Weather, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
