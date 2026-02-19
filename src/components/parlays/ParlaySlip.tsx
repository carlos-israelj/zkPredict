import { Market, ReputationTier, TIER_LABELS, TIER_BONUSES, TIER_MAX_LEGS, PARLAY_BASE_ODDS } from '@/types';
import { ParlayLegInput } from '@/hooks/useParlays';

interface ParlaySlipProps {
  legs: ParlayLegInput[];
  amount: number;
  tier: ReputationTier;
  onRemoveLeg: (index: number) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

/**
 * ParlaySlip - Summary card showing selected legs, combined odds, and potential payout.
 */
export function ParlaySlip({
  legs,
  amount,
  tier,
  onRemoveLeg,
  onConfirm,
  isSubmitting,
}: ParlaySlipProps) {
  const numLegs = legs.length;
  const maxLegs = TIER_MAX_LEGS[tier];
  const tierBonus = TIER_BONUSES[tier];

  // Base odds from PARLAY_BASE_ODDS (2→3.5x, 3→7x, 4→14x, 5→28x)
  const baseOdds = numLegs >= 2
    ? PARLAY_BASE_ODDS[numLegs as keyof typeof PARLAY_BASE_ODDS] ?? 0
    : 0;
  const finalOdds = baseOdds * tierBonus;
  const potentialPayout = amount * finalOdds;
  const fee = potentialPayout * 0.02;
  const netPayout = potentialPayout - fee;

  if (numLegs === 0) {
    return (
      <div className="card bg-base-200 shadow border border-base-300">
        <div className="card-body items-center text-center py-8 opacity-50">
          <p className="text-sm">Add 2-{maxLegs} legs to build your parlay</p>
          <p className="text-xs mt-1">{TIER_LABELS[tier]} tier · max {maxLegs} legs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl border border-primary/20">
      <div className="card-body space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Parlay Slip</h3>
          <div className="badge badge-outline badge-sm">
            {numLegs}/{maxLegs} legs
          </div>
        </div>

        {/* Legs list */}
        <div className="space-y-2">
          {legs.map((leg, i) => (
            <div key={i} className="flex items-center justify-between bg-base-300 rounded-lg px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{leg.marketTitle ?? leg.marketId}</p>
                <p className="text-xs opacity-60">{leg.outcomeName ?? `Outcome ${leg.outcome + 1}`}</p>
              </div>
              <button
                className="btn btn-xs btn-ghost ml-2 text-error"
                onClick={() => onRemoveLeg(i)}
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {numLegs < 2 && (
          <div className="text-xs text-warning text-center">
            Add {2 - numLegs} more leg{2 - numLegs !== 1 ? 's' : ''} to place parlay
          </div>
        )}

        {numLegs >= 2 && (
          <>
            <div className="divider my-1" />

            {/* Odds breakdown */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="opacity-60">Base Odds ({numLegs} legs)</span>
                <span className="font-mono">{baseOdds.toFixed(1)}x</span>
              </div>
              <div className="flex justify-between text-success">
                <span className="opacity-60">Tier Bonus ({TIER_LABELS[tier]})</span>
                <span className="font-mono">×{tierBonus.toFixed(1)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-base-300 pt-1 mt-1">
                <span>Final Odds</span>
                <span className="text-primary font-mono">{finalOdds.toFixed(2)}x</span>
              </div>
            </div>

            {/* Payout */}
            {amount > 0 && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Bet Amount</span>
                  <span className="font-mono">{amount.toFixed(2)} credits</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gross Payout</span>
                  <span className="font-mono">{potentialPayout.toFixed(2)} credits</span>
                </div>
                <div className="flex justify-between text-xs opacity-50">
                  <span>Protocol Fee (2%)</span>
                  <span className="font-mono">-{fee.toFixed(4)} credits</span>
                </div>
                <div className="flex justify-between font-bold text-success border-t border-success/20 pt-1 mt-1">
                  <span>Net Payout</span>
                  <span className="font-mono">{netPayout.toFixed(2)} credits</span>
                </div>
              </div>
            )}

            <div className="alert alert-warning py-2 text-xs">
              All legs must win or the entire parlay loses.
            </div>

            <button
              className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
              onClick={onConfirm}
              disabled={isSubmitting || numLegs < 2 || amount <= 0}
            >
              {isSubmitting ? 'Placing Parlay...' : `Place ${numLegs}-Leg Parlay`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
