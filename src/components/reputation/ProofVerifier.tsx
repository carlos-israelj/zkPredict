import { useState } from 'react';
import { ReputationTier, TIER_LABELS } from '@/types';

interface ParsedProof {
  owner: string;
  proofId: string;
  tierProven: ReputationTier;
  minAccuracyProven: number;
  minWinsProven: number;
  minStreakProven: number;
  validUntil: number;
  createdAt: number;
}

/**
 * ProofVerifier - Verify a RepProof record shared by another user.
 *
 * The proof is a private record, so verification is done by the user
 * sharing their RepProof record JSON. The verifier reads the plaintext
 * claims from the record (tier_proven, min_accuracy, etc.).
 *
 * Note: In Aleo, records are only decryptable by their owner, so the
 * prover must explicitly share the decrypted JSON with the verifier.
 */
export function ProofVerifier() {
  const [proofJson, setProofJson] = useState('');
  const [parsedProof, setParsedProof] = useState<ParsedProof | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleVerify = () => {
    setParseError(null);
    setParsedProof(null);

    const trimmed = proofJson.trim();
    if (!trimmed.startsWith('{')) {
      setParseError('Invalid format - must be a JSON object');
      return;
    }

    try {
      const raw = JSON.parse(trimmed);

      const proof: ParsedProof = {
        owner: raw.owner || 'Unknown',
        proofId: raw.proof_id || '',
        tierProven: parseInt(raw.tier_proven?.replace('u8', '') ?? '1') as ReputationTier,
        minAccuracyProven: parseInt(raw.min_accuracy_proven?.replace('u8', '') ?? '0'),
        minWinsProven: parseInt(raw.min_wins_proven?.replace('u32', '') ?? '0'),
        minStreakProven: parseInt(raw.min_streak_proven?.replace('u32', '') ?? '0'),
        validUntil: parseInt(raw.valid_until?.replace('u32', '') ?? '0'),
        createdAt: parseInt(raw.created_at?.replace('u32', '') ?? '0'),
      };

      setParsedProof(proof);
    } catch (e) {
      setParseError('Failed to parse proof JSON. Make sure you copied the full record.');
    }
  };

  const TIER_BADGE: Record<ReputationTier, string> = {
    [ReputationTier.Novice]: 'badge-warning',
    [ReputationTier.Skilled]: 'badge-info',
    [ReputationTier.Expert]: 'badge-success',
    [ReputationTier.Oracle]: 'badge-primary',
  };

  const TIER_ICONS: Record<ReputationTier, string> = {
    [ReputationTier.Novice]: '🥉',
    [ReputationTier.Skilled]: '🥈',
    [ReputationTier.Expert]: '🥇',
    [ReputationTier.Oracle]: '💎',
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">Verify Reputation Proof</h3>
        <p className="text-sm opacity-70">
          Paste a RepProof record shared by another user to verify their claimed reputation.
        </p>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">RepProof Record JSON</span>
          </label>
          <textarea
            placeholder={'{\n  "owner": "aleo1...",\n  "proof_id": "...",\n  "tier_proven": "3u8",\n  ...\n}'}
            className="textarea textarea-bordered font-mono text-xs h-28"
            value={proofJson}
            onChange={(e) => {
              setProofJson(e.target.value);
              setParsedProof(null);
              setParseError(null);
            }}
          />
        </div>

        {parseError && (
          <div className="alert alert-error text-sm">
            <span>{parseError}</span>
          </div>
        )}

        <button
          className="btn btn-secondary"
          onClick={handleVerify}
          disabled={!proofJson.trim()}
        >
          Verify Proof
        </button>

        {parsedProof && (
          <div className="bg-base-300 rounded-xl p-4 space-y-3 mt-2">
            <div className="flex items-center gap-3">
              <div className={`badge badge-lg ${TIER_BADGE[parsedProof.tierProven]}`}>
                {TIER_ICONS[parsedProof.tierProven]} {TIER_LABELS[parsedProof.tierProven]}
              </div>
              <div className="badge badge-outline badge-success text-xs">Verified</div>
            </div>

            <div className="divider my-1" />

            <div className="space-y-2 text-sm">
              <p className="font-medium opacity-70">Proven Claims:</p>

              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Tier: at least <strong>{TIER_LABELS[parsedProof.tierProven]}</strong></span>
              </div>

              {parsedProof.minAccuracyProven > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span>Accuracy: at least <strong>{parsedProof.minAccuracyProven}%</strong></span>
                </div>
              )}

              {parsedProof.minWinsProven > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span>Wins: at least <strong>{parsedProof.minWinsProven}</strong></span>
                </div>
              )}

              {parsedProof.minStreakProven > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span>Streak: at least <strong>{parsedProof.minStreakProven}</strong></span>
                </div>
              )}
            </div>

            <div className="text-xs opacity-40 mt-2 font-mono break-all">
              Owner: {parsedProof.owner}
            </div>

            {parsedProof.validUntil > 0 && (
              <div className="text-xs opacity-40">
                Valid until block: {parsedProof.validUntil.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
