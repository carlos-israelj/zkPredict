import type { NextApiRequest, NextApiResponse } from 'next';
import { db, MarketMetadata } from '@/lib/db-supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketMetadata[] | MarketMetadata | { error: string }>
) {
  try {
    if (req.method === 'GET') {
      // GET /api/markets - Get all markets or search
      const { search } = req.query;

      if (search && typeof search === 'string') {
        const markets = await db.searchMarkets(search);
        return res.status(200).json(markets);
      }

      const markets = await db.getAllMarkets();
      return res.status(200).json(markets);
    }

    if (req.method === 'POST') {
      // POST /api/markets - Create new market metadata
      const { marketId, title, description, outcomeLabels, category, numOutcomes, imageUrl, creatorAddress } = req.body;

      // Validate required fields
      if (!marketId || !title || !outcomeLabels) {
        return res.status(400).json({ error: 'Missing required fields: marketId, title, outcomeLabels' });
      }

      if (!Array.isArray(outcomeLabels) || outcomeLabels.length < 2) {
        return res.status(400).json({ error: 'outcomeLabels must be an array with at least 2 items' });
      }

      const market = await db.createMarket({
        marketId,
        title,
        description: description || '',
        category: typeof category === 'number' ? category : 4,
        numOutcomes: typeof numOutcomes === 'number' ? numOutcomes : outcomeLabels.length,
        outcomeLabels,
        imageUrl,
        creatorAddress,
      });

      return res.status(201).json(market);
    }

    if (req.method === 'GET' && req.query.category !== undefined) {
      const categoryNum = parseInt(req.query.category as string);
      if (!isNaN(categoryNum)) {
        const markets = await db.getMarketsByCategory(categoryNum);
        return res.status(200).json(markets);
      }
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
