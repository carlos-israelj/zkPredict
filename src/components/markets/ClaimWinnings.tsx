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
      // Get the bet record (can be encrypted "record1..." or decrypted JSON format)
      const betRecord = betRecordString.trim();

      // Basic validation - must not be empty
      if (!betRecord) {
        alert('Please paste your Bet record.');
        setIsClaiming(false);
        return;
      }

      // Prepare transaction inputs for claim_winnings
      // Signature: claim_winnings(bet: Bet)
      // Note: Leo Wallet will automatically find and use the record from the user's wallet
      const inputs = [
        betRecord, // bet: Bet record (encrypted format from wallet)
      ];

      console.log('Claiming winnings with bet record:', betRecord.substring(0, 50) + '...');

      // Create transaction using the Aleo wallet adapter
      const transaction = Transaction.createTransaction(
        publicKey,
        'testnetbeta', // Use testnetbeta network
        'zkpredict.aleo', // Our deployed program
        'claim_winnings',
        inputs,
        100000, // 0.1 credits fee (reduced for testing)
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
                      <li>Open Leo Wallet extension</li>
                      <li>Go to "Recent Activity" and find your bet transaction</li>
                      <li>Click on the transaction to view details</li>
                      <li>Scroll down to "OUTPUTS" section</li>
                      <li>Copy the ENTIRE encrypted record (starts with "record1...")</li>
                      <li>Paste it in the field below</li>
                    </ol>
                    <p className="text-xs mt-2">
                      <strong>Note:</strong> Bet records are private and encrypted. Only you can see them in your wallet.
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
                <span className="label-text-alt">From Leo Wallet OUTPUTS section</span>
              </label>
              <textarea
                placeholder="record1qvqsq6y59ff5yswzv72zkaarjl3jrxvryg8258l75yjvxc4w9hcq36csq5yk6ctjddjhghmfv3psqqszqqv44g03xwsjqxsutgd2n58fhpd6zqxvlmg0uhmxdys9z97qn7fp94fpjtv2dag07xxxprg70c3835pe8rygkq6jvqn9rz2yvgpuf3sgqe3x2azld9jyxqqzqgq2a4hk3eg5u4e9apsc9p8dw07qed248jv766t6q2pv8f9e49gajqtgmjh2mzarqr63ymk9m0vrksu39xmen0keg2hwx6xw7d7xktx3pgrk7at5vdhk6efrqqpqzqr95gxg2vut3228qphkeus467xn7g7z2l5f9zcde2nydysk8hw2pvrxzmt0w4h8ggcqqgqsqyenz5g6mqrtgzkk736u2xddpnwjf8kxn8lvaw2dckgzte9lergfpdhkgerntashghmzv46zxqqzqyqrqd07yu6glfcqgx5dc9u45u0y6dkekfssjg8xlkm6l4576nm3zy03u3cs0qwqp234wzrg4cn0la5dxwtayhyj4f9zpm35zeysdw69pg4yge8m"
                className="textarea textarea-bordered h-40 font-mono text-xs"
                value={betRecordString}
                onChange={(e) => setBetRecordString(e.target.value)}
              />
            </div>

            {/* Info about encrypted records */}
            {betRecordString && betRecordString.startsWith('record1') && (
              <div className="alert alert-info mt-2">
                <div className="text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-4 w-4 inline mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Encrypted record detected. The blockchain will verify if this bet is for the winning outcome when you claim.
                  </span>
                </div>
              </div>
            )}

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
