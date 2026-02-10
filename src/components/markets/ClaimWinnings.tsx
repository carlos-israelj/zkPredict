import { useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { Market, Bet } from '@/types';

interface ClaimWinningsProps {
  market: Market;
  onClaimed?: () => void;
}

export default function ClaimWinnings({ market, onClaimed }: ClaimWinningsProps) {
  const { publicKey, requestTransaction } = useWallet();
  const [betId, setBetId] = useState('');
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

    if (!betId.trim()) {
      alert('Please enter your Bet ID');
      return;
    }

    setIsClaiming(true);

    try {
      // Get the bet_id (field value)
      const betIdTrimmed = betId.trim();

      // Prepare transaction inputs for claim_winnings
      // Signature: claim_winnings(bet_id: field)
      const inputs = [
        betIdTrimmed, // bet_id: field
      ];

      console.log('Claiming winnings with inputs:', inputs);
      console.log('PublicKey:', publicKey);
      console.log('Bet ID:', betIdTrimmed);

      // Create transaction using the Aleo wallet adapter
      const transaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        'zkpredict_v5.aleo', // v5 program with reputation, parlays, and time-weighted betting
        'claim_winnings',
        inputs,
        100000, // 0.1 credits fee (reduced for testing)
        false // Public fee
      );

      console.log('Transaction object:', transaction);

      // Request transaction from wallet
      const txResponse = await requestTransaction(transaction);

      console.log('Winnings claimed:', txResponse);

      alert('Winnings claimed successfully! Check your wallet for the Winnings record.');

      // Clear form
      setBetId('');

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
                    <p><strong>To claim your winnings, you need your Bet ID:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Check your wallet or saved betting confirmations for the Bet ID</li>
                      <li>The Bet ID is a field value (looks like "1769752685977field")</li>
                      <li>Copy the Bet ID</li>
                      <li>Paste it in the field below</li>
                    </ol>
                    <p className="text-xs mt-2">
                      <strong>Note:</strong> Each bet can only be claimed once. Make sure you're claiming a winning bet!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bet ID Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Enter Your Bet ID</span>
                <span className="label-text-alt">From your betting confirmation</span>
              </label>
              <input
                type="text"
                placeholder="1769752685977field"
                className="input input-bordered font-mono text-sm"
                value={betId}
                onChange={(e) => setBetId(e.target.value)}
              />
            </div>

            {/* Transaction Fee Info */}
            <div className="text-xs text-gray-500 mt-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Transaction fee: ~0.1 credits (reduced for testing)</span>
            </div>

            {/* Claim Button */}
            <div className="card-actions justify-end mt-2">
              <button
                className={`btn btn-success ${isClaiming ? 'loading' : ''}`}
                onClick={handleClaimWinnings}
                disabled={isClaiming || !publicKey || !betId.trim()}
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
