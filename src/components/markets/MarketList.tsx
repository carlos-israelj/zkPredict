import { useState, useMemo } from 'react';
import { Market, MarketCategory, CATEGORY_LABELS } from '@/types';
import MarketCard from './MarketCard';

interface MarketListProps {
  markets: Market[];
  poolsMap?: Map<string, number[]>; // Map of marketId to pool sizes
}

type FilterStatus = 'all' | 'active' | 'ended' | 'resolved';
type SortOption = 'newest' | 'ending-soon' | 'most-volume';

export default function MarketList({ markets, poolsMap }: MarketListProps) {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);

    let filtered = markets.filter(market => {
      // Category filter (Wave 4)
      if (selectedCategory !== 'all' && market.category !== selectedCategory) {
        return false;
      }

      // Status filter
      const isEnded = now >= market.endTime;
      if (filterStatus === 'active' && (market.resolved || isEnded)) return false;
      if (filterStatus === 'ended' && (!isEnded || market.resolved)) return false;
      if (filterStatus === 'resolved' && !market.resolved) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = market.title?.toLowerCase().includes(query);
        const matchesDescription = market.description?.toLowerCase().includes(query);
        const matchesOutcomes = market.outcomeLabels?.some(label =>
          label.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesDescription && !matchesOutcomes) {
          return false;
        }
      }

      return true;
    });

    // Sort markets
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        // Assuming newer marketIds have higher timestamps
        return b.marketId.localeCompare(a.marketId);
      }
      if (sortBy === 'ending-soon') {
        return a.endTime - b.endTime;
      }
      if (sortBy === 'most-volume') {
        const aPool = poolsMap?.get(a.marketId)?.reduce((sum, p) => sum + p, 0) || 0;
        const bPool = poolsMap?.get(b.marketId)?.reduce((sum, p) => sum + p, 0) || 0;
        return bPool - aPool;
      }
      return 0;
    });

    return filtered;
  }, [markets, selectedCategory, filterStatus, sortBy, searchQuery, poolsMap]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="form-control">
        <input
          type="text"
          placeholder="Search markets..."
          className="input input-bordered w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Category Filter (Wave 4) */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`btn btn-sm ${
                selectedCategory === Number(key) ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setSelectedCategory(Number(key) as MarketCategory)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <select
            className="select select-bordered select-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Sort Options */}
          <select
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="ending-soon">Ending Soon</option>
            <option value="most-volume">Most Volume</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredMarkets.length} {filteredMarkets.length === 1 ? 'market' : 'markets'} found
      </div>

      {/* Market Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map(market => (
            <MarketCard
              key={market.marketId}
              market={market}
              pools={poolsMap?.get(market.marketId)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No markets found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
