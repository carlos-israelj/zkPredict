import { useState } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';

import { Market } from '@/types';

interface ClaimWinningsProps {
  market: Market;
  onClaimed?: () => void;
}

export default function ClaimWinnings({ market, onClaimed }: ClaimWinningsProps) {
  const { address, executeTransaction } = useWallet();
  const [betRecord, setBetRecord] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [claimedTxId, setClaimedTxId] = useState<string | null>(null);

  const handleClaimWinnings = async () => {
    if (!address || !executeTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    if (!market.resolved) {
      alert('This market has not been resolved yet');
      return;
    }

    const recordTrimmed = betRecord.trim();
    if (!recordTrimmed) {
      alert('Please paste your Bet record');
      return;
    }

    // Basic validation: must look like a Bet record JSON object
    if (!recordTrimmed.startsWith('{')) {
      alert('Invalid Bet record format. It should be a JSON object starting with "{"');
      return;
    }

    setIsClaiming(true);

    try {
      // v6 contract signature: claim_winnings(bet: Bet) -> (Winnings, credits, Future)
      // The Bet record is consumed by the transition. We pass the full record JSON.
      const inputs = [
        recordTrimmed, // bet: Bet (the full private record JSON from the wallet)
      ];

      console.log('Claiming winnings with Bet record');

      const result = await executeTransaction({
        program: 'zkpredict_v6.aleo',
        function: 'claim_winnings',
        inputs,
        fee: 100000, // 0.1 credits fee
      });

      const txResponse = result?.transactionId;
      if (!txResponse) {
        throw new Error('Transaction failed: No transaction ID returned');
      }

      console.log('Winnings claimed:', txResponse);
      setClaimedTxId(txResponse);
      setBetRecord('');

      if (onClaimed) {
        onClaimed();
      }

    } catch (error) {
      console.error('Error claiming winnings:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('already claimed') || errorMessage.includes('claimed_bets')) {
        alert('This bet has already been claimed. You cannot claim the same bet twice.');
      } else if (errorMessage.includes('winning_outcome') || errorMessage.includes('outcome')) {
        alert('This bet is for a losing outcome. Only winning bets can be claimed.');
      } else if (errorMessage.includes('not resolved') || errorMessage.includes('resolved')) {
        alert('This market has not been resolved yet.');
      } else if (errorMessage.includes('owner') || errorMessage.includes('caller')) {
        alert('You are not the owner of this Bet record.');
      } else {
        alert(`Failed to claim winnings: ${errorMessage}`);
      }
    } finally {
      setIsClaiming(false);
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
          <h3 className="text-2xl font-bold text-success">Winnings Claimed!</h3>
          <p className="text-sm text-base-content/70 mt-2">
            Your Winnings record has been sent to your wallet.
          </p>
          <div className="bg-base-300 rounded-lg p-3 mt-4 w-full">
            <p className="text-xs text-base-content/50 mb-1">Transaction ID</p>
            <p className="font-mono text-xs break-all">{claimedTxId}</p>
          </div>
          <div className="alert alert-info mt-4 text-left">
            <div className="text-sm">
              <p className="font-bold">Save your Winnings record!</p>
              <p>Check your wallet for the new Winnings record. This is proof of your payout.</p>
            </div>
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={() => setClaimedTxId(null)}
          >
            Claim Another Bet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">Claim Your Winnings</h3>

        {!market.resolved ? (
          <div className="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-bold">Market Not Resolved</h3>
              <div className="text-xs">This market must be resolved before you can claim winnings.</div>
            </div>
          </div>
        ) : (
          <>
            {/* Winning outcome info */}
            <div className="alert alert-success mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Market Resolved</h3>
                <div className="text-xs">
                  Winning outcome: &quot;{market.outcomeLabels?.[market.winningOutcome] ?? `Outcome ${market.winningOutcome + 1}`}&quot;
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-4">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? '▼' : '▶'} How to find your Bet record
              </button>

              {showInstructions && (
                <div className="alert alert-info mt-2">
                  <div className="text-sm space-y-2">
                    <p><strong>To claim winnings, you need the full Bet record JSON:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Open your Leo Wallet (or Puzzle Wallet)</li>
                      <li>Go to Records / Private Records</li>
                      <li>Find the Bet record for this market</li>
                      <li>Copy the full JSON (starts with <code className="bg-base-300 px-1 rounded">{'{'}</code>)</li>
                      <li>Paste it below</li>
                    </ol>
                    <p className="text-xs mt-2 opacity-70">
                      <strong>Note:</strong> Each bet can only be claimed once. The record is consumed (deleted) after claiming.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bet Record Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Paste Your Bet Record (JSON)</span>
                <span className="label-text-alt opacity-60">From your wallet</span>
              </label>
              <textarea
                placeholder={'{\n  "owner": "aleo1...",\n  "bet_id": "...",\n  "market_id": "...",\n  ...\n}'}
                className="textarea textarea-bordered font-mono text-xs h-32 w-full"
                value={betRecord}
                onChange={(e) => setBetRecord(e.target.value)}
              />
              {betRecord && !betRecord.trim().startsWith('{') && (
                <label className="label">
                  <span className="label-text-alt text-error">Invalid format - must be a JSON object starting with {'{'}</span>
                </label>
              )}
            </div>

            {/* Fee info */}
            <div className="text-xs text-base-content/50 mt-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Transaction fee: ~0.1 credits</span>
            </div>

            {/* Claim Button */}
            <div className="card-actions justify-end mt-4">
              <button
                className={`btn btn-success ${isClaiming ? 'loading' : ''}`}
                onClick={handleClaimWinnings}
                disabled={isClaiming || !address || !betRecord.trim()}
              >
                {isClaiming ? 'Claiming...' : 'Claim Winnings'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
