import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import Button from '@/components/ui/button';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const MainPage: NextPageWithLayout = () => {
  const { publicKey } = useWallet();
  const router = useRouter();

  return (
    <>
      <NextSeo
        title="zkPredict - Private Prediction Markets on Aleo"
        description="Trade predictions privately with zero-knowledge proofs. Multi-outcome markets, auto-resolution, and smart categories."
      />

      <div className="container mx-auto px-4 py-12 sm:py-20">
        {/* Hero Section with enhanced design */}
        <div className="relative text-center mb-20">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float animation-delay-1000" />
          </div>

          <div className="relative z-10">
            {/* Pretitle */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-mono font-medium text-cyan-400 uppercase tracking-wider">
                Zero-Knowledge Prediction Markets
              </span>
            </div>

            {/* Main title with enhanced typography */}
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-extrabold mb-6 leading-none">
              <span className="block gradient-text-cyan animate-pulse-glow">zkPredict</span>
            </h1>

            {/* Subtitle with better styling */}
            <p className="text-lg sm:text-xl md:text-2xl text-base-content/80 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
              The first <span className="font-bold text-cyan-400">fully private</span> prediction market platform powered by{' '}
              <span className="font-bold text-amber-400">Aleo blockchain</span>
            </p>

            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/markets">
                <Button className="btn btn-primary btn-lg px-10 text-base font-bold border-0 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Explore Markets
                </Button>
              </Link>
              {publicKey && (
                <Link href="/markets">
                  <Button className="btn btn-outline btn-lg px-10 text-base font-bold border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-base-100 transition-all duration-300">
                    Create Market
                  </Button>
                </Link>
              )}
            </div>

            {!publicKey && (
              <div className="flex items-center justify-center gap-2 text-sm text-base-content/50 mt-4 font-mono">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Connect wallet to create markets and place bets</span>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid with enhanced design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="group relative card bg-base-300 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="card-body items-center text-center relative z-10">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl group-hover:bg-cyan-500/30 transition-all duration-300" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-cyan-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Fully Private</h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Your bets are encrypted with zero-knowledge proofs. Only you know your positions.
              </p>
            </div>
          </div>

          <div className="group relative card bg-base-300 border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 overflow-hidden animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="card-body items-center text-center relative z-10">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl group-hover:bg-amber-500/30 transition-all duration-300" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-amber-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Multi-Outcome</h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Create markets with 2-255 outcomes, not just binary YES/NO.
              </p>
            </div>
          </div>

          <div className="group relative card bg-base-300 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden animation-delay-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="card-body items-center text-center relative z-10">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/30 transition-all duration-300" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-emerald-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Auto-Resolution</h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Markets can auto-resolve after end time, no manual intervention needed.
              </p>
            </div>
          </div>

          <div className="group relative card bg-base-300 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 overflow-hidden animation-delay-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="card-body items-center text-center relative z-10">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl group-hover:bg-purple-500/30 transition-all duration-300" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-purple-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Smart Categories</h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Discover markets by category - Sports, Politics, Crypto, Weather & more.
              </p>
            </div>
          </div>
        </div>

        {/* Waves Progress with enhanced design */}
        <div className="relative card bg-base-300 border border-cyan-500/20 overflow-hidden mb-20">
          <div className="absolute inset-0 cyber-grid opacity-20" />
          <div className="card-body relative z-10">
            <h2 className="font-display text-3xl font-bold mb-8 gradient-text-cyan">Development Roadmap</h2>
            <div className="space-y-5">
              <div className="group flex items-start gap-4 p-4 rounded-lg bg-base-100/30 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
                <div className="badge badge-success badge-lg font-bold border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  COMPLETE
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold mb-1">Wave 1: Core Functionality</h3>
                  <p className="text-sm text-base-content/70">
                    Create markets, place bets, resolve markets, claim winnings
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-4 rounded-lg bg-base-100/30 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
                <div className="badge badge-success badge-lg font-bold border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  COMPLETE
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold mb-1">Wave 2: Time-based Resolution & Double-claim Prevention</h3>
                  <p className="text-sm text-base-content/70">
                    Auto-resolve markets, prevent duplicate claims with bet IDs
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-4 rounded-lg bg-base-100/30 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
                <div className="badge badge-success badge-lg font-bold border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  COMPLETE
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold mb-1">Wave 3: Multi-outcome Markets & Advanced Odds</h3>
                  <p className="text-sm text-base-content/70">
                    Support 2-255 outcomes per market, dynamic odds calculation
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-4 rounded-lg bg-base-100/30 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
                <div className="badge badge-success badge-lg font-bold border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  COMPLETE
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold mb-1">Wave 4: Market Categories & Discovery</h3>
                  <p className="text-sm text-base-content/70">
                    Categorize markets, search & filter, improved market discovery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA with enhanced design */}
        <div className="relative text-center py-12 px-6 rounded-2xl overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-amber-500/10 backdrop-blur-sm" />
          <div className="absolute inset-0 cyber-grid opacity-20" />

          <div className="relative z-10">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4 gradient-text-cyan">
              Ready to Start Predicting?
            </h2>
            <p className="text-base-content/70 mb-8 text-lg max-w-2xl mx-auto">
              Connect your Aleo wallet and explore private prediction markets
            </p>
            <Link href="/markets">
              <Button className="btn btn-primary btn-lg px-16 text-lg font-bold border-0 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 group">
                View All Markets
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

MainPage.getLayout = (page) => <Layout>{page}</Layout>;
export default MainPage;
