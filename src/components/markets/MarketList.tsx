import { useState, useMemo } from 'react';
import { Market, MarketCategory, CATEGORY_LABELS } from '@/types';
import MarketCard from './MarketCard';
import CategoryFilter from './CategoryFilter';

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
    <div className="space-y-4 sm:space-y-6">
      {/* Search Bar - Modern with icon */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search markets by title, description, or outcome..."
          className="input input-bordered w-full pl-12 bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters - Modern Button Groups (Polymarket style) */}
      <div className="flex flex-col gap-4">
        {/* Category Filter (Wave 4) - Enhanced Design */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3">Category</div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Status and Sort Filters - Segmented Button Groups */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2">Status</div>
            <div className="inline-flex bg-base-200 rounded-lg p-1 w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                  filterStatus === 'all'
                    ? 'bg-base-100 shadow-sm'
                    : 'hover:bg-base-300/50'
                }`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                  filterStatus === 'active'
                    ? 'bg-base-100 shadow-sm'
                    : 'hover:bg-base-300/50'
                }`}
                onClick={() => setFilterStatus('active')}
              >
                Active
              </button>
              <button
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                  filterStatus === 'ended'
                    ? 'bg-base-100 shadow-sm'
                    : 'hover:bg-base-300/50'
                }`}
                onClick={() => setFilterStatus('ended')}
              >
                Ended
              </button>
              <button
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                  filterStatus === 'resolved'
                    ? 'bg-base-100 shadow-sm'
                    : 'hover:bg-base-300/50'
                }`}
                onClick={() => setFilterStatus('resolved')}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Sort Filter */}
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2">Sort By</div>
            <div className="inline-flex bg-base-200 rounded-lg p-1 w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                  sortBy === 'newest'
                    ? 'bg-base-100 shadow-sm'
                    : 'hover:bg-base-300/50'
                }`}
                onClick={() => setSortBy('newest')}
              >
                Newest
              </button>
              <button
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-semibold text-sm transition-all whitespace-nowrap ${
                  sortBy === 'ending-soon'
                    ? 'bg-base-100 shadow-sm'
                    : 'hover:bg-base-300/50'
                }`}
                onClick={() => setSortBy('ending-soon')}
              >
                Ending Soon
              </button>
              <button
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-semibold text-sm transition-all whitespace-nowrap ${
                  sortBy === 'most-volume'
                    ? 'bg-base-100 shadow-sm'
                    : 'hover:bg-base-300/50'
                }`}
                onClick={() => setSortBy('most-volume')}
              >
                Volume
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count - Better visibility */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold opacity-70">
          <span className="text-primary text-lg font-bold">{filteredMarkets.length}</span> {filteredMarkets.length === 1 ? 'market' : 'markets'}
        </div>
      </div>

      {/* Market Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
