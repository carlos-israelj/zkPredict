// Supabase-based database implementation
// Falls back to in-memory if Supabase is not configured

import { supabase, MarketMetadataRow } from './supabase';

// v5: MarketMetadata now includes category, numOutcomes, and creatorAddress
export interface MarketMetadata {
  marketId: string;
  title: string;
  description: string;
  category: number;        // 0=Sports 1=Politics 2=Crypto 3=Weather 4=Other
  numOutcomes: number;     // 2-10, must match on-chain
  outcomeLabels: string[]; // Labels for each outcome
  imageUrl?: string;
  creatorAddress?: string;
  createdAt: number;       // Unix ms timestamp
  updatedAt: number;       // Unix ms timestamp
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// In-memory fallback storage (dev only)
let marketsDb: Map<string, MarketMetadata> = new Map();

// Helper: Supabase row → MarketMetadata
const rowToMetadata = (row: MarketMetadataRow): MarketMetadata => ({
  marketId: row.market_id,
  title: row.title,
  description: row.description || '',
  category: row.category ?? 4,
  numOutcomes: row.num_outcomes ?? 2,
  outcomeLabels: row.outcome_labels ?? ['Yes', 'No'],
  imageUrl: row.image_url || undefined,
  creatorAddress: row.creator_address || undefined,
  createdAt: new Date(row.created_at).getTime(),
  updatedAt: new Date(row.updated_at).getTime(),
});

// Helper: MarketMetadata → Supabase row (insert/update payload)
const metadataToRow = (metadata: Partial<MarketMetadata>): Partial<MarketMetadataRow> => {
  const row: Partial<MarketMetadataRow> = {};
  if (metadata.marketId !== undefined)    row.market_id       = metadata.marketId;
  if (metadata.title !== undefined)       row.title           = metadata.title;
  if (metadata.description !== undefined) row.description     = metadata.description || null;
  if (metadata.category !== undefined)    row.category        = metadata.category;
  if (metadata.numOutcomes !== undefined) row.num_outcomes    = metadata.numOutcomes;
  if (metadata.outcomeLabels !== undefined) row.outcome_labels = metadata.outcomeLabels;
  if (metadata.imageUrl !== undefined)    row.image_url       = metadata.imageUrl || null;
  if (metadata.creatorAddress !== undefined) row.creator_address = metadata.creatorAddress || null;
  return row;
};

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
    return marketsDb.get(marketId) || null;
  },

  // Create new market metadata
  createMarket: async (
    metadata: Omit<MarketMetadata, 'createdAt' | 'updatedAt'>
  ): Promise<MarketMetadata> => {
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
    const now = Date.now();
    const newMarket: MarketMetadata = { ...metadata, createdAt: now, updatedAt: now };
    marketsDb.set(metadata.marketId, newMarket);
    return newMarket;
  },

  // Update market metadata
  updateMarket: async (
    marketId: string,
    updates: Partial<MarketMetadata>
  ): Promise<MarketMetadata | null> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('markets_metadata')
        .update(metadataToRow(updates))
        .eq('market_id', marketId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Supabase error:', error);
        throw new Error(`Failed to update market: ${error.message}`);
      }

      return data ? rowToMetadata(data) : null;
    }

    // Fallback to in-memory
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
    const lowerQuery = query.toLowerCase();
    return Array.from(marketsDb.values())
      .filter(
        (m) =>
          m.title.toLowerCase().includes(lowerQuery) ||
          m.description.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  // Filter markets by category
  getMarketsByCategory: async (category: number): Promise<MarketMetadata[]> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('markets_metadata')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch markets by category: ${error.message}`);
      }

      return (data || []).map(rowToMetadata);
    }

    // Fallback to in-memory
    return Array.from(marketsDb.values())
      .filter((m) => m.category === category)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
};
