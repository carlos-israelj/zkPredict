import { useState, useEffect } from 'react';
import type { MarketMetadata } from '@/lib/db-supabase';

export const useMarketMetadata = (marketId?: string) => {
  const [metadata, setMetadata] = useState<MarketMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketId) {
      setLoading(false);
      return;
    }

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/markets/${marketId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching market metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [marketId]);

  return { metadata, loading, error };
};

export const useAllMarketsMetadata = (search?: string) => {
  const [markets, setMarkets] = useState<MarketMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = search
          ? `/api/markets?search=${encodeURIComponent(search)}`
          : '/api/markets';

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch markets: ${response.statusText}`);
        }

        const data = await response.json();
        setMarkets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching markets metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [search]);

  return { markets, loading, error };
};

export const createMarketMetadata = async (
  metadata: Omit<MarketMetadata, 'createdAt' | 'updatedAt'>
): Promise<MarketMetadata> => {
  const response = await fetch('/api/markets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create market metadata');
  }

  return response.json();
};

export const updateMarketMetadata = async (
  marketId: string,
  updates: Partial<MarketMetadata>
): Promise<MarketMetadata> => {
  const response = await fetch(`/api/markets/${marketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update market metadata');
  }

  return response.json();
};

export const deleteMarketMetadata = async (marketId: string): Promise<void> => {
  const response = await fetch(`/api/markets/${marketId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete market metadata');
  }
};
