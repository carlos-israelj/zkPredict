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

// Initialize with some example data
const initializeDb = () => {
  if (marketsDb.size === 0) {
    // Add some sample markets
    marketsDb.set('1', {
      marketId: '1',
      title: 'Will Bitcoin reach $100k by end of 2026?',
      description: 'This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange by December 31, 2026, 23:59:59 UTC.',
      outcomeLabels: ['No', 'Yes'],
      createdAt: Date.now() - 86400000 * 7, // 7 days ago
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
