import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction } from '@demox-labs/aleo-wallet-adapter-base';
import { Market, Reputation, TIER_MAX_LEGS, PARLAY_BASE_ODDS, TIER_BONUSES, ReputationTier, getTransactionExplorerUrl } from '@/types';
import TierBadge from '../reputation/TierBadge';

const QUICK_BET_PERCENTAGES = [
  { label: '10%', value: 0.1 },
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: 'MAX', value: 1.0 },
];

interface ParlayLeg {
  marketId: string;
  marketTitle: string;
  outcomeLabels: string[];
  selectedOutcome: number;
}

interface ParlayBuilderProps {
  availableMarkets: Market[];
  reputation?: Reputation;
}

export default function ParlayBuilder({ availableMarkets, reputation }: ParlayBuilderProps) {
  const { publicKey, requestTransaction } = useWallet();
  const [selectedLegs, setSelectedLegs] = useState<ParlayLeg[]>([]);
  const [betAmount, setBetAmount] = useState('');
  const [isPlacingParlay, setIsPlacingParlay] = useState(false);
  const [successTxId, setSuccessTxId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const userTier = (reputation?.tier || 1) as ReputationTier;
  const maxLegs = TIER_MAX_LEGS[userTier];
  const tierBonus = TIER_BONUSES[userTier];

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setWalletBalance(0);
        return;
      }

      try {
        setIsLoadingBalance(true);
        const response = await fetch(
          `https://api.provable.com/v2/testnet/program/credits.aleo/mapping/account/${publicKey}`
        );

        if (response.ok) {
          const balanceData = await response.json();
          const balanceMicrocredits = typeof balanceData === 'string'
            ? parseInt(balanceData.replace('u64', ''))
            : balanceData;
          setWalletBalance(balanceMicrocredits / 1_000_000);
        } else {
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
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey]);

  // Calculate combined odds
  const combinedOdds = useMemo(() => {
    if (selectedLegs.length < 2) return 0;

    const baseOdds = PARLAY_BASE_ODDS[selectedLegs.length as 2 | 3 | 4 | 5] || 0;
    return baseOdds * tierBonus;
  }, [selectedLegs.length, tierBonus]);

  const potentialPayout = useMemo(() => {
    const amount = parseFloat(betAmount);
    if (!amount || !combinedOdds) return 0;
    return amount * combinedOdds;
  }, [betAmount, combinedOdds]);

  const handleAddMarket = (market: Market) => {
    if (selectedLegs.length >= maxLegs) {
      alert(`Your ${userTier === ReputationTier.Novice ? 'Novice' : userTier === ReputationTier.Skilled ? 'Skilled' : userTier === ReputationTier.Expert ? 'Expert' : 'Oracle'} tier allows max ${maxLegs} legs`);
      return;
    }

    if (selectedLegs.some(leg => leg.marketId === market.marketId)) {
      alert('Market already added to parlay');
      return;
    }

    setSelectedLegs([...selectedLegs, {
      marketId: market.marketId,
      marketTitle: market.title || `Market ${market.marketId}`,
      outcomeLabels: market.outcomeLabels || [],
      selectedOutcome: 0,
    }]);
  };

  const handleRemoveLeg = (marketId: string) => {
    setSelectedLegs(selectedLegs.filter(leg => leg.marketId !== marketId));
  };

  const handleUpdateOutcome = (marketId: string, outcome: number) => {
    setSelectedLegs(selectedLegs.map(leg =>
      leg.marketId === marketId ? { ...leg, selectedOutcome: outcome } : leg
    ));
  };

  const handlePlaceParlay = async () => {
    if (!publicKey || !requestTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    if (selectedLegs.length < 2) {
      alert('Select at least 2 markets for a parlay');
      return;
    }

    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }

    setIsPlacingParlay(true);

    try {
      // Generate unique parlay ID
      const parlayNonce = `${Date.now()}field`;
      const amountInMicrocredits = Math.floor(amount * 1_000_000);

      // Prepare inputs for place_parlay transition
      // Build inputs array based on number of legs
      const inputs = [
        parlayNonce, // parlay_id nonce
        selectedLegs[0].marketId, // market1
        `${selectedLegs[0].selectedOutcome}u8`, // outcome1
        selectedLegs[1].marketId, // market2
        `${selectedLegs[1].selectedOutcome}u8`, // outcome2
        selectedLegs[2] ? selectedLegs[2].marketId : '0field', // market3 (optional)
        selectedLegs[2] ? `${selectedLegs[2].selectedOutcome}u8` : '0u8', // outcome3
        selectedLegs[3] ? selectedLegs[3].marketId : '0field', // market4 (optional)
        selectedLegs[3] ? `${selectedLegs[3].selectedOutcome}u8` : '0u8', // outcome4
        selectedLegs[4] ? selectedLegs[4].marketId : '0field', // market5 (optional)
        selectedLegs[4] ? `${selectedLegs[4].selectedOutcome}u8` : '0u8', // outcome5
        `${selectedLegs.length}u8`, // num_legs
        `${amountInMicrocredits}u64`, // amount
      ];

      console.log('Placing parlay with inputs:', inputs);

      const transaction = Transaction.createTransaction(
        publicKey,
        'testnetbeta',
        'zkpredict_v6.aleo',
        'place_parlay',
        inputs,
        100000, // 0.1 credits fee
        false
      );

      const txResponse = await requestTransaction(transaction);
      console.log('Parlay placed:', txResponse);
      setSuccessTxId(txResponse as string);

    } catch (error) {
      console.error('Error placing parlay:', error);
      alert('Failed to place parlay. Please try again.');
    } finally {
      setIsPlacingParlay(false);
    }
  };

  const handleQuickBet = (percentage: number) => {
    const amount = (walletBalance * percentage).toFixed(2);
    setBetAmount(amount);
  };

  const handlePlaceAnotherParlay = () => {
    setBetAmount('');
    setSuccessTxId(null);
    setSelectedLegs([]);
  };

  // Success screen
  if (successTxId) {
    return (
      <div className="card bg-base-200 border-2 border-base-300 shadow-xl">
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

          <h2 className="card-title text-3xl mb-2">Parlay Placed Successfully!</h2>
          <p className="opacity-60 mb-4">
            Your {selectedLegs.length}-leg parlay has been submitted to the Aleo blockchain.
          </p>

          {/* Parlay Summary */}
          <div className="alert alert-success w-full max-w-2xl mb-4">
            <div className="flex flex-col gap-3 w-full text-left">
              <div className="font-bold text-lg border-b border-success/20 pb-2">Parlay Summary</div>
              {selectedLegs.map((leg, idx) => (
                <div key={leg.marketId} className="text-sm">
                  <span className="font-semibold">Leg {idx + 1}:</span> {leg.marketTitle} - {leg.outcomeLabels[leg.selectedOutcome] || `Outcome ${leg.selectedOutcome + 1}`}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-success/20">
                <div className="font-semibold">Amount:</div>
                <div>{betAmount} credits</div>
                <div className="font-semibold">Combined Odds:</div>
                <div>{combinedOdds.toFixed(2)}x</div>
                <div className="font-semibold">Tier Bonus:</div>
                <div>{tierBonus}x</div>
                <div className="font-semibold">Potential Payout:</div>
                <div className="text-success font-bold">{potentialPayout.toFixed(2)} credits</div>
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="alert alert-info w-full max-w-2xl mb-6">
            <div className="flex flex-col gap-2 w-full text-left">
              <div className="font-semibold">Transaction Submitted</div>
              <div className="text-sm">View on <a href={getTransactionExplorerUrl(successTxId)} target="_blank" rel="noopener noreferrer" className="link link-primary">explorer</a></div>
            </div>
          </div>

          <button className="btn btn-primary w-full max-w-md" onClick={handlePlaceAnotherParlay}>
            Build Another Parlay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tier Info */}
      <div className="card bg-base-200 border-2 border-base-300">
        <div className="card-body p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Parlay Builder</h3>
              <p className="text-sm opacity-60">Combine 2-{maxLegs} markets for higher payouts</p>
            </div>
            <div className="flex items-center gap-3">
              <TierBadge tier={userTier} size="medium" />
              <div className="text-right">
                <div className="text-xs font-semibold opacity-50 uppercase">Max Legs</div>
                <div className="text-2xl font-black tabular-nums gradient-text-cyan">{maxLegs}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Legs */}
      {selectedLegs.length > 0 && (
        <div className="card bg-base-200 border-2 border-base-300">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg">Selected Legs ({selectedLegs.length}/{maxLegs})</h4>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setSelectedLegs([])}
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {selectedLegs.map((leg, index) => (
                <div
                  key={leg.marketId}
                  className="p-4 bg-base-100 border-2 border-base-content/10 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-primary badge-sm">Leg {index + 1}</span>
                        <span className="font-bold text-sm">{leg.marketTitle}</span>
                      </div>

                      {/* Outcome Selection */}
                      <div className="space-y-2 mt-3">
                        {leg.outcomeLabels.map((label, outcomeIdx) => (
                          <label
                            key={outcomeIdx}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border-2 ${
                              leg.selectedOutcome === outcomeIdx
                                ? 'border-primary bg-primary/10'
                                : 'border-base-content/10 hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`outcome-${leg.marketId}`}
                              className="radio radio-primary radio-sm"
                              checked={leg.selectedOutcome === outcomeIdx}
                              onChange={() => handleUpdateOutcome(leg.marketId, outcomeIdx)}
                            />
                            <span className="text-sm font-semibold">{label || `Outcome ${outcomeIdx + 1}`}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn btn-ghost btn-sm btn-circle"
                      onClick={() => handleRemoveLeg(leg.marketId)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Combined Odds Display */}
            {selectedLegs.length >= 2 && (
              <div className="mt-4 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-primary rounded-xl">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs font-bold opacity-50 uppercase mb-1">Base Odds</div>
                    <div className="text-2xl font-black gradient-text-cyan tabular-nums">
                      {PARLAY_BASE_ODDS[selectedLegs.length as 2 | 3 | 4 | 5].toFixed(1)}x
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold opacity-50 uppercase mb-1">Tier Bonus</div>
                    <div className="text-2xl font-black gradient-text-amber tabular-nums">
                      {tierBonus.toFixed(1)}x
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold opacity-50 uppercase mb-1">Total Odds</div>
                    <div className="text-2xl font-black gradient-text-cyan tabular-nums">
                      {combinedOdds.toFixed(2)}x
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Market Selection */}
      {selectedLegs.length < maxLegs && (
        <div className="card bg-base-200 border-2 border-base-300">
          <div className="card-body p-5">
            <h4 className="font-bold text-lg mb-4">Add Market to Parlay</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableMarkets
                .filter(m => !m.resolved && !selectedLegs.some(leg => leg.marketId === m.marketId))
                .map(market => (
                  <button
                    key={market.marketId}
                    className="w-full p-3 text-left bg-base-100 border-2 border-base-content/10 rounded-lg hover:border-primary/50 transition-all"
                    onClick={() => handleAddMarket(market)}
                  >
                    <div className="font-semibold text-sm">{market.title || `Market ${market.marketId}`}</div>
                    <div className="text-xs opacity-60 mt-1">
                      {market.outcomeLabels?.join(' vs ') || `${market.numOutcomes} outcomes`}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Bet Amount & Submit */}
      {selectedLegs.length >= 2 && (
        <div className="card bg-base-200 border-2 border-base-300">
          <div className="card-body p-5">
            <h4 className="font-bold text-lg mb-4">Parlay Amount</h4>

            {/* Bet Amount Input */}
            <div className="form-control w-full">
              <label className="label pb-3">
                <span className="label-text font-bold">Bet Amount</span>
                <span className="label-text-alt font-semibold tabular-nums">
                  {isLoadingBalance ? (
                    <span className="flex items-center gap-1 text-gray-400">
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </span>
                  ) : (
                    <span className="gradient-text-cyan">
                      Balance: {walletBalance.toFixed(2)} credits
                    </span>
                  )}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full h-14 text-lg font-bold tabular-nums border-2 focus:border-primary transition-all"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-sm font-semibold opacity-40">CREDITS</span>
                </div>
              </div>
            </div>

            {/* Quick Bet Buttons */}
            <div className="mt-4">
              <label className="label pb-2">
                <span className="label-text font-semibold text-sm">Quick Amount</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_BET_PERCENTAGES.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    className="px-3 py-3 rounded-lg font-bold text-sm transition-all transform hover:scale-105 active:scale-95 bg-base-100 hover:bg-primary hover:text-primary-content border-2 border-base-content/10 hover:border-primary disabled:opacity-50 disabled:hover:scale-100 min-h-[44px]"
                    onClick={() => handleQuickBet(value)}
                    disabled={!publicKey || walletBalance === 0}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Potential Payout */}
            {betAmount && parseFloat(betAmount) > 0 && (
              <div className="mt-6 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-300 rounded-2xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-green-200">
                    <span className="text-sm font-semibold text-green-800">Your Parlay</span>
                    <span className="text-lg font-bold text-green-900 tabular-nums">{betAmount} credits</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-green-200">
                    <span className="text-sm font-semibold text-green-800">Combined Odds</span>
                    <span className="text-lg font-bold text-green-700 tabular-nums">{combinedOdds.toFixed(2)}x</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-green-900 uppercase">Potential Payout</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-green-700 tabular-nums">{potentialPayout.toFixed(2)}</span>
                        <span className="text-sm font-bold text-green-600">credits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Place Parlay Button */}
            <div className="mt-6">
              <button
                className={`w-full h-14 rounded-xl font-bold text-lg transition-all transform ${
                  isPlacingParlay || !publicKey || !betAmount || selectedLegs.length < 2
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                    : 'bg-gradient-to-r from-primary to-cyan-600 hover:from-cyan-600 hover:to-primary text-white border-2 border-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                }`}
                onClick={handlePlaceParlay}
                disabled={isPlacingParlay || !publicKey || !betAmount || selectedLegs.length < 2}
              >
                {isPlacingParlay ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Parlay...
                  </span>
                ) : !publicKey ? (
                  'Connect Wallet to Place Parlay'
                ) : selectedLegs.length < 2 ? (
                  'Select at Least 2 Markets'
                ) : !betAmount ? (
                  'Enter Bet Amount'
                ) : (
                  `Place ${selectedLegs.length}-Leg Parlay`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
