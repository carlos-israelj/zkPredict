import { useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { Market } from '@/types';

interface ClaimTwoWinningsProps {
  market: Market;
  onClaimed?: () => void;
}

export default function ClaimTwoWinnings({ market, onClaimed }: ClaimTwoWinningsProps) {
  const { publicKey, requestTransaction } = useWallet();
  const [betId1, setBetId1] = useState('');
  const [betId2, setBetId2] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleClaimBatch = async () => {
    if (!publicKey || !requestTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    if (!market.resolved) {
      alert('This market has not been resolved yet');
      return;
    }

    if (!betId1.trim() || !betId2.trim()) {
      alert('Please enter both Bet IDs');
      return;
    }

    setIsClaiming(true);

    try {
      // Get the bet_ids (field values)
      const betId1Trimmed = betId1.trim();
      const betId2Trimmed = betId2.trim();

      // Prepare transaction inputs for claim_two_winnings
      // Signature: claim_two_winnings(bet_id_1: field, bet_id_2: field)
      const inputs = [
        betId1Trimmed, // bet_id_1: field
        betId2Trimmed, // bet_id_2: field
      ];

      console.log('Claiming 2 winnings with inputs:', inputs);
      console.log('PublicKey:', publicKey);
      console.log('Bet ID 1:', betId1Trimmed);
      console.log('Bet ID 2:', betId2Trimmed);

      // Create transaction using the Aleo wallet adapter
      const transaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        'zkpredict_v6.aleo', // v5 program with reputation, parlays, and time-weighted betting
        'claim_two_winnings',
        inputs,
        150000, // Slightly higher fee for batch operation
        false // Public fee
      );

      console.log('Transaction object:', transaction);

      // Request transaction from wallet
      const txResponse = await requestTransaction(transaction);

      console.log('Batch winnings claimed:', txResponse);

      alert('Both winnings claimed successfully! Check your wallet for the combined Winnings record.\n\n💡 You saved gas fees by claiming 2 bets at once!');

      // Clear form
      setBetId1('');
      setBetId2('');

      // Callback to refresh data
      if (onClaimed) {
        onClaimed();
      }

    } catch (error) {
      console.error('Error claiming batch winnings:', error);

      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('already claimed')) {
        alert('One or both bets have already been claimed. You cannot claim the same bet twice.');
      } else if (errorMessage.includes('losing outcome')) {
        alert('One or both bets are for losing outcomes. Only winning bets can be claimed.');
      } else if (errorMessage.includes('not resolved')) {
        alert('This market has not been resolved yet. Please wait for resolution.');
      } else {
        alert(`Failed to claim batch winnings: ${errorMessage}`);
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl border-2 border-primary/20">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <h3 className="card-title">⚡ Batch Claim (Save Gas!)</h3>
          <div className="badge badge-success gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            25% Gas Savings
          </div>
        </div>

        <p className="text-sm opacity-70 mb-4">
          Claim 2 winning bets in a single transaction to save on gas fees and reduce metadata leakage.
        </p>

        {/* Instructions Toggle */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="btn btn-ghost btn-sm mb-4"
        >
          {showInstructions ? '▼' : '▶'} How to get Bet IDs
        </button>

        {showInstructions && (
          <div className="alert alert-info mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="text-sm">
              <h4 className="font-bold mb-2">Finding Your Bet IDs:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>After placing a bet, copy the <strong>bet_id</strong> from the Bet record</li>
                <li>The bet_id is a field value (e.g., "123456789field")</li>
                <li>You need 2 winning bet_ids from the same market</li>
                <li>Both bets must be from winning outcomes</li>
              </ol>
            </div>
          </div>
        )}

        {!market.resolved && (
          <div className="alert alert-warning mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>This market has not been resolved yet. You can only claim winnings after resolution.</span>
          </div>
        )}

        {market.resolved && (
          <div className="alert alert-success mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Market resolved! Winning outcome: <strong>{market.outcomeLabels?.[market.winningOutcome] || `Outcome ${market.winningOutcome}`}</strong></span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {/* Bet ID 1 Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">First Bet ID</span>
              <span className="label-text-alt text-xs opacity-60">field value</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 123456789field"
              className="input input-bordered w-full font-mono text-sm"
              value={betId1}
              onChange={(e) => setBetId1(e.target.value)}
              disabled={isClaiming || !market.resolved}
            />
          </div>

          {/* Bet ID 2 Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Second Bet ID</span>
              <span className="label-text-alt text-xs opacity-60">field value</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 987654321field"
              className="input input-bordered w-full font-mono text-sm"
              value={betId2}
              onChange={(e) => setBetId2(e.target.value)}
              disabled={isClaiming || !market.resolved}
            />
          </div>
        </div>

        {/* Claim Button */}
        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-primary btn-block"
            onClick={handleClaimBatch}
            disabled={isClaiming || !market.resolved || !publicKey || !betId1.trim() || !betId2.trim()}
          >
            {isClaiming ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Claiming Batch Winnings...
              </>
            ) : (
              <>
                ⚡ Claim 2 Winnings (Save Gas)
              </>
            )}
          </button>
        </div>

        {/* Benefits Info */}
        <div className="mt-4 p-4 bg-base-300 rounded-lg">
          <h4 className="font-bold text-sm mb-2">💡 Benefits of Batch Claiming:</h4>
          <ul className="text-xs space-y-1 opacity-80">
            <li>✅ <strong>25% Gas Savings:</strong> Pay ~0.15 credits instead of 0.2 credits (2 separate claims)</li>
            <li>✅ <strong>Better Privacy:</strong> Fewer transactions = less metadata leakage</li>
            <li>✅ <strong>Faster:</strong> Get all winnings in one transaction</li>
            <li>✅ <strong>Optional:</strong> You can still use single claim if you prefer</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
