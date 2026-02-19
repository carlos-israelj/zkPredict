import { useState, useEffect, useCallback } from 'react';
import { OddsData } from '@/types';
import { fetchOutcomePool } from '@/lib/aleo';

interface UseOddsReturn {
  oddsData: OddsData[];
  totalPool: number;
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Hook to calculate real-time odds for a market based on its pool sizes.
 *
 * Odds are derived from the public outcome_pools mapping:
 *   odds = totalPool / poolSize  (parimutuel)
 *   probability = poolSize / totalPool * 100
 *
 * Pools are fetched from Aleo blockchain via Provable API.
 */
export function useOdds(
  marketId: string | undefined,
  numOutcomes: number,
  pollIntervalMs = 30000
): UseOddsReturn {
  const [oddsData, setOddsData] = useState<OddsData[]>([]);
  const [totalPool, setTotalPool] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!marketId || numOutcomes < 2) {
      setOddsData([]);
      setTotalPool(0);
      return;
    }

    let cancelled = false;

    const fetchPools = async () => {
      if (!cancelled) setIsLoading(true);

      try {
        // Fetch all outcome pools in parallel
        const poolPromises = Array.from({ length: numOutcomes }, (_, i) =>
          fetchOutcomePool(marketId, i).catch(() => 0)
        );

        const pools = await Promise.all(poolPromises);
        if (cancelled) return;

        const total = pools.reduce((sum, p) => sum + p, 0);

        const calculated: OddsData[] = pools.map((poolSize, index) => {
          const poolShare = total > 0 ? (poolSize / total) * 100 : 0;
          const probability = poolShare;
          // Parimutuel odds: if you bet 1 unit, you get totalPool/poolSize units back
          const odds = poolSize > 0 ? total / poolSize : 0;

          return {
            outcome: index,
            odds: Math.max(1, Number(odds.toFixed(2))),
            probability: Number(probability.toFixed(1)),
            poolSize,
            poolShare: Number(poolShare.toFixed(1)),
          };
        });

        setOddsData(calculated);
        setTotalPool(total);
      } catch (err) {
        console.error('Error fetching odds:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPools();

    const interval = setInterval(fetchPools, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [marketId, numOutcomes, pollIntervalMs, tick]);

  return { oddsData, totalPool, isLoading, refresh };
}

/**
 * Calculate odds from an already-fetched pools array (no network call).
 * Useful when pools are passed in as props.
 */
export function calculateOddsFromPools(pools: number[]): OddsData[] {
  const total = pools.reduce((sum, p) => sum + p, 0);

  return pools.map((poolSize, index) => {
    const poolShare = total > 0 ? (poolSize / total) * 100 : 0;
    const odds = poolSize > 0 ? total / poolSize : 0;

    return {
      outcome: index,
      odds: Math.max(1, Number(odds.toFixed(2))),
      probability: Number(poolShare.toFixed(1)),
      poolSize,
      poolShare: Number(poolShare.toFixed(1)),
    };
  });
}

/**
 * Calculate potential return for a bet given current odds.
 */
export function calculatePotentialReturn(
  betAmount: number,
  odds: number,
  timeMultiplier = 1.0
): { grossReturn: number; fee: number; netReturn: number; roi: number } {
  const effectiveBet = betAmount * timeMultiplier;
  const grossReturn = effectiveBet * odds;
  const fee = grossReturn * 0.02; // 2% protocol fee
  const netReturn = grossReturn - fee;
  const roi = betAmount > 0 ? ((netReturn - betAmount) / betAmount) * 100 : 0;

  return {
    grossReturn: Number(grossReturn.toFixed(4)),
    fee: Number(fee.toFixed(4)),
    netReturn: Number(netReturn.toFixed(4)),
    roi: Number(roi.toFixed(1)),
  };
}
