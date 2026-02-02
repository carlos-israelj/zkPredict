import { useState, useMemo } from 'react';
import { Market, MarketCategory, CATEGORY_LABELS } from '@/types';
import MarketCard from './MarketCard';
import CategoryFilter from './CategoryFilter';
import StatusFilter from './StatusFilter';
import SortFilter from './SortFilter';

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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Search Bar - Modern with icon - Mobile optimized */}
      <div className="relative" role="search">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 opacity-50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search markets..."
          className="input input-bordered w-full pl-10 sm:pl-12 pr-10 sm:pr-12 bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20 h-12 sm:h-14 text-sm sm:text-base touch-manipulation"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search markets by title, description, or outcome"
          aria-describedby="search-results-count"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity p-1 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary rounded"
            aria-label="Clear search query"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters - Modern Button Groups (Polymarket style) - Mobile optimized */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Category Filter (Wave 4) - Enhanced Design */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2 sm:mb-3">Category</div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Status and Sort Filters - Enhanced with color-coded accents - Stacked on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2">Status</div>
            <StatusFilter
              filterStatus={filterStatus}
              onStatusChange={setFilterStatus}
            />
          </div>

          {/* Sort Filter */}
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2">Sort By</div>
            <SortFilter
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </div>
      </div>

      {/* Results Count - Better visibility - Mobile optimized */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs sm:text-sm font-semibold opacity-70" id="search-results-count" role="status" aria-live="polite">
          <span className="text-primary text-base sm:text-lg font-bold">{filteredMarkets.length}</span> {filteredMarkets.length === 1 ? 'market' : 'markets'}
        </div>
      </div>

      {/* Market Grid - Mobile optimized */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6" role="list" aria-label="Filtered prediction markets">
          {filteredMarkets.map(market => (
            <div key={market.marketId} role="listitem">
              <MarketCard
                market={market}
                pools={poolsMap?.get(market.marketId)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 sm:py-12" role="status">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No markets found</p>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-2">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
