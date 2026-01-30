import { useState, useEffect } from 'react';
import type { NextPageWithLayout } from '@/types';
import MarketList from '@/components/markets/MarketList';
import CreateMarket from '@/components/markets/CreateMarket';
import { Market, MarketCategory } from '@/types';
import { useAllMarketsMetadata } from '@/hooks/useMarketMetadata';
import { fetchMarketOnChain } from '@/lib/aleo';
import Link from 'next/link';

// No mock markets in production - only show real markets created by users

const MarketsPage: NextPageWithLayout = () => {
  const [showCreateMarket, setShowCreateMarket] = useState(false);
  const { markets: metadataMarkets, loading, error } = useAllMarketsMetadata();
  const [combinedMarkets, setCombinedMarkets] = useState<Market[]>([]);

  // Combine metadata from backend with on-chain data
  useEffect(() => {
    if (!loading) {
      // Load on-chain state for each market
      const loadMarketsWithOnChainData = async () => {
        const marketsWithOnChainData = await Promise.all(
          metadataMarkets.map(async (metadata) => {
            // Fetch on-chain state
            const onChainMarket = await fetchMarketOnChain(metadata.marketId);

            // Try to detect category from title/description if not on-chain
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

            // Combine on-chain data with metadata
            return {
              marketId: metadata.marketId,
              creator: onChainMarket?.creator || 'aleo1tgk48pzlz2xws2ed8880ajqfcs0c750gmjm8dvf3u7g2mer8gcysxj8war',
              endTime: onChainMarket?.end_time || Math.floor(Date.now() / 1000) + 86400 * 30,
              resolved: onChainMarket?.resolved || false,
              winningOutcome: onChainMarket?.winning_outcome || 0,
              numOutcomes: onChainMarket?.num_outcomes || metadata.outcomeLabels.length,
              category: onChainMarket?.category ?? category,
              autoResolve: onChainMarket?.auto_resolve || false,
              title: metadata.title,
              description: metadata.description,
              outcomeLabels: metadata.outcomeLabels,
            } as Market;
          })
        );

        setCombinedMarkets(marketsWithOnChainData);
      };

      loadMarketsWithOnChainData();
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
            0.00
          </div>
          <div className="stat-desc">Credits locked (Coming soon)</div>
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
        <MarketList markets={combinedMarkets} />
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
