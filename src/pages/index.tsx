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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            zkPredict
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            The first fully private prediction market platform powered by Aleo blockchain
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/markets">
              <Button className="btn btn-primary btn-lg px-8">
                Explore Markets
              </Button>
            </Link>
            {publicKey && (
              <Link href="/markets">
                <Button className="btn btn-outline btn-lg px-8">
                  Create Market
                </Button>
              </Link>
            )}
          </div>
          {!publicKey && (
            <p className="text-sm text-gray-500 mt-4">
              Connect your wallet to create markets and place bets
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="card-title text-lg">Fully Private</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your bets are encrypted with zero-knowledge proofs. Only you know your positions.
              </p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="card-title text-lg">Multi-Outcome</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Wave 3: Create markets with 2-255 outcomes, not just binary YES/NO.
              </p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="card-title text-lg">Auto-Resolution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Wave 2: Markets can auto-resolve after end time, no manual intervention needed.
              </p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="card-title text-lg">Smart Categories</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Wave 4: Discover markets by category - Sports, Politics, Crypto, Weather & more.
              </p>
            </div>
          </div>
        </div>

        {/* Waves Progress */}
        <div className="card bg-base-200 shadow-xl mb-16">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Development Roadmap</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="badge badge-success badge-lg">Complete</div>
                <div>
                  <h3 className="font-bold">Wave 1: Core Functionality</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create markets, place bets, resolve markets, claim winnings
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="badge badge-success badge-lg">Complete</div>
                <div>
                  <h3 className="font-bold">Wave 2: Time-based Resolution & Double-claim Prevention</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Auto-resolve markets, prevent duplicate claims with bet IDs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="badge badge-success badge-lg">Complete</div>
                <div>
                  <h3 className="font-bold">Wave 3: Multi-outcome Markets & Advanced Odds</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Support 2-255 outcomes per market, dynamic odds calculation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="badge badge-success badge-lg">Complete</div>
                <div>
                  <h3 className="font-bold">Wave 4: Market Categories & Discovery</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Categorize markets, search & filter, improved market discovery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Predicting?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect your Aleo wallet and explore private prediction markets
          </p>
          <Link href="/markets">
            <Button className="btn btn-primary btn-lg px-12">
              View All Markets
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

MainPage.getLayout = (page) => <Layout>{page}</Layout>;
export default MainPage;
