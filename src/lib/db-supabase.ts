// Supabase-based database implementation
// Falls back to in-memory if Supabase is not configured

import { supabase, MarketMetadataRow } from './supabase';

export interface MarketMetadata {
  marketId: string;
  title: string;
  description: string;
  outcomeLabels: string[];
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// In-memory fallback storage
let marketsDb: Map<string, MarketMetadata> = new Map();

// Initialize in-memory DB with example data
const initializeInMemoryDb = () => {
  if (marketsDb.size === 0) {
    marketsDb.set('1', {
      marketId: '1',
      title: 'Will Bitcoin reach $100k by end of 2026?',
      description: 'This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange by December 31, 2026, 23:59:59 UTC.',
      outcomeLabels: ['No', 'Yes'],
      createdAt: Date.now() - 86400000 * 7,
      updatedAt: Date.now() - 86400000 * 7,
    });

    marketsDb.set('2', {
      marketId: '2',
      title: 'Winner of Super Bowl LXI',
      description: 'Which team will win Super Bowl LXI in 2027?',
      outcomeLabels: ['Kansas City Chiefs', 'San Francisco 49ers', 'Other'],
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5,
    });

    marketsDb.set('3', {
      marketId: '3',
      title: 'Will it rain in NYC tomorrow?',
      description: 'Will there be measurable precipitation (>0.01 inches) in Central Park, NYC on the next calendar day?',
      outcomeLabels: ['No', 'Yes'],
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 2,
    });
  }
};

// Helper to convert Supabase row to MarketMetadata
const rowToMetadata = (row: MarketMetadataRow): MarketMetadata => ({
  marketId: row.market_id,
  title: row.title,
  description: row.description || '',
  outcomeLabels: row.outcome_labels,
  imageUrl: row.image_url || undefined,
  createdAt: new Date(row.created_at).getTime(),
  updatedAt: new Date(row.updated_at).getTime(),
});

// Helper to convert MarketMetadata to Supabase row format
const metadataToRow = (metadata: Partial<MarketMetadata>): Partial<MarketMetadataRow> => ({
  market_id: metadata.marketId,
  title: metadata.title,
  description: metadata.description || null,
  outcome_labels: metadata.outcomeLabels,
  image_url: metadata.imageUrl || null,
});

export const db = {
  // Get all markets metadata
  getAllMarkets: async (): Promise<MarketMetadata[]> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('markets_metadata')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch markets: ${error.message}`);
      }

      return (data || []).map(rowToMetadata);
    }

    // Fallback to in-memory
    initializeInMemoryDb();
    return Array.from(marketsDb.values()).sort((a, b) => b.createdAt - a.createdAt);
  },

  // Get market metadata by ID
  getMarket: async (marketId: string): Promise<MarketMetadata | null> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('markets_metadata')
        .select('*')
        .eq('market_id', marketId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch market: ${error.message}`);
      }

      return data ? rowToMetadata(data) : null;
    }

    // Fallback to in-memory
    initializeInMemoryDb();
    return marketsDb.get(marketId) || null;
  },

  // Create new market metadata
  createMarket: async (metadata: Omit<MarketMetadata, 'createdAt' | 'updatedAt'>): Promise<MarketMetadata> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('markets_metadata')
        .insert([metadataToRow(metadata)])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create market: ${error.message}`);
      }

      return rowToMetadata(data);
    }

    // Fallback to in-memory
    initializeInMemoryDb();
    const now = Date.now();
    const newMarket: MarketMetadata = {
      ...metadata,
      createdAt: now,
      updatedAt: now,
    };
    marketsDb.set(metadata.marketId, newMarket);
    return newMarket;
  },

  // Update market metadata
  updateMarket: async (marketId: string, updates: Partial<MarketMetadata>): Promise<MarketMetadata | null> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('markets_metadata')
        .update(metadataToRow(updates))
        .eq('market_id', marketId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Supabase error:', error);
        throw new Error(`Failed to update market: ${error.message}`);
      }

      return data ? rowToMetadata(data) : null;
    }

    // Fallback to in-memory
    initializeInMemoryDb();
    const existing = marketsDb.get(marketId);
    if (!existing) return null;

    const updated: MarketMetadata = {
      ...existing,
      ...updates,
      marketId,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    };

    marketsDb.set(marketId, updated);
    return updated;
  },

  // Delete market metadata
  deleteMarket: async (marketId: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('markets_metadata')
        .delete()
        .eq('market_id', marketId);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to delete market: ${error.message}`);
      }

      return true;
    }

    // Fallback to in-memory
    initializeInMemoryDb();
    return marketsDb.delete(marketId);
  },

  // Search markets by title or description
  searchMarkets: async (query: string): Promise<MarketMetadata[]> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('markets_metadata')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to search markets: ${error.message}`);
      }

      return (data || []).map(rowToMetadata);
    }

    // Fallback to in-memory
    initializeInMemoryDb();
    const lowerQuery = query.toLowerCase();
    return Array.from(marketsDb.values())
      .filter(m =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  },
};
