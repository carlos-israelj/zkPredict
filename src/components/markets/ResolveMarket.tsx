import { useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction } from '@demox-labs/aleo-wallet-adapter-base';
import { Market } from '@/types';

interface ResolveMarketProps {
  market: Market;
  onResolved?: () => void;
}

export default function ResolveMarket({ market, onResolved }: ResolveMarketProps) {
  const { publicKey, requestTransaction } = useWallet();
  const [selectedWinningOutcome, setSelectedWinningOutcome] = useState(0);
  const [isResolving, setIsResolving] = useState(false);

  const handleResolveMarket = async () => {
    if (!publicKey || !requestTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    if (market.resolved) {
      alert('This market is already resolved');
      return;
    }

    // Check if user is the creator
    const isCreator = publicKey === market.creator;
    const now = Math.floor(Date.now() / 1000);
    const hasEnded = now >= market.endTime;

    // Verify permissions (Wave 2: creator OR auto_resolve after end_time)
    if (!isCreator && !market.autoResolve) {
      alert('Only the market creator can resolve this market');
      return;
    }

    if (!isCreator && !hasEnded) {
      alert('Auto-resolve is only available after the end time');
      return;
    }

    setIsResolving(true);

    try {
      // Get current timestamp for validation
      const currentTime = Math.floor(Date.now() / 1000);

      // Prepare transaction inputs for resolve_market
      // Signature: resolve_market(market_id: field, winning_outcome: u8, current_time: u32)
      const inputs = [
        market.marketId, // market_id: field
        `${selectedWinningOutcome}u8`, // winning_outcome: u8
        `${currentTime}u32`, // current_time: u32 (for validation)
      ];

      console.log('Resolving market with inputs:', inputs);

      // Create transaction using the Aleo wallet adapter
      const transaction = Transaction.createTransaction(
        publicKey,
        'testnetbeta', // Use testnetbeta network
        'zkpredict_v5.aleo', // v5 program with reputation, parlays, and time-weighted betting
        'resolve_market',
        inputs,
        100000, // 0.1 credits fee (reduced for testing)
        false // Public fee
      );

      // Request transaction from wallet
      const txResponse = await requestTransaction(transaction);

      console.log('Market resolved:', txResponse);

      alert(
        `Market resolved successfully!\nWinning outcome: "${
          market.outcomeLabels?.[selectedWinningOutcome] || `Outcome ${selectedWinningOutcome + 1}`
        }"`
      );

      // Callback to refresh market data
      if (onResolved) {
        onResolved();
      }

    } catch (error) {
      console.error('Error resolving market:', error);
      alert('Failed to resolve market. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  // Check if user can resolve
  const isCreator = publicKey === market.creator;
  const now = Math.floor(Date.now() / 1000);
  const hasEnded = now >= market.endTime;
  const canResolve = isCreator || (market.autoResolve && hasEnded);

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">Resolve Market</h3>

        {market.resolved ? (
          <div className="alert alert-success">
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
                <h3 className="font-bold">Market Already Resolved</h3>
                <div className="text-xs">
                  Winning outcome: "{market.outcomeLabels?.[market.winningOutcome] || `Outcome ${market.winningOutcome + 1}`}"
                </div>
              </div>
            </div>
          </div>
        ) : !canResolve ? (
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
                <h3 className="font-bold">Cannot Resolve Market</h3>
                <div className="text-xs">
                  {!isCreator && !market.autoResolve && 'Only the market creator can resolve this market'}
                  {!isCreator && market.autoResolve && !hasEnded &&
                    `Auto-resolve will be available after ${new Date(market.endTime * 1000).toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Info Alert */}
            <div className="alert alert-info mb-4">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current flex-shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold">Select the Winning Outcome</h3>
                  <div className="text-xs">
                    {isCreator ? 'As the creator, you can resolve this market.' : 'Auto-resolve is enabled for this market.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Outcome Selection */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Select Winning Outcome</span>
              </label>
              <div className="space-y-2">
                {(market.outcomeLabels || Array(market.numOutcomes).fill(null)).map((label, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedWinningOutcome === index
                        ? 'border-success bg-success/10'
                        : 'border-base-300 hover:border-success/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="winning_outcome"
                      className="radio radio-success"
                      checked={selectedWinningOutcome === index}
                      onChange={() => setSelectedWinningOutcome(index)}
                    />
                    <span className="ml-3 font-semibold">
                      {label || `Outcome ${index + 1}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Transaction Fee Info */}
            <div className="text-xs text-gray-500 mt-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Transaction fee: ~0.1 credits (reduced for testing)</span>
            </div>

            {/* Resolve Button */}
            <div className="card-actions justify-end mt-2">
              <button
                className={`btn btn-success ${isResolving ? 'loading' : ''}`}
                onClick={handleResolveMarket}
                disabled={isResolving || !publicKey}
              >
                {isResolving ? 'Resolving...' : 'Resolve Market'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
