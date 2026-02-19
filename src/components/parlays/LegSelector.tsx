import { useState } from 'react';
import { Market } from '@/types';
import { ParlayLegInput } from '@/hooks/useParlays';

interface LegSelectorProps {
  markets: Market[];
  onSelect: (leg: ParlayLegInput) => void;
  excludeMarketIds?: string[];
}

/**
 * LegSelector - Select a market and outcome to add as a parlay leg.
 * Filters out already-selected markets to prevent duplicate legs.
 */
export function LegSelector({ markets, onSelect, excludeMarketIds = [] }: LegSelectorProps) {
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0);

  const availableMarkets = markets.filter(
    (m) => !m.resolved && !excludeMarketIds.includes(m.marketId)
  );

  const selectedMarket = availableMarkets.find((m) => m.marketId === selectedMarketId);

  const handleAdd = () => {
    if (!selectedMarket) return;

    onSelect({
      marketId: selectedMarket.marketId,
      outcome: selectedOutcome,
      marketTitle: selectedMarket.title,
      outcomeName: selectedMarket.outcomeLabels?.[selectedOutcome] ?? `Outcome ${selectedOutcome + 1}`,
    });

    // Reset for next leg
    setSelectedMarketId('');
    setSelectedOutcome(0);
  };

  if (availableMarkets.length === 0) {
    return (
      <div className="alert alert-warning text-sm">
        <span>No more active markets available for this parlay.</span>
      </div>
    );
  }

  return (
    <div className="bg-base-300 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium opacity-70">Add Leg</p>

      {/* Market selector */}
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs">Select Market</span>
        </label>
        <select
          className="select select-bordered select-sm"
          value={selectedMarketId}
          onChange={(e) => {
            setSelectedMarketId(e.target.value);
            setSelectedOutcome(0);
          }}
        >
          <option value="">-- Choose a market --</option>
          {availableMarkets.map((m) => (
            <option key={m.marketId} value={m.marketId}>
              {m.title ?? m.marketId}
            </option>
          ))}
        </select>
      </div>

      {/* Outcome selector */}
      {selectedMarket && (
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs">Select Outcome</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: selectedMarket.numOutcomes }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${selectedOutcome === i ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedOutcome(i)}
              >
                {selectedMarket.outcomeLabels?.[i] ?? `Outcome ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn btn-secondary btn-sm w-full"
        onClick={handleAdd}
        disabled={!selectedMarket}
      >
        + Add Leg
      </button>
    </div>
  );
}
