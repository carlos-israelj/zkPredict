import type { NextPageWithLayout } from '@/types';
import { useState } from 'react';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import Link from 'next/link';

const PortfolioPage: NextPageWithLayout = () => {
  const { publicKey } = useWallet();
  const [showAmounts, setShowAmounts] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'settled' | 'claimable'>('active');

  // Mock data - replace with real data from blockchain
  const stats = {
    totalWagered: 0,
    totalWinnings: 0,
    activeBets: 0,
    totalBets: 0,
    winRate: 0,
    claimableWinnings: 0,
  };

  return (
    <>
      <NextSeo
        title="Portfolio - zkPredict"
        description="View your private betting history and claimable winnings"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header with Privacy Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 animate-fade-in">
              <span className="gradient-text-cyan">Data Vault</span>
            </h1>
            <p className="text-base-content/60 flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
              </svg>
              All positions are encrypted with zero-knowledge proofs
            </p>
          </div>

          {/* Privacy Toggle */}
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="btn btn-outline btn-sm gap-2 self-start sm:self-auto"
          >
            {showAmounts ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Hide Amounts
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" x2="22" y1="2" y2="22"></line>
                </svg>
                Show Amounts
              </>
            )}
          </button>
        </div>

        {!publicKey ? (
          /* Not Connected State */
          <div className="card bg-base-200 border-2 border-base-300 p-12 text-center animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <h3 className="text-xl font-bold mb-2">Vault Locked</h3>
            <p className="text-base-content/60 mb-6">Connect your wallet to access your encrypted betting history</p>
          </div>
        ) : (
          <>
            {/* Stats Grid - Data Vault Style */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
              {/* Total Wagered */}
              <div className="glass-card p-4 sm:p-5 border-glow hover-lift stagger-item relative overflow-hidden group">
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <p className="text-xs text-base-content/50 uppercase tracking-wider font-mono">Wagered</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono mb-1">
                    {showAmounts ? `${stats.totalWagered.toFixed(2)}` : '•••••'}
                  </p>
                  <p className="text-xs text-base-content/40 font-mono">microcredits</p>
                </div>
              </div>

              {/* Total Winnings */}
              <div className="glass-card p-4 sm:p-5 border-glow hover-lift stagger-item relative overflow-hidden group">
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ animationDelay: '0.3s' }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-xs text-base-content/50 uppercase tracking-wider font-mono">Winnings</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono mb-1 text-success">
                    {showAmounts ? `${stats.totalWinnings.toFixed(2)}` : '•••••'}
                  </p>
                  <p className="text-xs text-base-content/40 font-mono">microcredits</p>
                </div>
              </div>

              {/* Active Bets */}
              <div className="glass-card p-4 sm:p-5 border-glow hover-lift stagger-item relative overflow-hidden group">
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ animationDelay: '0.6s' }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <p className="text-xs text-base-content/50 uppercase tracking-wider font-mono">Active</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono mb-1 text-secondary">
                    {stats.activeBets}
                  </p>
                  <p className="text-xs text-base-content/40 font-mono">{stats.totalBets} total</p>
                </div>
              </div>

              {/* Win Rate */}
              <div className="glass-card p-4 sm:p-5 border-glow hover-lift stagger-item relative overflow-hidden group">
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ animationDelay: '0.9s' }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <p className="text-xs text-base-content/50 uppercase tracking-wider font-mono">Win Rate</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono mb-1 text-accent">
                    {stats.winRate}%
                  </p>
                  <p className="text-xs text-base-content/40 font-mono">accuracy</p>
                </div>
              </div>

              {/* Claimable */}
              <div className="glass-card p-4 sm:p-5 border-glow hover-lift stagger-item relative overflow-hidden group col-span-2">
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ animationDelay: '1.2s' }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <p className="text-xs text-base-content/50 uppercase tracking-wider font-mono">Claimable</p>
                    </div>
                    {stats.claimableWinnings > 0 && (
                      <span className="badge badge-success badge-sm">Ready</span>
                    )}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono mb-1 text-primary">
                    {showAmounts ? `${stats.claimableWinnings.toFixed(2)}` : '•••••'}
                  </p>
                  <p className="text-xs text-base-content/40 font-mono">microcredits ready to claim</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-base-300 mb-6">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 sm:px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === 'active'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-base-content/50 hover:text-base-content/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Active ({stats.activeBets})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('settled')}
                  className={`px-4 sm:px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === 'settled'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-base-content/50 hover:text-base-content/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    Settled (0)
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('claimable')}
                  className={`px-4 sm:px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === 'claimable'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-base-content/50 hover:text-base-content/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                    </svg>
                    Claim (0)
                  </div>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Active Bets Tab */}
              {activeTab === 'active' && (
                <div className="card bg-base-200/50 border border-base-300 p-8 sm:p-12 text-center animate-fade-in">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: '3s' }} />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/50 absolute inset-0 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-display">No Active Bets</h3>
                  <p className="text-base-content/60 mb-6 max-w-md mx-auto">
                    Your vault is empty. Browse markets to place your first encrypted bet on Aleo.
                  </p>
                  <Link href="/markets">
                    <button className="btn btn-primary gap-2">
                      Browse Markets
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </button>
                  </Link>
                </div>
              )}

              {/* Settled Bets Tab */}
              {activeTab === 'settled' && (
                <div className="card bg-base-200/50 border border-base-300 p-8 sm:p-12 text-center animate-fade-in">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-success/20" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-success/50 absolute inset-0 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-display">No Settled Bets</h3>
                  <p className="text-base-content/60 mb-6 max-w-md mx-auto">
                    Completed bets will appear here after markets resolve. Your betting history is encrypted.
                  </p>
                </div>
              )}

              {/* Claimable Tab */}
              {activeTab === 'claimable' && (
                <div className="card bg-base-200/50 border border-base-300 p-8 sm:p-12 text-center animate-fade-in">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 glow-cyan" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/50 absolute inset-0 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-display">No Claimable Winnings</h3>
                  <p className="text-base-content/60 mb-6 max-w-md mx-auto">
                    Win a bet and come back here to claim your private winnings using your bet ID.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

PortfolioPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default PortfolioPage;
