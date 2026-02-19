import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import Link from 'next/link';
import ClaimParlay from '@/components/parlay/ClaimParlay';
import { useReputation } from '@/hooks/useReputation';
import { TIER_LABELS, TIER_MAX_LEGS, ReputationTier } from '@/types';

const ParlaysPage: NextPageWithLayout = () => {
  const { publicKey } = useWallet();
  const { reputation } = useReputation();

  return (
    <>
      <NextSeo
        title="Parlays - zkPredict"
        description="Build multi-leg parlay bets on zkPredict"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              <span className="gradient-text-cyan">Parlays</span>
            </h1>
            <p className="text-base-content/60 text-sm">
              Combine 2-5 markets for multiplied odds. All picks stay private.
            </p>
          </div>
          {publicKey && reputation && (
            <Link href="/parlays/create" className="btn btn-primary">
              Build Parlay
            </Link>
          )}
        </div>

        {!publicKey ? (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-bold opacity-50">Connect Wallet</h3>
              <p className="text-sm opacity-40 mt-2">Connect your wallet to access parlays</p>
            </div>
          </div>
        ) : !reputation ? (
          <div className="space-y-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center py-12 space-y-4">
                <div className="text-5xl">🎯</div>
                <h3 className="text-xl font-bold">Reputation Required</h3>
                <p className="text-sm opacity-60 max-w-md text-center">
                  Parlays require an on-chain Reputation record. Initialize yours to unlock parlay betting and tier-based bonuses.
                </p>
                <Link href="/reputation" className="btn btn-primary">
                  Set Up Reputation
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Info + Create */}
            <div className="lg:col-span-2 space-y-6">
              {/* How parlays work */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">How Parlays Work</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    {[
                      { legs: 2, odds: '3.5x', icon: '🎯' },
                      { legs: 3, odds: '7x', icon: '🔥' },
                      { legs: 4, odds: '14x', icon: '⚡' },
                      { legs: 5, odds: '28x', icon: '💎' },
                    ].map(({ legs, odds, icon }) => {
                      const required = TIER_MAX_LEGS[reputation.tier as ReputationTier];
                      const locked = legs > required;
                      return (
                        <div
                          key={legs}
                          className={`rounded-xl p-3 text-center ${
                            locked
                              ? 'bg-base-300 opacity-40'
                              : 'bg-primary/10 border border-primary/20'
                          }`}
                        >
                          <p className="text-2xl mb-1">{icon}</p>
                          <p className="font-bold">{legs}-Leg</p>
                          <p className="text-primary font-mono text-sm">{odds}</p>
                          {locked && (
                            <p className="text-xs opacity-50 mt-1">Locked</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs opacity-50 mt-3">
                    * Odds are base values. Your {TIER_LABELS[reputation.tier as ReputationTier]} tier bonus adds{' '}
                    {((([1.0, 1.1, 1.2, 1.3][reputation.tier - 1] ?? 1.0) - 1) * 100).toFixed(0)}% on top.
                    All legs must win — if any leg loses, the entire parlay loses.
                  </div>
                </div>
              </div>

              {/* Privacy model */}
              <div className="card bg-base-200 border border-base-300">
                <div className="card-body">
                  <h3 className="font-bold text-sm">Privacy Model</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                    <div>
                      <p className="font-medium text-error mb-1">Private (only you)</p>
                      <ul className="space-y-1 opacity-70">
                        <li>• Your market selections</li>
                        <li>• Bet amount</li>
                        <li>• Number of legs</li>
                        <li>• Outcomes chosen</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-success mb-1">Public (on-chain)</p>
                      <ul className="space-y-1 opacity-70">
                        <li>• Pool totals per market</li>
                        <li>• Market resolution</li>
                        <li>• Claim status (bool)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create parlay CTA */}
              <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 shadow-xl">
                <div className="card-body items-center text-center">
                  <h3 className="text-xl font-bold">Ready to Parlay?</h3>
                  <p className="text-sm opacity-70">
                    Your {TIER_LABELS[reputation.tier as ReputationTier]} tier allows up to{' '}
                    {TIER_MAX_LEGS[reputation.tier as ReputationTier]}-leg parlays.
                  </p>
                  <Link href="/parlays/create" className="btn btn-primary mt-2">
                    Build Parlay
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Claim parlay */}
            <div>
              <ClaimParlay />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

ParlaysPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ParlaysPage;
