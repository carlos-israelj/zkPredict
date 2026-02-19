import { useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Reputation, ReputationTier, TIER_LABELS, calculateAccuracy } from '@/types';
import { useReputation } from '@/hooks/useReputation';

interface ProofGeneratorProps {
  reputation: Reputation;
  reputationRecord: string; // Full JSON record from wallet
}

export function ProofGenerator({ reputation, reputationRecord }: ProofGeneratorProps) {
  const { publicKey } = useWallet();
  const { proveReputation, isProving, error } = useReputation();

  const [minTier, setMinTier] = useState<ReputationTier>(reputation.tier as ReputationTier);
  const [minAccuracy, setMinAccuracy] = useState(0);
  const [minWins, setMinWins] = useState(0);
  const [minStreak, setMinStreak] = useState(0);
  const [txId, setTxId] = useState<string | null>(null);

  const accuracy = calculateAccuracy(reputation.totalWins, reputation.totalBets);

  const handleGenerate = async () => {
    if (!reputationRecord) {
      alert('Paste your Reputation record JSON first');
      return;
    }
    const id = await proveReputation(minTier, minAccuracy, minWins, minStreak);
    if (id) setTxId(id);
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">Generate Reputation Proof</h3>
        <p className="text-sm opacity-70">
          Create a ZK proof that reveals only what you choose, without exposing your full stats.
        </p>

        {txId ? (
          <div className="space-y-3">
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <span>Proof generated! Check your wallet for the RepProof record.</span>
            </div>
            <div className="bg-base-300 rounded p-2">
              <p className="text-xs opacity-50">Transaction ID</p>
              <p className="font-mono text-xs break-all">{txId}</p>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => setTxId(null)}>
              Generate Another Proof
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Proof options */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Prove Minimum Tier</span>
                <span className="label-text-alt opacity-60">Your tier: {TIER_LABELS[reputation.tier as ReputationTier]}</span>
              </label>
              <select
                className="select select-bordered"
                value={minTier}
                onChange={(e) => setMinTier(Number(e.target.value) as ReputationTier)}
              >
                {Object.values(ReputationTier)
                  .filter((v) => typeof v === 'number' && (v as number) <= reputation.tier)
                  .map((tier) => (
                    <option key={tier} value={tier as number}>
                      {TIER_LABELS[tier as ReputationTier]}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Prove Min Accuracy (%)</span>
                <span className="label-text-alt opacity-60">Your accuracy: {accuracy.toFixed(1)}%</span>
              </label>
              <input
                type="number"
                min={0}
                max={Math.floor(accuracy)}
                className="input input-bordered"
                value={minAccuracy}
                onChange={(e) => setMinAccuracy(Math.min(Math.floor(accuracy), Number(e.target.value)))}
              />
              <label className="label">
                <span className="label-text-alt opacity-50">
                  Set to 0 to not prove accuracy
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Prove Min Wins</span>
                <span className="label-text-alt opacity-60">Your wins: {reputation.totalWins}</span>
              </label>
              <input
                type="number"
                min={0}
                max={reputation.totalWins}
                className="input input-bordered"
                value={minWins}
                onChange={(e) => setMinWins(Math.min(reputation.totalWins, Number(e.target.value)))}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Prove Min Streak</span>
                <span className="label-text-alt opacity-60">Best streak: {reputation.bestStreak}</span>
              </label>
              <input
                type="number"
                min={0}
                max={reputation.bestStreak}
                className="input input-bordered"
                value={minStreak}
                onChange={(e) => setMinStreak(Math.min(reputation.bestStreak, Number(e.target.value)))}
              />
            </div>

            {/* What will be proven */}
            <div className="bg-base-300 rounded-lg p-3 text-sm space-y-1">
              <p className="font-medium opacity-70">What this proof will reveal:</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Tier is at least <strong>{TIER_LABELS[minTier]}</strong></li>
                {minAccuracy > 0 && <li>✓ Accuracy is at least <strong>{minAccuracy}%</strong></li>}
                {minWins > 0 && <li>✓ Has at least <strong>{minWins} wins</strong></li>}
                {minStreak > 0 && <li>✓ Has a streak of at least <strong>{minStreak}</strong></li>}
              </ul>
              <p className="text-xs opacity-40 mt-2">Everything else stays private.</p>
            </div>

            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            <div className="card-actions justify-end">
              <button
                className={`btn btn-primary ${isProving ? 'loading' : ''}`}
                onClick={handleGenerate}
                disabled={isProving || !publicKey}
              >
                {isProving ? 'Generating Proof...' : 'Generate ZK Proof'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
