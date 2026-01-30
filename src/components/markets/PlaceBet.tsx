import { useState, useEffect } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction } from '@demox-labs/aleo-wallet-adapter-base';
import { Market, OddsData } from '@/types';

const QUICK_BET_PERCENTAGES = [
  { label: '10%', value: 0.1 },
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: 'MAX', value: 1.0 },
];

interface PlaceBetProps {
  market: Market;
  pools: number[]; // Current pool sizes for each outcome
}

export default function PlaceBet({ market, pools }: PlaceBetProps) {
  const { publicKey, requestTransaction } = useWallet();
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [betAmount, setBetAmount] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [oddsData, setOddsData] = useState<OddsData[]>([]);
  const [successTxId, setSuccessTxId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch wallet balance from Aleo blockchain
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setWalletBalance(0);
        return;
      }

      try {
        setIsLoadingBalance(true);

        // Query balance from Aleo testnet
        // Credits are stored in the credits.aleo program
        const response = await fetch(
          `https://api.provable.com/v2/testnet/program/credits.aleo/mapping/account/${publicKey}`
        );

        if (response.ok) {
          const balanceData = await response.json();
          // Balance is returned in microcredits (1 credit = 1,000,000 microcredits)
          // Parse the u64 value
          const balanceMicrocredits = typeof balanceData === 'string'
            ? parseInt(balanceData.replace('u64', ''))
            : balanceData;

          const balanceCredits = balanceMicrocredits / 1_000_000;
          setWalletBalance(balanceCredits);
        } else {
          // If 404, wallet has 0 balance
          setWalletBalance(0);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setWalletBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, [publicKey]);

  // Calculate odds for all outcomes (Wave 3)
  useEffect(() => {
    if (!pools || pools.length === 0) {
      setOddsData([]);
      return;
    }

    const totalPool = pools.reduce((sum, pool) => sum + pool, 0);

    const calculatedOdds: OddsData[] = pools.map((poolSize, index) => {
      const poolShare = totalPool > 0 ? (poolSize / totalPool) * 100 : 0;
      const probability = poolShare;
      const odds = poolSize > 0 ? totalPool / poolSize : 0;

      return {
        outcome: index,
        odds: Number(odds.toFixed(2)),
        probability: Number(probability.toFixed(1)),
        poolSize,
        poolShare: Number(poolShare.toFixed(1)),
      };
    });

    setOddsData(calculatedOdds);
  }, [pools]);

  const handlePlaceBet = async () => {
    if (!publicKey || !requestTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }

    if (market.resolved) {
      alert('This market is already resolved');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now >= market.endTime) {
      alert('This market has ended');
      return;
    }

    setIsPlacingBet(true);

    try {
      // Wave 2: Generate unique nonce for bet_id (as field)
      const nonce = `${Date.now()}field`;

      // Convert amount to microcredits (1 credit = 1,000,000 microcredits)
      const amountInMicrocredits = Math.floor(amount * 1_000_000);

      // Prepare transaction inputs for place_bet
      // Signature: place_bet(market_id: field, outcome: u8, amount: u64, nonce: field)
      const inputs = [
        market.marketId, // market_id: field
        `${selectedOutcome}u8`, // outcome: u8
        `${amountInMicrocredits}u64`, // amount: u64
        nonce, // nonce: field (for unique bet_id generation)
      ];

      console.log('Placing bet with inputs:', inputs);

      // Create transaction using the Aleo wallet adapter
      const transaction = Transaction.createTransaction(
        publicKey,
        'testnetbeta', // Use testnetbeta network
        'zkpredict.aleo', // Our deployed program
        'place_bet',
        inputs,
        5000000, // 5 credits fee (place_bet updates mappings)
        false // Public fee
      );

      // Request transaction from wallet
      const txResponse = await requestTransaction(transaction);

      console.log('Bet placed:', txResponse);

      // Show success message with transaction ID
      setSuccessTxId(txResponse as string);

    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handlePlaceAnotherBet = () => {
    setBetAmount('');
    setSuccessTxId(null);
  };

  // Show success screen if transaction succeeded
  if (successTxId) {
    const selectedOutcomeLabel = market.outcomeLabels?.[selectedOutcome] || `Outcome ${selectedOutcome + 1}`;
    const currentOdds = oddsData[selectedOutcome];
    const potentialReturn = currentOdds && betAmount
      ? (parseFloat(betAmount) * currentOdds.odds).toFixed(2)
      : '0.00';

    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          {/* Success Icon */}
          <div className="rounded-full bg-success/20 p-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="card-title text-3xl mb-2">Bet Placed Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your bet has been submitted to the Aleo blockchain.
          </p>

          {/* Bet Summary */}
          <div className="alert alert-success w-full max-w-2xl mb-4">
            <div className="flex flex-col gap-2 w-full text-left">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Outcome:</div>
                <div>{selectedOutcomeLabel}</div>
                <div className="font-semibold">Amount:</div>
                <div>{betAmount} credits</div>
                <div className="font-semibold">Odds:</div>
                <div>{currentOdds?.odds}x</div>
                <div className="font-semibold">Potential Return:</div>
                <div className="text-success font-bold">{potentialReturn} credits</div>
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="alert alert-info w-full max-w-2xl mb-6">
            <div className="flex flex-col gap-2 w-full">
              <div className="font-semibold">Transaction ID:</div>
              <div className="font-mono text-xs break-all">{successTxId}</div>
              <a
                href={`https://explorer.aleo.org/transaction/${successTxId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline mt-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View on Explorer
              </a>
            </div>
          </div>

          {/* Important Note */}
          <div className="alert alert-warning w-full max-w-2xl mb-6">
            <div className="text-sm">
              <strong>IMPORTANT:</strong> Save the Bet record from your wallet's transaction output.
              You'll need this record to claim your winnings if your outcome wins!
            </div>
          </div>

          {/* Info Message */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xl">
            <strong>Note:</strong> Pool balances will update once the transaction is confirmed (3-5 minutes).
          </div>

          {/* Action Button */}
          <button className="btn btn-primary w-full max-w-md" onClick={handlePlaceAnotherBet}>
            Place Another Bet
          </button>
        </div>
      </div>
    );
  }

  const currentOdds = oddsData[selectedOutcome];
  const potentialReturn = currentOdds && betAmount
    ? (parseFloat(betAmount) * currentOdds.odds).toFixed(2)
    : '0.00';

  const handleQuickBet = (percentage: number) => {
    const amount = (walletBalance * percentage).toFixed(2);
    setBetAmount(amount);
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">Place Your Bet</h3>

        {market.resolved ? (
          <div className="alert alert-warning">
            <span>This market has been resolved</span>
          </div>
        ) : Math.floor(Date.now() / 1000) >= market.endTime ? (
          <div className="alert alert-info">
            <span>This market has ended. Waiting for resolution...</span>
          </div>
        ) : (
          <>
            {/* Outcome Selection (Wave 3: Multi-outcome support) */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Select Outcome</span>
              </label>
              <div className="space-y-2">
                {(market.outcomeLabels || Array(market.numOutcomes).fill(null)).map((label, index) => {
                  const outcomeOdds = oddsData[index];
                  return (
                    <label
                      key={index}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOutcome === index
                          ? 'border-primary bg-primary/10'
                          : 'border-base-300 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="outcome"
                          className="radio radio-primary"
                          checked={selectedOutcome === index}
                          onChange={() => setSelectedOutcome(index)}
                        />
                        <div>
                          <span className="font-semibold">
                            {label || `Outcome ${index + 1}`}
                          </span>
                          {outcomeOdds && (
                            <div className="text-xs text-gray-500">
                              {outcomeOdds.poolSize} credits ({outcomeOdds.poolShare}% of pool)
                            </div>
                          )}
                        </div>
                      </div>
                      {outcomeOdds && (
                        <div className="text-right">
                          <div className="font-bold text-lg">{outcomeOdds.odds}x</div>
                          <div className="text-xs text-gray-500">
                            {outcomeOdds.probability}% probability
                          </div>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bet Amount */}
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text">Bet Amount (credits)</span>
                <span className="label-text-alt text-gray-500">
                  {isLoadingBalance ? (
                    'Loading balance...'
                  ) : (
                    `Balance: ${walletBalance.toFixed(2)} credits`
                  )}
                </span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered w-full"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Quick Bet Buttons */}
            <div className="mt-3">
              <label className="label">
                <span className="label-text text-sm">Quick Bet</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_BET_PERCENTAGES.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => handleQuickBet(value)}
                    disabled={!publicKey || walletBalance === 0}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Potential Return */}
            {betAmount && currentOdds && (
              <div className="alert alert-info mt-4">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Potential Return</span>
                  <span className="text-2xl font-bold">{potentialReturn} credits</span>
                  <span className="text-sm">
                    Profit: {(parseFloat(potentialReturn) - parseFloat(betAmount)).toFixed(2)} credits
                  </span>
                </div>
              </div>
            )}

            {/* Transaction Fee Info */}
            <div className="text-xs text-gray-500 mt-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Transaction fee: ~5 credits (actual: 2-5 credits)</span>
            </div>

            {/* Place Bet Button */}
            <div className="card-actions justify-end mt-2">
              <button
                className={`btn btn-primary ${isPlacingBet ? 'loading' : ''}`}
                onClick={handlePlaceBet}
                disabled={isPlacingBet || !publicKey || !betAmount}
              >
                {isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
