import { useState, useEffect } from 'react';
import { fetchMarketOnChain, fetchMarketPools, OnChainMarket, MarketPools } from '@/lib/aleo';

/**
 * Hook to fetch on-chain market data
 * @param marketId The market ID (field)
 * @returns Market data, pools, loading state, and error
 */
export const useOnChainMarket = (marketId?: string) => {
  const [market, setMarket] = useState<OnChainMarket | null>(null);
  const [pools, setPools] = useState<MarketPools>({ yes_pool: 0, no_pool: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch market and pools in parallel
        const [marketData, poolData] = await Promise.all([
          fetchMarketOnChain(marketId),
          fetchMarketPools(marketId),
        ]);

        setMarket(marketData);
        setPools(poolData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching on-chain market:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [marketId]);

  return { market, pools, loading, error };
};

/**
 * Hook to periodically refresh on-chain market data
 * @param marketId The market ID (field)
 * @param intervalMs Refresh interval in milliseconds (default: 30 seconds)
 * @returns Market data, pools, loading state, error, and manual refresh function
 */
export const useOnChainMarketPolling = (marketId?: string, intervalMs: number = 30000) => {
  const [market, setMarket] = useState<OnChainMarket | null>(null);
  const [pools, setPools] = useState<MarketPools>({ yes_pool: 0, no_pool: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const fetchData = async () => {
    if (!marketId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [marketData, poolData] = await Promise.all([
        fetchMarketOnChain(marketId),
        fetchMarketPools(marketId),
      ]);

      setMarket(marketData);
      setPools(poolData);
      setLastUpdate(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching on-chain market:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, intervalMs);

    return () => clearInterval(interval);
  }, [marketId, intervalMs]);

  return {
    market,
    pools,
    loading,
    error,
    lastUpdate,
    refresh: fetchData,
  };
};
