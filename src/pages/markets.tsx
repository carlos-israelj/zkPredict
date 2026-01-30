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
      <div className="text-sm breadcrumbs mb-6 font-mono">
        <ul className="text-base-content/60">
          <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
          <li className="text-cyan-400">Markets</li>
        </ul>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="font-display text-5xl font-bold mb-2 gradient-text-cyan">Prediction Markets</h1>
          <p className="text-base-content/70 text-lg">
            Discover and bet on outcomes with complete privacy powered by Aleo
          </p>
        </div>
        <button
          className="btn btn-primary border-0 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 font-bold transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
          onClick={() => setShowCreateMarket(!showCreateMarket)}
        >
          {showCreateMarket ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              View Markets
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Market
            </>
          )}
        </button>
      </div>

      {/* Simple stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card bg-base-200 border-2 border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold opacity-60 uppercase mb-1">Total Markets</div>
                <div className="text-4xl font-black text-primary tabular-nums">
                  {loading ? '...' : combinedMarkets.length}
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-2 border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold opacity-60 uppercase mb-1">Active</div>
                <div className="text-4xl font-black text-success tabular-nums">
                  {loading ? '...' : combinedMarkets.filter(m => !m.resolved && Math.floor(Date.now() / 1000) < m.endTime).length}
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-2 border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold opacity-60 uppercase mb-1">Volume</div>
                <div className="text-4xl font-black text-secondary tabular-nums">0.0</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
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

      {/* Features Info with enhanced design */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative card bg-base-300 border border-cyan-500/20 overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="card-body relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="font-display text-xl font-bold">Private Betting</h3>
            </div>
            <p className="text-sm text-base-content/70 leading-relaxed">
              Your bets are completely private using Aleo's zero-knowledge proofs. Only you know your positions.
            </p>
          </div>
        </div>

        <div className="relative card bg-base-300 border border-amber-500/20 overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="card-body relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="font-display text-xl font-bold">Multi-Outcome</h3>
            </div>
            <p className="text-sm text-base-content/70 leading-relaxed">
              Support for markets with 2-255 possible outcomes, not just binary YES/NO.
            </p>
          </div>
        </div>

        <div className="relative card bg-base-300 border border-purple-500/20 overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="card-body relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="font-display text-xl font-bold">Smart Categories</h3>
            </div>
            <p className="text-sm text-base-content/70 leading-relaxed">
              Discover markets by category - Sports, Politics, Crypto, Weather, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
