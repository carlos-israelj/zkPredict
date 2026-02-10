import { ReputationTier, TIER_LABELS } from '@/types';

interface TierBadgeProps {
  tier: ReputationTier;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function TierBadge({ tier, size = 'medium', showLabel = true }: TierBadgeProps) {
  // Tier styling with rgba backgrounds
  const getTierStyle = (tier: ReputationTier) => {
    const styles = {
      [ReputationTier.Novice]: {
        bg: 'rgba(156, 163, 175, 0.15)',
        border: '#9ca3af',
        text: '#6b7280',
        glow: 'rgba(156, 163, 175, 0.3)',
        icon: '🌱',
      },
      [ReputationTier.Skilled]: {
        bg: 'rgba(59, 130, 246, 0.15)',
        border: '#3b82f6',
        text: '#2563eb',
        glow: 'rgba(59, 130, 246, 0.3)',
        icon: '⚡',
      },
      [ReputationTier.Expert]: {
        bg: 'rgba(139, 92, 246, 0.15)',
        border: '#8b5cf6',
        text: '#7c3aed',
        glow: 'rgba(139, 92, 246, 0.3)',
        icon: '💎',
      },
      [ReputationTier.Oracle]: {
        bg: 'rgba(251, 191, 36, 0.15)',
        border: '#fbbf24',
        text: '#f59e0b',
        glow: 'rgba(251, 191, 36, 0.3)',
        icon: '👑',
      },
    };
    return styles[tier];
  };

  const tierStyle = getTierStyle(tier);
  const label = TIER_LABELS[tier];

  // Size-based classes
  const sizeClasses = {
    small: {
      container: 'px-2 py-1 text-xs',
      icon: 'text-sm',
      label: 'text-xs',
    },
    medium: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'text-base',
      label: 'text-sm',
    },
    large: {
      container: 'px-4 py-2 text-base',
      icon: 'text-xl',
      label: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border-2 font-bold uppercase tracking-wide transition-all ${classes.container}`}
      style={{
        background: tierStyle.bg,
        borderColor: tierStyle.border,
        color: tierStyle.text,
        boxShadow: `0 0 20px ${tierStyle.glow}`,
      }}
    >
      <span className={classes.icon}>{tierStyle.icon}</span>
      {showLabel && (
        <span className={classes.label} style={{ color: tierStyle.text }}>
          {label}
        </span>
      )}
    </div>
  );
}
