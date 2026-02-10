import { Reputation, TIER_LABELS, TIER_MAX_LEGS, TIER_BONUSES, calculateAccuracy, ReputationTier } from '@/types';
import TierBadge from './TierBadge';

interface ReputationProfileProps {
  reputation: Reputation;
  compact?: boolean;
}

export default function ReputationProfile({ reputation, compact = false }: ReputationProfileProps) {
  const accuracy = calculateAccuracy(reputation.totalWins, reputation.totalBets);
  const parlayAccuracy = reputation.totalParlays > 0
    ? calculateAccuracy(reputation.parlayWins, reputation.totalParlays)
    : 0;

  // Calculate progress to next tier
  const getNextTierProgress = () => {
    const tier = reputation.tier as ReputationTier;

    if (tier === ReputationTier.Oracle) {
      return { nextTier: null, winsNeeded: 0, accuracyNeeded: 0, progress: 100 };
    }

    const requirements: Record<ReputationTier, { wins: number; accuracy: number }> = {
      [ReputationTier.Novice]: { wins: 6, accuracy: 60 },
      [ReputationTier.Skilled]: { wins: 16, accuracy: 70 },
      [ReputationTier.Expert]: { wins: 31, accuracy: 80 },
      [ReputationTier.Oracle]: { wins: 0, accuracy: 0 },
    };

    const nextTierMap: Record<ReputationTier, ReputationTier | null> = {
      [ReputationTier.Novice]: ReputationTier.Skilled,
      [ReputationTier.Skilled]: ReputationTier.Expert,
      [ReputationTier.Expert]: ReputationTier.Oracle,
      [ReputationTier.Oracle]: null,
    };

    const nextTier = nextTierMap[tier];
    if (!nextTier) return { nextTier: null, winsNeeded: 0, accuracyNeeded: 0, progress: 100 };

    const nextReq = requirements[nextTier];
    const winsNeeded = Math.max(0, nextReq.wins - reputation.totalWins);
    const accuracyNeeded = Math.max(0, nextReq.accuracy - accuracy);

    // Calculate progress percentage based on wins
    const progress = Math.min(100, (reputation.totalWins / nextReq.wins) * 100);

    return { nextTier, winsNeeded, accuracyNeeded, progress };
  };

  const nextTierInfo = getNextTierProgress();

  // Get tier color scheme
  const getTierColors = (tier: number) => {
    const colors = {
      1: { bg: 'rgba(156, 163, 175, 0.15)', border: '#9ca3af', text: '#6b7280', glow: 'rgba(156, 163, 175, 0.3)' }, // Novice - Gray
      2: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#2563eb', glow: 'rgba(59, 130, 246, 0.3)' },   // Skilled - Blue
      3: { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', text: '#7c3aed', glow: 'rgba(139, 92, 246, 0.3)' },   // Expert - Purple
      4: { bg: 'rgba(251, 191, 36, 0.15)', border: '#fbbf24', text: '#f59e0b', glow: 'rgba(251, 191, 36, 0.3)' },   // Oracle - Amber
    };
    return colors[tier as keyof typeof colors] || colors[1];
  };

  const tierColors = getTierColors(reputation.tier);

  if (compact) {
    return (
      <div className="flex items-center gap-3 animate-fade-in">
        <TierBadge tier={reputation.tier as ReputationTier} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tabular-nums">{accuracy.toFixed(1)}%</span>
            <span className="text-xs opacity-50">accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tabular-nums opacity-70">
              {reputation.totalWins}/{reputation.totalBets} wins
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Tier Badge */}
      <div className="card bg-base-200 border-2 border-base-300 animate-fade-in">
        <div className="card-body p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-3">
              <TierBadge tier={reputation.tier as ReputationTier} size="large" />
              <div className="space-y-1">
                <p className="text-sm font-semibold opacity-60">Max Parlay Legs</p>
                <p className="text-2xl font-black tabular-nums" style={{ color: tierColors.text }}>
                  {TIER_MAX_LEGS[reputation.tier as ReputationTier]} legs
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold opacity-60">Tier Bonus</p>
                <p className="text-2xl font-black tabular-nums gradient-text-cyan">
                  {TIER_BONUSES[reputation.tier as ReputationTier].toFixed(1)}x
                </p>
              </div>
            </div>

            {/* Circular Progress for Next Tier */}
            {nextTierInfo.nextTier && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="rgba(156, 163, 175, 0.2)"
                      strokeWidth="6"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={getTierColors(nextTierInfo.nextTier).border}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - nextTierInfo.progress / 100)}`}
                      className="transition-all duration-500"
                      style={{
                        filter: `drop-shadow(0 0 4px ${getTierColors(nextTierInfo.nextTier).glow})`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black tabular-nums">
                      {Math.round(nextTierInfo.progress)}%
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold opacity-50 uppercase tracking-wide">Next Tier</p>
                  <p className="text-sm font-bold" style={{ color: getTierColors(nextTierInfo.nextTier).text }}>
                    {TIER_LABELS[nextTierInfo.nextTier]}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress to Next Tier */}
          {nextTierInfo.nextTier && nextTierInfo.winsNeeded > 0 && (
            <div
              className="mt-4 p-3 rounded-lg border-2"
              style={{
                background: getTierColors(nextTierInfo.nextTier).bg,
                borderColor: getTierColors(nextTierInfo.nextTier).border,
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: getTierColors(nextTierInfo.nextTier).text }}>
                  🎯 {nextTierInfo.winsNeeded} more wins needed
                </span>
                {nextTierInfo.accuracyNeeded > 0 && (
                  <span className="font-semibold opacity-70">
                    +{nextTierInfo.accuracyNeeded.toFixed(1)}% accuracy needed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Accuracy */}
        <div className="card bg-base-200 border-2 border-base-300 hover:border-primary/50 hover-lift stagger-item">
          <div className="card-body p-4 gap-2">
            <p className="text-xs font-bold uppercase tracking-wide opacity-50">Accuracy</p>
            <p className="text-3xl font-black tabular-nums gradient-text-cyan">
              {accuracy.toFixed(1)}%
            </p>
            <p className="text-xs font-semibold opacity-60 tabular-nums">
              {reputation.totalWins} / {reputation.totalBets}
            </p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="card bg-base-200 border-2 border-base-300 hover:border-success/50 hover-lift stagger-item">
          <div className="card-body p-4 gap-2">
            <p className="text-xs font-bold uppercase tracking-wide opacity-50">Streak</p>
            <p className="text-3xl font-black tabular-nums" style={{ color: '#34d399' }}>
              {reputation.currentStreak}
              <span className="text-base ml-1">🔥</span>
            </p>
            <p className="text-xs font-semibold opacity-60 tabular-nums">
              Best: {reputation.bestStreak}
            </p>
          </div>
        </div>

        {/* Total Parlays */}
        <div className="card bg-base-200 border-2 border-base-300 hover:border-accent/50 hover-lift stagger-item">
          <div className="card-body p-4 gap-2">
            <p className="text-xs font-bold uppercase tracking-wide opacity-50">Parlays</p>
            <p className="text-3xl font-black tabular-nums" style={{ color: '#8b5cf6' }}>
              {reputation.parlayWins}
            </p>
            <p className="text-xs font-semibold opacity-60 tabular-nums">
              {parlayAccuracy.toFixed(0)}% hit rate
            </p>
          </div>
        </div>

        {/* Total Won */}
        <div className="card bg-base-200 border-2 border-base-300 hover:border-secondary/50 hover-lift stagger-item">
          <div className="card-body p-4 gap-2">
            <p className="text-xs font-bold uppercase tracking-wide opacity-50">Total Won</p>
            <p className="text-3xl font-black tabular-nums gradient-text-amber">
              {(reputation.totalWon / 1_000_000).toFixed(1)}
            </p>
            <p className="text-xs font-semibold opacity-60">credits</p>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="card bg-base-200 border-2 border-base-300 animate-fade-in">
        <div className="card-body p-5 gap-4">
          <h3 className="font-display text-lg font-bold">Detailed Statistics</h3>

          <div className="space-y-3">
            {/* Total Bets */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-base-100 border-2 border-base-content/10">
              <span className="text-sm font-semibold">Total Bets</span>
              <span className="text-lg font-black tabular-nums">{reputation.totalBets}</span>
            </div>

            {/* Total Wins */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-base-100 border-2 border-base-content/10">
              <span className="text-sm font-semibold">Total Wins</span>
              <span className="text-lg font-black tabular-nums text-success">{reputation.totalWins}</span>
            </div>

            {/* Total Wagered */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-base-100 border-2 border-base-content/10">
              <span className="text-sm font-semibold">Total Wagered</span>
              <span className="text-lg font-black tabular-nums">
                {(reputation.totalWagered / 1_000_000).toFixed(2)} <span className="text-sm opacity-50">credits</span>
              </span>
            </div>

            {/* ROI Calculation */}
            {reputation.totalWagered > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-base-100 border-2 border-base-content/10">
                <span className="text-sm font-semibold">ROI</span>
                <span
                  className={`text-lg font-black tabular-nums ${
                    reputation.totalWon > reputation.totalWagered ? 'text-success' : 'text-error'
                  }`}
                >
                  {(((reputation.totalWon - reputation.totalWagered) / reputation.totalWagered) * 100).toFixed(1)}%
                </span>
              </div>
            )}

            {/* Parlay Stats */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-base-100 border-2 border-base-content/10">
              <span className="text-sm font-semibold">Parlay Win Rate</span>
              <span className="text-lg font-black tabular-nums" style={{ color: '#8b5cf6' }}>
                {parlayAccuracy.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
