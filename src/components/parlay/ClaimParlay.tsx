import { useState } from 'react';
import { useParlays } from '@/hooks/useParlays';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';

/**
 * ClaimParlay - UI to claim winnings from a winning parlay.
 *
 * The user must provide:
 * 1. Their Parlay record JSON (from wallet)
 * 2. Their Reputation record JSON (from wallet, required by contract)
 *
 * Contract: claim_parlay(parlay: Parlay, reputation: Reputation) -> (Winnings, Reputation, Future)
 * The Reputation record is CONSUMED and a new updated one is returned.
 */
export default function ClaimParlay() {
  const { address } = useWallet();
  const { claimParlay, isClaiming, error } = useParlays();

  const [parlayRecord, setParlayRecord] = useState('');
  const [reputationRecord, setReputationRecord] = useState('');
  const [showRepInstructions, setShowRepInstructions] = useState(false);
  const [claimedTxId, setClaimedTxId] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!parlayRecord.trim().startsWith('{')) {
      alert('Invalid Parlay record format - must be JSON starting with {');
      return;
    }

    if (!reputationRecord.trim().startsWith('{')) {
      alert('Invalid Reputation record format - must be JSON starting with {');
      return;
    }

    const txId = await claimParlay(parlayRecord, reputationRecord);
    if (txId) {
      setClaimedTxId(txId);
      setParlayRecord('');
      setReputationRecord('');
    }
  };

  if (claimedTxId) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="rounded-full bg-success/20 p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-success">Parlay Claimed!</h3>
          <p className="text-sm opacity-70 mt-2">
            Your Winnings record and updated Reputation record have been sent to your wallet.
          </p>
          <div className="bg-base-300 rounded-lg p-3 mt-4 w-full">
            <p className="text-xs opacity-50 mb-1">Transaction ID</p>
            <p className="font-mono text-xs break-all">{claimedTxId}</p>
          </div>
          <div className="alert alert-info mt-4 text-left text-sm">
            <div>
              <p className="font-bold">Important: Save your new Reputation record!</p>
              <p>Your Reputation was consumed and updated. Check your wallet for the new Reputation record with updated wins/streak/tier.</p>
            </div>
          </div>
          <button className="btn btn-primary mt-4" onClick={() => setClaimedTxId(null)}>
            Claim Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body space-y-4">
        <h3 className="card-title">Claim Parlay Winnings</h3>
        <p className="text-sm opacity-70">
          Provide your Parlay record and Reputation record to claim your winnings.
          Your Reputation will be updated with the win.
        </p>

        {/* Parlay Record */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Parlay Record (JSON)</span>
            <span className="label-text-alt opacity-60">From your wallet</span>
          </label>
          <textarea
            placeholder={'{\n  "owner": "aleo1...",\n  "parlay_id": "...",\n  ...\n}'}
            className="textarea textarea-bordered font-mono text-xs h-28"
            value={parlayRecord}
            onChange={(e) => setParlayRecord(e.target.value)}
          />
        </div>

        {/* Reputation Record */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Reputation Record (JSON)</span>
            <button
              className="label-text-alt btn btn-xs btn-ghost"
              onClick={() => setShowRepInstructions(!showRepInstructions)}
            >
              {showRepInstructions ? 'Hide' : 'Why?'}
            </button>
          </label>

          {showRepInstructions && (
            <div className="alert alert-info text-xs mb-2">
              <div>
                The contract requires your Reputation record to enforce tier gates and update your win stats.
                The record is consumed and a new updated one is returned.
              </div>
            </div>
          )}

          <textarea
            placeholder={'{\n  "owner": "aleo1...",\n  "tier": "1u8",\n  ...\n}'}
            className="textarea textarea-bordered font-mono text-xs h-28"
            value={reputationRecord}
            onChange={(e) => setReputationRecord(e.target.value)}
          />
        </div>

        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="text-xs opacity-50 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Transaction fee: ~0.1 credits</span>
        </div>

        <div className="card-actions justify-end">
          <button
            className={`btn btn-success ${isClaiming ? 'loading' : ''}`}
            onClick={handleClaim}
            disabled={isClaiming || !address || !parlayRecord.trim() || !reputationRecord.trim()}
          >
            {isClaiming ? 'Claiming...' : 'Claim Parlay'}
          </button>
        </div>
      </div>
    </div>
  );
}
