import { Reputation, ReputationTier, TIER_LABELS, calculateAccuracy } from '@/types';

interface TierProgressProps {
  reputation: Reputation;
}

const TIER_REQUIREMENTS: Record<ReputationTier, { wins: number; accuracy: number } | null> = {
  [ReputationTier.Novice]: null, // Starting tier
  [ReputationTier.Skilled]: { wins: 6, accuracy: 60 },
  [ReputationTier.Expert]: { wins: 16, accuracy: 70 },
  [ReputationTier.Oracle]: { wins: 31, accuracy: 80 },
};

const TIER_COLORS: Record<ReputationTier, string> = {
  [ReputationTier.Novice]: 'progress-warning',
  [ReputationTier.Skilled]: 'progress-info',
  [ReputationTier.Expert]: 'progress-success',
  [ReputationTier.Oracle]: 'progress-primary',
};

const TIER_ICONS: Record<ReputationTier, string> = {
  [ReputationTier.Novice]: '🥉',
  [ReputationTier.Skilled]: '🥈',
  [ReputationTier.Expert]: '🥇',
  [ReputationTier.Oracle]: '💎',
};

export function TierProgress({ reputation }: TierProgressProps) {
  const currentTier = reputation.tier as ReputationTier;
  const accuracy = calculateAccuracy(reputation.totalWins, reputation.totalBets);

  // Determine next tier
  const nextTier: ReputationTier | null =
    currentTier === ReputationTier.Oracle ? null :
    currentTier === ReputationTier.Expert ? ReputationTier.Oracle :
    currentTier === ReputationTier.Skilled ? ReputationTier.Expert :
    ReputationTier.Skilled;

  const nextReq = nextTier ? TIER_REQUIREMENTS[nextTier] : null;

  // Progress toward next tier
  let winsProgress = 0;
  let accuracyProgress = 0;
  let winsNeeded = 0;
  let accuracyNeeded = 0;

  if (nextReq) {
    winsNeeded = nextReq.wins;
    accuracyNeeded = nextReq.accuracy;
    winsProgress = Math.min(100, (reputation.totalWins / nextReq.wins) * 100);
    accuracyProgress = Math.min(100, (accuracy / nextReq.accuracy) * 100);
  }

  return (
    <div className="space-y-3">
      {/* Current tier badge */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{TIER_ICONS[currentTier]}</span>
        <div>
          <p className="font-bold text-lg">{TIER_LABELS[currentTier]}</p>
          <p className="text-xs opacity-60">
            {reputation.totalBets} bets · {reputation.totalWins} wins · {accuracy.toFixed(1)}% accuracy
          </p>
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && nextReq ? (
        <div className="bg-base-300 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium opacity-70">
            Progress to {TIER_ICONS[nextTier]} {TIER_LABELS[nextTier]}
          </p>

          {/* Wins progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Wins</span>
              <span>{Math.min(reputation.totalWins, winsNeeded)} / {winsNeeded}</span>
            </div>
            <progress
              className={`progress ${TIER_COLORS[nextTier]} w-full h-2`}
              value={winsProgress}
              max="100"
            />
          </div>

          {/* Accuracy progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Accuracy</span>
              <span>{accuracy.toFixed(1)}% / {accuracyNeeded}%</span>
            </div>
            <progress
              className={`progress ${TIER_COLORS[nextTier]} w-full h-2`}
              value={accuracyProgress}
              max="100"
            />
          </div>

          {/* Bottleneck message */}
          {winsProgress < 100 || accuracyProgress < 100 ? (
            <p className="text-xs opacity-50">
              {winsProgress < 100
                ? `${winsNeeded - Math.min(reputation.totalWins, winsNeeded)} more wins needed`
                : `${(accuracyNeeded - accuracy).toFixed(1)}% more accuracy needed`}
            </p>
          ) : (
            <p className="text-xs text-success font-medium">Ready to advance!</p>
          )}
        </div>
      ) : (
        <div className="alert alert-success py-2">
          <span className="text-sm">Maximum tier reached! 💎</span>
        </div>
      )}

      {/* Streak info */}
      {reputation.currentStreak > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-orange-400">🔥</span>
          <span>
            {reputation.currentStreak} win streak
            {reputation.bestStreak > reputation.currentStreak && (
              <span className="opacity-50 ml-1">(best: {reputation.bestStreak})</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
