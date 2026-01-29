import type { NextApiRequest, NextApiResponse } from 'next';
import { db, MarketMetadata } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketMetadata | { error: string }>
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid market ID' });
  }

  try {
    if (req.method === 'GET') {
      // GET /api/markets/[id] - Get market by ID
      const market = await db.getMarket(id);

      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      return res.status(200).json(market);
    }

    if (req.method === 'PUT') {
      // PUT /api/markets/[id] - Update market metadata
      const { title, description, outcomeLabels, imageUrl } = req.body;

      const updates: Partial<MarketMetadata> = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (outcomeLabels !== undefined) {
        if (!Array.isArray(outcomeLabels) || outcomeLabels.length < 2) {
          return res.status(400).json({ error: 'outcomeLabels must be an array with at least 2 items' });
        }
        updates.outcomeLabels = outcomeLabels;
      }
      if (imageUrl !== undefined) updates.imageUrl = imageUrl;

      const market = await db.updateMarket(id, updates);

      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      return res.status(200).json(market);
    }

    if (req.method === 'DELETE') {
      // DELETE /api/markets/[id] - Delete market metadata
      const success = await db.deleteMarket(id);

      if (!success) {
        return res.status(404).json({ error: 'Market not found' });
      }

      return res.status(204).end();
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
