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
  const [creditsRecord, setCreditsRecord] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

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
          `https://api.explorer.provable.com/v1/testnet/program/credits.aleo/mapping/account/${publicKey}`
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

    const recordTrimmed = creditsRecord.trim();
    if (!recordTrimmed) {
      alert('Please paste your Credits record');
      return;
    }

    // Basic validation: must look like a credits record JSON object
    if (!recordTrimmed.startsWith('{')) {
      alert('Invalid Credits record format. It should be a JSON object starting with "{"');
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
      // Generate unique nonce for bet_id (as field)
      const nonce = `${Date.now()}field`;

      // v6: place_bet signature:
      //   place_bet(payment: credits.aleo/credits, market_id: field, outcome: u8, nonce: field)
      //
      // We pass the full credits record JSON from the user
      const inputs = [
        recordTrimmed,                // payment: credits.aleo/credits (the full private record JSON)
        market.marketId,              // market_id: field (public)
        `${selectedOutcome}u8`,       // outcome: u8 (private input)
        nonce,                        // nonce: field (private, for bet_id generation)
      ];

      console.log('Placing bet with credits record');

      // Create transaction using the Aleo wallet adapter
      // The wallet adapter (Leo Wallet / Puzzle) handles the Credits record resolution
      const transaction = Transaction.createTransaction(
        publicKey,
        'testnetbeta',
        'zkpredict_v6.aleo',
        'place_bet',
        inputs,
        100000, // 0.1 credits fee
        false   // Public fee
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
    if (!successBetId) return;

    try {
      await navigator.clipboard.writeText(successBetId);
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
    setCreditsRecord('');
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
            {/* Outcome Selection - Enhanced with better visual hierarchy - Touch-optimized */}
            <div className="form-control w-full">
              <label className="label pb-3" id="outcome-selection-label">
                <span className="label-text font-bold text-base sm:text-base">Select Outcome</span>
                <span className="label-text-alt text-xs opacity-60 hidden sm:inline">Choose your prediction</span>
              </label>
              <div className="space-y-3 sm:space-y-3" role="radiogroup" aria-labelledby="outcome-selection-label">
                {(market.outcomeLabels || Array(market.numOutcomes).fill(null)).map((label, index) => {
                  const outcomeOdds = oddsData[index];
                  const isSelected = selectedOutcome === index;
                  return (
                    <label
                      key={index}
                      className={`relative flex items-center justify-between p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all transform touch-manipulation min-h-[68px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm active:bg-gray-50'
                      }`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-6 sm:h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}

                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <input
                          type="radio"
                          name="outcome"
                          className="radio radio-primary w-6 h-6 sm:radio-lg flex-shrink-0"
                          checked={isSelected}
                          onChange={() => setSelectedOutcome(index)}
                          aria-label={`Select ${label || `Outcome ${index + 1}`} with ${outcomeOdds?.odds || 0}x odds`}
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`font-bold text-base sm:text-lg block truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                            {label || `Outcome ${index + 1}`}
                          </span>
                          {outcomeOdds && (
                            <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-gray-600 font-medium">
                                {(outcomeOdds.poolSize / 1_000_000).toFixed(2)} credits
                              </span>
                              <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                              <span className="text-xs text-gray-600 font-medium hidden sm:inline">
                                {outcomeOdds.poolShare}% of pool
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {outcomeOdds && (
                        <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                          <div className={`font-black text-xl sm:text-2xl tabular-nums ${isSelected ? 'text-indigo-600' : 'text-gray-900'}`}>
                            {outcomeOdds.odds}x
                          </div>
                          <div className="text-xs text-gray-500 font-semibold mt-0.5">
                            {outcomeOdds.probability}%
                          </div>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bet Amount - Enhanced with better visual feedback - Touch-optimized */}
            <div className="form-control w-full mt-6">
              <label className="label pb-3 flex-col sm:flex-row gap-1 sm:gap-0 items-start sm:items-center">
                <span className="label-text font-bold text-base">Bet Amount</span>
                <span className="label-text-alt font-semibold tabular-nums" id="balance-display">
                  {isLoadingBalance ? (
                    <span className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm">
                      <span className="loading loading-spinner loading-xs" aria-label="Loading balance"></span>
                      Loading...
                    </span>
                  ) : (
                    <span className="text-indigo-600 text-xs sm:text-sm">
                      Balance: {walletBalance.toFixed(2)} credits
                    </span>
                  )}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full h-14 sm:h-14 text-lg font-bold tabular-nums border-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all touch-manipulation"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  aria-label="Enter bet amount in credits"
                  aria-describedby="balance-display"
                />
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-xs sm:text-sm font-semibold text-gray-400">CREDITS</span>
                </div>
              </div>
            </div>

            {/* Quick Bet Buttons - Enhanced styling - Touch-optimized */}
            <div className="mt-4">
              <label className="label pb-2" id="quick-bet-label">
                <span className="label-text font-semibold text-sm">Quick Amount</span>
              </label>
              <div className="grid grid-cols-4 gap-2 sm:gap-3" role="group" aria-labelledby="quick-bet-label">
                {QUICK_BET_PERCENTAGES.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    className="px-2 sm:px-3 py-3 sm:py-2.5 rounded-lg font-bold text-sm transition-all transform hover:scale-105 active:scale-95 bg-gray-100 hover:bg-indigo-600 hover:text-white border-2 border-gray-200 hover:border-indigo-600 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-gray-100 disabled:hover:text-gray-900 touch-manipulation min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={() => handleQuickBet(value)}
                    disabled={!publicKey || walletBalance === 0}
                    aria-label={`Set bet amount to ${label} of balance (${(walletBalance * value).toFixed(2)} credits)`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Credits Record Input */}
            <div className="mt-6">
              <button
                className="btn btn-sm btn-ghost mb-2"
                onClick={() => setShowInstructions(!showInstructions)}
                type="button"
              >
                {showInstructions ? '▼' : '▶'} How to get your Credits record
              </button>

              {showInstructions && (
                <div className="alert alert-info mb-4">
                  <div className="text-sm space-y-2">
                    <p><strong>To place a bet, you need a Credits record with enough balance:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Open your Leo Wallet (or Puzzle Wallet)</li>
                      <li>Go to Records / Private Records</li>
                      <li>Find a Credits record (credits.aleo/credits) with enough microcredits</li>
                      <li>Copy the full JSON (starts with <code className="bg-base-300 px-1 rounded">{'{'}</code>)</li>
                      <li>Paste it below</li>
                    </ol>
                    <p className="text-xs mt-2 opacity-70">
                      <strong>Note:</strong> 1 credit = 1,000,000 microcredits. Make sure your record has at least {betAmount ? Math.ceil(parseFloat(betAmount) * 1_000_000) : '0'} microcredits plus fees.
                    </p>
                  </div>
                </div>
              )}

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Paste Your Credits Record (JSON)</span>
                  <span className="label-text-alt opacity-60">From your wallet</span>
                </label>
                <textarea
                  placeholder={'{\n  "owner": "aleo1...",\n  "microcredits": "1000000u64",\n  ...\n}'}
                  className="textarea textarea-bordered font-mono text-xs h-32 w-full"
                  value={creditsRecord}
                  onChange={(e) => setCreditsRecord(e.target.value)}
                />
                {creditsRecord && !creditsRecord.trim().startsWith('{') && (
                  <label className="label">
                    <span className="label-text-alt text-error">Invalid format - must be a JSON object starting with {'{'}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Potential Winnings - Enhanced prominent section with full breakdown */}
            {betAmount && parseFloat(betAmount) > 0 && (
              <div className="mt-6">
                {/* Main Potential Return Card */}
                <div className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-300 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-green-900 uppercase tracking-wide">Potential Winnings</h4>
                    </div>
                    <span className="text-xs font-bold text-green-700 bg-white px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                      {currentOdds?.odds || 0}x odds
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    {/* Bet Amount */}
                    <div className="flex items-center justify-between pb-2 border-b border-green-200">
                      <span className="text-sm font-semibold text-green-800">Your Bet</span>
                      <span className="text-lg font-bold text-green-900 tabular-nums">{betAmount} credits</span>
                    </div>

                    {/* Potential Profit */}
                    <div className="flex items-center justify-between pb-2 border-b border-green-200">
                      <span className="text-sm font-semibold text-green-800">Potential Profit</span>
                      <span className="text-lg font-bold text-green-700 tabular-nums">
                        +{potentialReturn ? (parseFloat(potentialReturn) - parseFloat(betAmount)).toFixed(2) : '0.00'} credits
                      </span>
                    </div>

                    {/* Total Return - Most Prominent */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-green-900 uppercase">Total Return</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-green-700 tabular-nums">{potentialReturn || '0.00'}</span>
                          <span className="text-sm font-bold text-green-600">credits</span>
                        </div>
                      </div>
                      <div className="mt-1 text-right">
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          {potentialReturn && parseFloat(betAmount) > 0
                            ? ((parseFloat(potentialReturn) / parseFloat(betAmount) - 1) * 100).toFixed(1)
                            : '0.0'}% ROI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="mt-4 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700 flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>You will receive this amount if your prediction is correct and you claim your winnings after the market resolves.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Information - Enhanced compact design */}
            <div className="mt-6 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-1 text-sm text-indigo-900">Zero-Knowledge Privacy</h4>
                  <p className="text-xs text-indigo-700 mb-3">
                    Your bet details are completely private. Only pool totals and odds are public.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white rounded-lg p-2 border border-indigo-100">
                      <div className="font-semibold text-indigo-900 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Public
                      </div>
                      <div className="text-gray-600 space-y-0.5">
                        <div>Pool sizes</div>
                        <div>Current odds</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-indigo-100">
                      <div className="font-semibold text-indigo-900 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Private
                      </div>
                      <div className="text-gray-600 space-y-0.5">
                        <div>Your bet amount</div>
                        <div>Your choice</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-indigo-200 text-xs text-indigo-700">
                    <strong>Fee:</strong> 0.1 credits
                  </div>
                </div>
              </div>
            </div>

            {/* Place Bet Button - Enhanced with larger size and better visual feedback - Touch-optimized */}
            <div className="mt-6">
              <button
                className={`w-full h-14 sm:h-14 rounded-xl font-bold text-base sm:text-lg transition-all transform touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isPlacingBet || !publicKey || !betAmount || !creditsRecord.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:from-indigo-800 active:to-indigo-900 text-white border-2 border-indigo-600 hover:border-indigo-700 shadow-lg hover:shadow-xl active:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                }`}
                onClick={handlePlaceBet}
                disabled={isPlacingBet || !publicKey || !betAmount || !creditsRecord.trim()}
                aria-label={
                  !publicKey
                    ? 'Connect wallet to place bet'
                    : !betAmount
                    ? 'Enter bet amount to continue'
                    : !creditsRecord.trim()
                    ? 'Paste your credits record to continue'
                    : `Place bet of ${betAmount} credits on ${market.outcomeLabels?.[selectedOutcome] || `Outcome ${selectedOutcome + 1}`}`
                }
                aria-busy={isPlacingBet}
              >
                {isPlacingBet ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Bet...
                  </span>
                ) : !publicKey ? (
                  'Connect Wallet to Bet'
                ) : !betAmount ? (
                  'Enter Bet Amount'
                ) : !creditsRecord.trim() ? (
                  'Paste Credits Record'
                ) : (
                  `Place Bet - ${betAmount} Credits`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
