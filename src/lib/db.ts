// Simple in-memory database for metadata
// This will be replaced with Supabase or similar in production

import { MarketCategory } from '@/types';

export interface MarketMetadata {
  marketId: string;
  title: string;
  description: string;
  outcomeLabels: string[];
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory storage (will be replaced with real database)
let marketsDb: Map<string, MarketMetadata> = new Map();

// Initialize with empty database - markets are created only when users create them
const initializeDb = () => {
  // No sample markets - start with clean database
  // Markets will be added when users create them through the CreateMarket form
};

// Initialize on module load
initializeDb();

export const db = {
  // Get all markets metadata
  getAllMarkets: async (): Promise<MarketMetadata[]> => {
    return Array.from(marketsDb.values()).sort((a, b) => b.createdAt - a.createdAt);
  },

  // Get market metadata by ID
  getMarket: async (marketId: string): Promise<MarketMetadata | null> => {
    return marketsDb.get(marketId) || null;
  },

  // Create new market metadata
  createMarket: async (metadata: Omit<MarketMetadata, 'createdAt' | 'updatedAt'>): Promise<MarketMetadata> => {
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
    const existing = marketsDb.get(marketId);
    if (!existing) return null;

    const updated: MarketMetadata = {
      ...existing,
      ...updates,
      marketId, // Ensure marketId doesn't change
      createdAt: existing.createdAt, // Preserve creation time
      updatedAt: Date.now(),
    };

    marketsDb.set(marketId, updated);
    return updated;
  },

  // Delete market metadata
  deleteMarket: async (marketId: string): Promise<boolean> => {
    return marketsDb.delete(marketId);
  },

  // Search markets by title or description
  searchMarkets: async (query: string): Promise<MarketMetadata[]> => {
    const lowerQuery = query.toLowerCase();
    return Array.from(marketsDb.values())
      .filter(m =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  },
};
