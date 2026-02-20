import type { NextPageWithLayout } from '@/types';
import { useState } from 'react';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import Link from 'next/link';
import { useReputation, saveReputationRecord } from '@/hooks/useReputation';
import { TierProgress } from '@/components/reputation/TierProgress';
import {
  ReputationTier,
  TIER_LABELS,
  TIER_MAX_LEGS,
  TIER_BONUSES,
  calculateAccuracy,
} from '@/types';

const ReputationPage: NextPageWithLayout = () => {
  const { address } = useWallet();
  const { reputation, initReputation, isInitializing, error } = useReputation();

  const [showRecordInput, setShowRecordInput] = useState(false);
  const [recordInput, setRecordInput] = useState('');
  const [initTxId, setInitTxId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInit = async () => {
    const txId = await initReputation();
    if (txId) setInitTxId(txId);
  };

  const handleSaveRecord = () => {
    if (!address || !recordInput.trim().startsWith('{')) return;
    saveReputationRecord(address, recordInput.trim());
    setSaveSuccess(true);
    setRecordInput('');
    setTimeout(() => setSaveSuccess(false), 3000);
    // Reload page to reflect new reputation data
    window.location.reload();
  };

  return (
    <>
      <NextSeo
        title="Reputation - zkPredict"
        description="View your private reputation tier and generate ZK proofs"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text-cyan">Reputation</span>
          </h1>
          <p className="text-base-content/60 text-sm">
            Your private betting history and tier — only you can see the full stats.
          </p>
        </div>

        {!address ? (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-bold opacity-50">Connect Wallet</h3>
              <p className="text-sm opacity-40 mt-2">Connect your wallet to view your reputation</p>
            </div>
          </div>
        ) : !reputation ? (
          <div className="space-y-6">
            {/* New user: init reputation */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center py-12">
                <div className="text-6xl mb-4">🥉</div>
                <h3 className="text-xl font-bold">Start Your Reputation</h3>
                <p className="text-sm opacity-60 mt-2 max-w-md">
                  Initialize your private Reputation record on-chain. This enables parlay betting and tier-based bonuses.
                </p>

                {initTxId ? (
                  <div className="mt-4 space-y-3 w-full max-w-md">
                    <div className="alert alert-success">
                      <span className="text-sm">Reputation initialized! Check your wallet for the Reputation record, then paste it below.</span>
                    </div>
                    <div className="bg-base-300 rounded p-2 text-xs font-mono break-all opacity-60">{initTxId}</div>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowRecordInput(true)}>
                      I have my Reputation record
                    </button>
                  </div>
                ) : (
                  <button
                    className={`btn btn-primary mt-4 ${isInitializing ? 'loading' : ''}`}
                    onClick={handleInit}
                    disabled={isInitializing}
                  >
                    {isInitializing ? 'Initializing...' : 'Initialize Reputation'}
                  </button>
                )}

                {error && <div className="alert alert-error text-sm mt-3">{error}</div>}
              </div>
            </div>

            {/* Or: import existing record */}
            <div className="card bg-base-200 border border-base-300">
              <div className="card-body">
                <button
                  className="btn btn-ghost btn-sm w-fit"
                  onClick={() => setShowRecordInput(!showRecordInput)}
                >
                  {showRecordInput ? '▼' : '▶'} Already have a Reputation record? Import it
                </button>

                {showRecordInput && (
                  <div className="space-y-3 mt-2">
                    <p className="text-sm opacity-60">
                      Paste your Reputation record JSON from your wallet to import your existing stats.
                    </p>
                    <textarea
                      placeholder={'{\n  "owner": "aleo1...",\n  "tier": "1u8",\n  ...\n}'}
                      className="textarea textarea-bordered font-mono text-xs h-32 w-full"
                      value={recordInput}
                      onChange={(e) => setRecordInput(e.target.value)}
                    />
                    {saveSuccess && (
                      <div className="alert alert-success text-sm">Record imported successfully!</div>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSaveRecord}
                      disabled={!recordInput.trim().startsWith('{')}
                    >
                      Import Record
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Reputation profile */}
            <div className="space-y-6">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Your Stats</h3>
                  <TierProgress reputation={reputation} />

                  <div className="divider" />

                  <div className="stats stats-vertical shadow bg-base-300 text-sm">
                    <div className="stat py-3">
                      <div className="stat-title text-xs">Total Bets</div>
                      <div className="stat-value text-2xl">{reputation.totalBets}</div>
                    </div>
                    <div className="stat py-3">
                      <div className="stat-title text-xs">Win Rate</div>
                      <div className="stat-value text-2xl text-success">
                        {calculateAccuracy(reputation.totalWins, reputation.totalBets).toFixed(1)}%
                      </div>
                    </div>
                    <div className="stat py-3">
                      <div className="stat-title text-xs">Parlays Won</div>
                      <div className="stat-value text-2xl">{reputation.parlayWins}/{reputation.totalParlays}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier benefits */}
              <div className="card bg-base-200 shadow">
                <div className="card-body">
                  <h3 className="card-title text-base">Tier Benefits</h3>
                  <div className="space-y-2">
                    {([ReputationTier.Novice, ReputationTier.Skilled, ReputationTier.Expert, ReputationTier.Oracle] as ReputationTier[]).map((tier) => (
                      <div
                        key={tier}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                          tier === reputation.tier ? 'bg-primary/20 border border-primary/30' : 'bg-base-300 opacity-50'
                        }`}
                      >
                        <span className="font-medium">
                          {tier === ReputationTier.Novice ? '🥉' : tier === ReputationTier.Skilled ? '🥈' : tier === ReputationTier.Expert ? '🥇' : '💎'}{' '}
                          {TIER_LABELS[tier]}
                        </span>
                        <div className="flex gap-3 text-xs opacity-70">
                          <span>Max {TIER_MAX_LEGS[tier]} legs</span>
                          <span>+{((TIER_BONUSES[tier] - 1) * 100).toFixed(0)}% bonus</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="space-y-6">
              {/* Generate proof */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-base">Generate ZK Proof</h3>
                  <p className="text-sm opacity-60">
                    Prove your reputation to others without revealing your full stats.
                  </p>
                  <Link href="/reputation/proof" className="btn btn-secondary btn-sm mt-2">
                    Generate Proof
                  </Link>
                </div>
              </div>

              {/* Update record */}
              <div className="card bg-base-200 border border-base-300">
                <div className="card-body">
                  <button
                    className="btn btn-ghost btn-sm w-fit"
                    onClick={() => setShowRecordInput(!showRecordInput)}
                  >
                    {showRecordInput ? '▼' : '▶'} Update Reputation Record
                  </button>
                  <p className="text-xs opacity-50">
                    After placing bets or claiming winnings, update your cached record here.
                  </p>

                  {showRecordInput && (
                    <div className="space-y-2 mt-2">
                      <textarea
                        placeholder={'{\n  "owner": "aleo1...",\n  "tier": "1u8",\n  ...\n}'}
                        className="textarea textarea-bordered font-mono text-xs h-28 w-full"
                        value={recordInput}
                        onChange={(e) => setRecordInput(e.target.value)}
                      />
                      {saveSuccess && (
                        <div className="alert alert-success text-sm py-2">Updated!</div>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleSaveRecord}
                        disabled={!recordInput.trim().startsWith('{')}
                      >
                        Update Record
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Parlay CTA */}
              <div className="card bg-primary/10 border border-primary/20">
                <div className="card-body">
                  <h3 className="font-bold">Ready to Parlay?</h3>
                  <p className="text-sm opacity-70">
                    You can build up to {TIER_MAX_LEGS[reputation.tier as ReputationTier]}-leg parlays with your current tier.
                  </p>
                  <Link href="/parlays/create" className="btn btn-primary btn-sm mt-2">
                    Build Parlay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

ReputationPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ReputationPage;
