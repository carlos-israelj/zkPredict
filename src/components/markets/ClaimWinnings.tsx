import { useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction } from '@demox-labs/aleo-wallet-adapter-base';
import { Market, Bet } from '@/types';

interface ClaimWinningsProps {
  market: Market;
  onClaimed?: () => void;
}

export default function ClaimWinnings({ market, onClaimed }: ClaimWinningsProps) {
  const { publicKey, requestTransaction } = useWallet();
  const [betRecordString, setBetRecordString] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleClaimWinnings = async () => {
    if (!publicKey || !requestTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    if (!market.resolved) {
      alert('This market has not been resolved yet');
      return;
    }

    if (!betRecordString.trim()) {
      alert('Please paste your Bet record');
      return;
    }

    setIsClaiming(true);

    try {
      // Parse the bet record to validate format
      // In a real app, you'd want more robust parsing
      // The bet record should be in the format returned by place_bet transaction
      const betRecord = betRecordString.trim();

      // Validate that it looks like a record
      if (!betRecord.includes('owner:') || !betRecord.includes('market_id:')) {
        alert('Invalid bet record format. Please paste the complete record from your bet transaction.');
        setIsClaiming(false);
        return;
      }

      // Prepare transaction inputs for claim_winnings
      // Signature: claim_winnings(bet: Bet)
      const inputs = [
        betRecord, // bet: Bet record
      ];

      console.log('Claiming winnings with bet record');

      // Create transaction using the Aleo wallet adapter
      const transaction = Transaction.createTransaction(
        publicKey,
        'testnetbeta', // Use testnetbeta network
        'zkpredict.aleo', // Our deployed program
        'claim_winnings',
        inputs,
        5000000, // 5 credits fee (claim_winnings updates mappings)
        false // Public fee
      );

      // Request transaction from wallet
      const txResponse = await requestTransaction(transaction);

      console.log('Winnings claimed:', txResponse);

      alert('Winnings claimed successfully! Check your wallet for the Winnings record.');

      // Clear form
      setBetRecordString('');

      // Callback to refresh data
      if (onClaimed) {
        onClaimed();
      }

    } catch (error) {
      console.error('Error claiming winnings:', error);

      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('already claimed')) {
        alert('This bet has already been claimed. You cannot claim the same bet twice.');
      } else if (errorMessage.includes('losing outcome')) {
        alert('This bet is for a losing outcome. Only winning bets can be claimed.');
      } else if (errorMessage.includes('not resolved')) {
        alert('This market has not been resolved yet. Please wait for resolution.');
      } else {
        alert(`Failed to claim winnings: ${errorMessage}`);
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">Claim Your Winnings</h3>

        {!market.resolved ? (
          <div className="alert alert-warning">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="font-bold">Market Not Resolved</h3>
                <div className="text-xs">This market must be resolved before you can claim winnings.</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Info Alert with Winning Outcome */}
            <div className="alert alert-success mb-4">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold">Market Resolved</h3>
                  <div className="text-xs">
                    Winning outcome: "{market.outcomeLabels?.[market.winningOutcome] || `Outcome ${market.winningOutcome + 1}`}"
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Toggle */}
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
                    <p><strong>To claim your winnings, you need your Bet record:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to your wallet's transaction history</li>
                      <li>Find the transaction where you placed your bet</li>
                      <li>Look for the "Outputs" or "Records" section</li>
                      <li>Copy the entire Bet record (should include owner, market_id, bet_id, outcome, amount, odds_at_bet)</li>
                      <li>Paste it in the field below</li>
                    </ol>
                    <p className="text-xs mt-2">
                      <strong>Note:</strong> Bet records are private. Only you can see them in your wallet.
                      Each bet can only be claimed once (Wave 2 anti-double-claim protection).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bet Record Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Paste Your Bet Record</span>
                <span className="label-text-alt">From your wallet transaction</span>
              </label>
              <textarea
                placeholder={`Example format:\n{\n  owner: aleo1...,\n  market_id: 123456field,\n  bet_id: 789field,\n  outcome: 1u8,\n  amount: 1000000u64,\n  odds_at_bet: 10000u64\n}`}
                className="textarea textarea-bordered h-40 font-mono text-xs"
                value={betRecordString}
                onChange={(e) => setBetRecordString(e.target.value)}
              />
            </div>

            {/* Warning for Wrong Outcome */}
            {betRecordString && betRecordString.includes(`outcome: ${market.winningOutcome}u8`) && (
              <div className="alert alert-success mt-2">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>This bet is for the winning outcome! You can claim your winnings.</span>
                </div>
              </div>
            )}

            {betRecordString && !betRecordString.includes(`outcome: ${market.winningOutcome}u8`) && betRecordString.includes('outcome:') && (
              <div className="alert alert-error mt-2">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    This bet is for a losing outcome. Only bets on the winning outcome (
                    {market.outcomeLabels?.[market.winningOutcome] || `Outcome ${market.winningOutcome + 1}`}
                    ) can be claimed.
                  </span>
                </div>
              </div>
            )}

            {/* Transaction Fee Info */}
            <div className="text-xs text-gray-500 mt-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Transaction fee: ~5 credits (actual: 2-4 credits)</span>
            </div>

            {/* Claim Button */}
            <div className="card-actions justify-end mt-2">
              <button
                className={`btn btn-success ${isClaiming ? 'loading' : ''}`}
                onClick={handleClaimWinnings}
                disabled={isClaiming || !publicKey || !betRecordString.trim()}
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
