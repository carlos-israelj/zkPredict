import type { NextPageWithLayout } from '@/types';
import { useState, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import Link from 'next/link';
import { useReputation } from '@/hooks/useReputation';
import { useParlays, ParlayLegInput } from '@/hooks/useParlays';
import { LegSelector } from '@/components/parlays/LegSelector';
import { ParlaySlip } from '@/components/parlays/ParlaySlip';
import { Market, ReputationTier, TIER_MAX_LEGS } from '@/types';
import { useAllMarketsMetadata } from '@/hooks/useMarketMetadata';

// Helper: Convert off-chain MarketMetadata to partial Market shape for LegSelector
function metadataToMarket(m: { marketId: string; title?: string; numOutcomes?: number; outcomeLabels?: string[] }): Market {
  return {
    marketId: m.marketId,
    creator: '',
    createdAt: 0,
    endTime: 0,
    resolved: false,
    winningOutcome: 0,
    numOutcomes: m.numOutcomes ?? 2,
    category: 4, // Other
    autoResolve: false,
    totalPool: 0,
    title: m.title,
    outcomeLabels: m.outcomeLabels,
  };
}

const CreateParlayPage: NextPageWithLayout = () => {
  const { address } = useWallet();
  const { reputation } = useReputation();
  const { createParlay, isCreating, error } = useParlays();
  const { markets: allOffChain } = useAllMarketsMetadata();

  const [legs, setLegs] = useState<ParlayLegInput[]>([]);
  const [amount, setAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [txId, setTxId] = useState<string | null>(null);

  const tier = (reputation?.tier ?? ReputationTier.Novice) as ReputationTier;
  const maxLegs = TIER_MAX_LEGS[tier];

  // Fetch wallet balance
  useEffect(() => {
    if (!address) return;
    fetch(`https://api.provable.com/v2/testnet/program/credits.aleo/mapping/account/${address}`)
      .then((r) => r.json())
      .then((data) => {
        const micro = typeof data === 'string' ? parseInt(data.replace('u64', '')) : data;
        setWalletBalance(micro / 1_000_000);
      })
      .catch(() => setWalletBalance(0));
  }, [address]);

  const handleAddLeg = (leg: ParlayLegInput) => {
    if (legs.length >= maxLegs) return;
    setLegs((prev) => [...prev, leg]);
  };

  const handleRemoveLeg = (index: number) => {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!address || !reputation) return;

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      alert('Enter a valid bet amount');
      return;
    }

    if (legs.length < 2) {
      alert('Add at least 2 legs');
      return;
    }

    const reputationRecord = localStorage.getItem(`zkpredict_reputation_record_${address}`);
    if (!reputationRecord) {
      alert('Reputation record not found. Go to Reputation page and update your record.');
      return;
    }

    const result = await createParlay(legs, amountNum, reputationRecord, tier);
    if (result) {
      setTxId(result.txId);
    }
  };

  const markets: Market[] = (allOffChain ?? []).map(metadataToMarket);

  if (txId) {
    return (
      <>
        <NextSeo title="Parlay Placed - zkPredict" />
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="rounded-full bg-success/20 p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-success">Parlay Placed!</h3>
              <p className="text-sm opacity-70 mt-2">
                {legs.length} legs placed privately. Check your wallet for the Parlay record.
              </p>
              <div className="bg-base-300 rounded-lg p-3 mt-4 w-full">
                <p className="text-xs opacity-50 mb-1">Transaction ID</p>
                <p className="font-mono text-xs break-all">{txId}</p>
              </div>
              <div className="alert alert-warning text-left text-sm mt-4">
                <div>
                  <p className="font-bold">Save your Parlay record!</p>
                  <p>Export it from your wallet. You&apos;ll need it to claim winnings if all legs win.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Link href="/parlays" className="btn btn-ghost btn-sm">View Parlays</Link>
                <button className="btn btn-primary btn-sm" onClick={() => { setLegs([]); setAmount(''); setTxId(null); }}>
                  Build Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NextSeo
        title="Create Parlay - zkPredict"
        description="Build a multi-leg parlay on zkPredict"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/parlays" className="btn btn-ghost btn-sm btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              <span className="gradient-text-cyan">Build Parlay</span>
            </h1>
            <p className="text-base-content/60 text-sm">Select {2}-{maxLegs} legs</p>
          </div>
        </div>

        {!address || !reputation ? (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center py-12 space-y-3">
              <p className="opacity-50">Connect wallet and set up reputation to build parlays</p>
              <Link href="/reputation" className="btn btn-primary btn-sm">Set Up Reputation</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Leg selector */}
            <div className="lg:col-span-2 space-y-4">
              {legs.length < maxLegs && (
                <LegSelector
                  markets={markets}
                  onSelect={handleAddLeg}
                  excludeMarketIds={legs.map((l) => l.marketId)}
                />
              )}

              {legs.length >= maxLegs && (
                <div className="alert alert-info text-sm">
                  Maximum legs for your tier ({maxLegs}) reached.
                </div>
              )}

              {error && (
                <div className="alert alert-error text-sm">{error}</div>
              )}
            </div>

            {/* Right: Parlay slip */}
            <div className="space-y-4">
              {/* Amount input */}
              <div className="card bg-base-200 shadow">
                <div className="card-body py-4">
                  <label className="label py-1">
                    <span className="label-text font-medium">Bet Amount (credits)</span>
                    <span className="label-text-alt opacity-60">Balance: {walletBalance.toFixed(2)}</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    placeholder="0.00"
                    className="input input-bordered w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    {[0.25, 0.5, 1.0].map((pct) => (
                      <button
                        key={pct}
                        className="btn btn-xs btn-outline flex-1"
                        onClick={() => setAmount((walletBalance * pct).toFixed(2))}
                      >
                        {pct === 1.0 ? 'MAX' : `${pct * 100}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <ParlaySlip
                legs={legs}
                amount={parseFloat(amount) || 0}
                tier={tier}
                onRemoveLeg={handleRemoveLeg}
                onConfirm={handleConfirm}
                isSubmitting={isCreating}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

CreateParlayPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default CreateParlayPage;
