import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import Button from '@/components/ui/button';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import Link from 'next/link';

const MainPage: NextPageWithLayout = () => {
  const { address } = useWallet();

  return (
    <>
      <NextSeo
        title="zkPredict - Private Prediction Markets on Aleo"
        description="Trade predictions privately with zero-knowledge proofs. Multi-outcome markets, auto-resolution, and smart categories."
      />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero Section - cleaner, simpler - Mobile optimized */}
        <div className="text-center mb-12 sm:mb-16 max-w-4xl mx-auto">
          {/* Logo - Responsive sizing */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img src="/logo.svg" alt="zkPredict Logo" className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 animate-float" loading="eager" />
          </div>

          {/* Status badge - Touch-friendly */}
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-4 sm:mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs sm:text-xs font-bold text-primary uppercase tracking-wider">
              Live on Aleo Testnet
            </span>
          </div>

          {/* Big, clear title - Responsive sizing */}
          <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight px-2">
            Private Prediction Markets
          </h1>

          {/* Simple, clear subtitle - Responsive sizing */}
          <p className="text-base sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-80 leading-relaxed px-4">
            Bet on future events with complete privacy using zero-knowledge proofs
          </p>

          {/* Clear CTAs - Touch-optimized buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
            <Link href="/markets" className="w-full sm:w-auto">
              <Button className="btn btn-primary btn-lg w-full sm:w-auto px-8 sm:px-12 text-base font-bold min-h-[48px] sm:min-h-[52px] touch-manipulation">
                Browse Markets
              </Button>
            </Link>
            {address && (
              <Link href="/markets" className="w-full sm:w-auto">
                <Button className="btn btn-outline btn-lg w-full sm:w-auto px-8 sm:px-12 text-base font-bold min-h-[48px] sm:min-h-[52px] touch-manipulation">
                  Create Market
                </Button>
              </Link>
            )}
          </div>

          {!address && (
            <p className="text-xs sm:text-sm opacity-50 mt-4">
              Connect your wallet to start trading
            </p>
          )}
        </div>

        {/* Features - simple and scannable - Mobile optimized grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 px-2 sm:px-0">
          <div className="card bg-base-200 border-2 border-base-300 hover:border-primary/30 p-5 sm:p-6 text-center touch-manipulation hover-lift stagger-item">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="font-bold text-base sm:text-lg mb-2">100% Private</h3>
            <p className="text-xs sm:text-sm opacity-70">
              Zero-knowledge proofs hide your bets. Only you know your positions.
            </p>
          </div>

          <div className="card bg-base-200 border-2 border-base-300 hover:border-secondary/30 p-5 sm:p-6 text-center touch-manipulation hover-lift stagger-item">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-secondary transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-bold text-base sm:text-lg mb-2">Multi-Outcome</h3>
            <p className="text-xs sm:text-sm opacity-70">
              Support for 2-255 outcomes per market, not just yes/no.
            </p>
          </div>

          <div className="card bg-base-200 border-2 border-base-300 hover:border-success/30 p-5 sm:p-6 text-center touch-manipulation hover-lift stagger-item">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-success transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-base sm:text-lg mb-2">Auto-Resolve</h3>
            <p className="text-xs sm:text-sm opacity-70">
              Markets resolve automatically after deadline. No manual intervention.
            </p>
          </div>

          <div className="card bg-base-200 border-2 border-base-300 hover:border-accent/30 p-5 sm:p-6 text-center touch-manipulation hover-lift stagger-item">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-accent transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="font-bold text-base sm:text-lg mb-2">Categories</h3>
            <p className="text-xs sm:text-sm opacity-70">
              Browse by Sports, Politics, Crypto, Weather and more.
            </p>
          </div>
        </div>

        {/* Simple How It Works - Mobile optimized */}
        <div className="card bg-base-200 border-2 border-base-300 mb-12 sm:mb-16 mx-2 sm:mx-0">
          <div className="card-body p-5 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              <div className="text-center p-4 sm:p-0">
                <div className="text-3xl sm:text-4xl font-black text-primary mb-2 sm:mb-3">1</div>
                <h3 className="font-bold text-base sm:text-base mb-2">Browse Markets</h3>
                <p className="text-xs sm:text-sm opacity-70">
                  Find prediction markets on topics that interest you
                </p>
              </div>
              <div className="text-center p-4 sm:p-0">
                <div className="text-3xl sm:text-4xl font-black text-primary mb-2 sm:mb-3">2</div>
                <h3 className="font-bold text-base sm:text-base mb-2">Place Private Bets</h3>
                <p className="text-xs sm:text-sm opacity-70">
                  Bet on outcomes with complete privacy using zero-knowledge proofs
                </p>
              </div>
              <div className="text-center p-4 sm:p-0">
                <div className="text-3xl sm:text-4xl font-black text-primary mb-2 sm:mb-3">3</div>
                <h3 className="font-bold text-base sm:text-base mb-2">Claim Winnings</h3>
                <p className="text-xs sm:text-sm opacity-70">
                  When markets resolve, claim your winnings privately
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Simple CTA - Mobile optimized */}
        <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 text-center py-8 sm:py-12 px-4 sm:px-6 mx-2 sm:mx-0">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Ready to Get Started?
          </h2>
          <p className="mb-5 sm:mb-6 opacity-70 text-sm sm:text-base">
            Connect your Aleo wallet and start trading on prediction markets
          </p>
          <Link href="/markets" className="inline-block w-full sm:w-auto">
            <Button className="btn btn-primary btn-lg px-8 sm:px-12 font-bold w-full sm:w-auto min-h-[48px] sm:min-h-[52px] touch-manipulation text-base">
              View All Markets →
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

MainPage.getLayout = (page) => <Layout>{page}</Layout>;
export default MainPage;
