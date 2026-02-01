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

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section - cleaner, simpler */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/logo.svg" alt="zkPredict Logo" className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 animate-float" />
          </div>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Live on Aleo Testnet
            </span>
          </div>

          {/* Big, clear title */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
            Private Prediction Markets
          </h1>

          {/* Simple, clear subtitle */}
          <p className="text-xl sm:text-2xl mb-10 opacity-80 leading-relaxed">
            Bet on future events with complete privacy using zero-knowledge proofs
          </p>

          {/* Clear CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/markets">
              <Button className="btn btn-primary btn-lg px-12 text-base font-bold">
                Browse Markets
              </Button>
            </Link>
            {publicKey && (
              <Link href="/markets">
                <Button className="btn btn-outline btn-lg px-12 text-base font-bold">
                  Create Market
                </Button>
              </Link>
            )}
          </div>

          {!publicKey && (
            <p className="text-sm opacity-50 mt-4">
              Connect your wallet to start trading
            </p>
          )}
        </div>

        {/* Features - simple and scannable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="card bg-base-200 border-2 border-base-300 p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="font-bold text-lg mb-2">100% Private</h3>
            <p className="text-sm opacity-70">
              Zero-knowledge proofs hide your bets. Only you know your positions.
            </p>
          </div>

          <div className="card bg-base-200 border-2 border-base-300 p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-bold text-lg mb-2">Multi-Outcome</h3>
            <p className="text-sm opacity-70">
              Support for 2-255 outcomes per market, not just yes/no.
            </p>
          </div>

          <div className="card bg-base-200 border-2 border-base-300 p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-lg mb-2">Auto-Resolve</h3>
            <p className="text-sm opacity-70">
              Markets resolve automatically after deadline. No manual intervention.
            </p>
          </div>

          <div className="card bg-base-200 border-2 border-base-300 p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="font-bold text-lg mb-2">Categories</h3>
            <p className="text-sm opacity-70">
              Browse by Sports, Politics, Crypto, Weather and more.
            </p>
          </div>
        </div>

        {/* Simple How It Works */}
        <div className="card bg-base-200 border-2 border-base-300 mb-16">
          <div className="card-body">
            <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-3">1</div>
                <h3 className="font-bold mb-2">Browse Markets</h3>
                <p className="text-sm opacity-70">
                  Find prediction markets on topics that interest you
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-3">2</div>
                <h3 className="font-bold mb-2">Place Private Bets</h3>
                <p className="text-sm opacity-70">
                  Bet on outcomes with complete privacy using zero-knowledge proofs
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-3">3</div>
                <h3 className="font-bold mb-2">Claim Winnings</h3>
                <p className="text-sm opacity-70">
                  When markets resolve, claim your winnings privately
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Simple CTA */}
        <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 text-center py-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="mb-6 opacity-70">
            Connect your Aleo wallet and start trading on prediction markets
          </p>
          <Link href="/markets">
            <Button className="btn btn-primary btn-lg px-12 font-bold">
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
