import { useState, useEffect } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction } from '@demox-labs/aleo-wallet-adapter-base';
import { Market, OddsData, getTransactionExplorerUrl } from '@/types';

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
  const [successBetId, setSuccessBetId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
        'zkpredict2.aleo', // Our deployed program
        'place_bet',
        inputs,
        100000, // 0.1 credits fee (reduced for testing)
        false // Public fee
      );

      // Request transaction from wallet
      const txResponse = await requestTransaction(transaction);

      console.log('Bet placed:', txResponse);

      // Show success message with transaction ID
      setSuccessTxId(txResponse as string);

      // Fetch the actual bet_id from the transaction after it's confirmed
      // The bet_id is the hash of the nonce, stored in the future arguments
      setTimeout(async () => {
        try {
          const response = await fetch(`https://api.provable.com/v2/testnet/transaction/${txResponse}`);
          const txData = await response.json();

          // Extract bet_id from the future arguments (4th argument is the hashed bet_id)
          const futureOutput = txData.execution?.transitions?.[0]?.outputs?.find(
            (output: any) => output.type === 'future'
          );

          if (futureOutput?.value) {
            // Parse the future value to extract the bet_id (4th argument)
            const match = futureOutput.value.match(/arguments:\s*\[([\s\S]*?)\]/);
            if (match) {
              const args = match[1].split(',').map((arg: string) => arg.trim());
              // The 4th argument (index 3) is the hashed bet_id
              const betId = args[3];
              console.log('Extracted bet_id from transaction:', betId);
              setSuccessBetId(betId);
            }
          }
        } catch (error) {
          console.error('Error fetching bet_id from transaction:', error);
          // Fallback to showing the nonce with a warning
          setSuccessBetId(`${nonce} (Note: Use transaction explorer to get the actual bet_id)`);
        }
      }, 3000); // Wait 3 seconds for transaction to be indexed

    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleCopyBetRecord = async () => {
    if (!successBetRecord) return;

    try {
      await navigator.clipboard.writeText(successBetRecord);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const handlePlaceAnotherBet = () => {
    setBetAmount('');
    setSuccessTxId(null);
    setSuccessBetId(null);
    setCopied(false);
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
                <div className="font-semibold col-span-2 mt-2 border-t border-success/20 pt-2">
                  Bet ID (save this to claim winnings):
                </div>
                <div className="col-span-2 font-mono text-xs break-all bg-base-300 p-2 rounded">
                  {successBetId || (
                    <span className="text-gray-500 italic">Loading bet_id from blockchain...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="alert alert-info w-full max-w-2xl mb-6">
            <div className="flex flex-col gap-2 w-full text-left">
              <div className="font-semibold">Transaction Submitted</div>
              <div className="text-sm">
                Your bet has been broadcast to the Aleo blockchain and is being confirmed.
              </div>
              <div className="text-xs opacity-75 mt-2 space-y-1">
                <div><strong>To view your transaction:</strong></div>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open Leo Wallet extension</li>
                  <li>Go to "Recent Activity"</li>
                  <li>Find this transaction and click for details</li>
                  <li>Copy the transaction ID (starts with "at1...")</li>
                  <li>Search it on <a href="https://testnet.explorer.provable.com" target="_blank" rel="noopener noreferrer" className="link link-primary">testnet.explorer.provable.com</a></li>
                </ol>
              </div>
            </div>
          </div>

          {/* Bet ID Section */}
          <div className="alert alert-warning w-full max-w-2xl mb-6">
            <div className="flex flex-col gap-3 w-full">
              <div className="text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <strong>SAVE YOUR BET ID!</strong> You need it to claim winnings if you win.
              </div>

              <div className="bg-base-300 p-3 rounded text-xs space-y-2">
                <div className="font-semibold">Your Bet ID is shown above in the Bet Summary.</div>
                <div>Copy it and save it in a safe place (notepad, password manager, screenshot, etc.)</div>
                <div className="text-warning font-semibold mt-2">Without your Bet ID, you cannot claim your winnings!</div>
              </div>
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
                              {(outcomeOdds.poolSize / 1_000_000).toFixed(2)} credits ({outcomeOdds.poolShare}% of pool)
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

            {/* Privacy Information */}
            <div className="bg-base-300 rounded-lg p-4 mt-6 border-l-4 border-primary">
              <div className="flex items-start gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1 text-sm">Your Bet is Completely Private</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Zero-knowledge proofs protect your betting activity from public view
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <span className="badge badge-xs gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Publicly Visible
                    </span>
                  </h5>
                  <ul className="text-xs space-y-1">
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Total pool size updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Current odds changes</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <span className="badge badge-xs gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Always Hidden
                    </span>
                  </h5>
                  <ul className="text-xs space-y-1">
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Your bet amount ({betAmount} credits)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Which outcome you chose</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Your wallet address</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-base-content/10 text-xs text-gray-600 dark:text-gray-400">
                <strong>Transaction fee:</strong> 0.1 credits (reduced for testing)
              </div>
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
