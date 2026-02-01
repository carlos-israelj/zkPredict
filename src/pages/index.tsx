import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import Button from '@/components/ui/button';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const MainPage: NextPageWithLayout = () => {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <NextSeo
        title="zkPredict - Private Prediction Markets on Aleo"
        description="Trade predictions privately with zero-knowledge proofs. Multi-outcome markets, auto-resolution, and smart categories."
      />

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(99, 102, 241, 0.5);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }

        .gradient-bg {
          background:
            radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
        }

        .feature-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid rgba(0, 0, 0, 0.06);
          background: rgba(255, 255, 255, 0.5);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1);
        }

        .feature-icon {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-card {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-card::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-color);
          transform: scaleX(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-card:hover::before {
          transform: scaleX(1);
        }

        .stat-number {
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }

        .cta-card {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%);
          border: 2px solid rgba(99, 102, 241, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cta-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
        }
      `}</style>

      <div className="gradient-bg min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section - Enhanced with animations */}
          <div className="text-center mb-24 max-w-4xl mx-auto">
            {/* Logo */}
            <div className={`flex justify-center mb-8 ${isVisible ? 'animate-scale-in' : ''}`}>
              <img src="/logo.svg" alt="zkPredict Logo" className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 animate-float" />
            </div>

            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border-2 border-indigo-200 mb-6 backdrop-blur-sm ${isVisible ? 'animate-fade-in-up delay-100' : ''}`}>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-glow" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Live on Aleo Testnet
              </span>
            </div>

            {/* Big, clear title */}
            <h1 className={`font-display text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight ${isVisible ? 'animate-fade-in-up delay-200' : ''}`}>
              Private Prediction Markets
            </h1>

            {/* Simple, clear subtitle */}
            <p className={`text-xl sm:text-2xl mb-10 opacity-80 leading-relaxed ${isVisible ? 'animate-fade-in-up delay-300' : ''}`}>
              Bet on future events with complete privacy using zero-knowledge proofs
            </p>

            {/* Clear CTAs */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isVisible ? 'animate-fade-in-up delay-400' : ''}`}>
              <Link href="/markets">
                <Button className="btn btn-primary btn-lg px-12 text-base font-bold shadow-lg hover:shadow-xl transition-all">
                  Browse Markets
                </Button>
              </Link>
              {publicKey && (
                <Link href="/markets">
                  <Button className="btn btn-outline btn-lg px-12 text-base font-bold hover:shadow-md transition-all">
                    Create Market
                  </Button>
                </Link>
              )}
            </div>

            {!publicKey && (
              <p className={`text-sm opacity-50 mt-4 ${isVisible ? 'animate-fade-in delay-500' : ''}`}>
                Connect your wallet to start trading
              </p>
            )}
          </div>

          {/* Stats Section - New! */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 max-w-5xl mx-auto ${isVisible ? 'animate-fade-in-up delay-500' : ''}`}>
            <div className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-gray-100">
              <div className="text-3xl md:text-4xl font-black text-indigo-600 mb-1 stat-number">100%</div>
              <div className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">Private</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-gray-100">
              <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1 stat-number">2-255</div>
              <div className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">Outcomes</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-gray-100">
              <div className="text-3xl md:text-4xl font-black text-amber-600 mb-1 stat-number">Auto</div>
              <div className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">Resolution</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-gray-100">
              <div className="text-3xl md:text-4xl font-black text-purple-600 mb-1 stat-number">5+</div>
              <div className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">Categories</div>
            </div>
          </div>

          {/* Features - Enhanced with staggered animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <div className={`feature-card rounded-xl p-6 text-center ${isVisible ? 'animate-fade-in-up delay-600' : ''}`}>
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">100% Private</h3>
              <p className="text-sm opacity-70">
                Zero-knowledge proofs hide your bets. Only you know your positions.
              </p>
            </div>

            <div className={`feature-card rounded-xl p-6 text-center ${isVisible ? 'animate-fade-in-up delay-700' : ''}`}>
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Multi-Outcome</h3>
              <p className="text-sm opacity-70">
                Support for 2-255 outcomes per market, not just yes/no.
              </p>
            </div>

            <div className={`feature-card rounded-xl p-6 text-center ${isVisible ? 'animate-fade-in-up delay-800' : ''}`}>
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Auto-Resolve</h3>
              <p className="text-sm opacity-70">
                Markets resolve automatically after deadline. No manual intervention.
              </p>
            </div>

            <div className={`feature-card rounded-xl p-6 text-center ${isVisible ? 'animate-fade-in-up delay-800' : ''}`}>
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Smart Categories</h3>
              <p className="text-sm opacity-70">
                Browse by Sports, Politics, Crypto, Weather and more.
              </p>
            </div>
          </div>

          {/* How It Works - Enhanced */}
          <div className="mb-20 max-w-5xl mx-auto">
            <h2 className={`text-4xl md:text-5xl font-black mb-12 text-center ${isVisible ? 'animate-fade-in-up delay-600' : ''}`}>
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className={`step-card text-center p-8 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-gray-100 ${isVisible ? 'animate-fade-in-up delay-700' : ''}`} style={{ '--accent-color': '#6366f1' } as React.CSSProperties}>
                <div className="text-6xl font-black text-indigo-600 mb-4">1</div>
                <h3 className="font-bold text-xl mb-3">Browse Markets</h3>
                <p className="text-sm opacity-70">
                  Find prediction markets on topics that interest you across multiple categories
                </p>
              </div>
              <div className={`step-card text-center p-8 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-gray-100 ${isVisible ? 'animate-fade-in-up delay-800' : ''}`} style={{ '--accent-color': '#10b981' } as React.CSSProperties}>
                <div className="text-6xl font-black text-emerald-600 mb-4">2</div>
                <h3 className="font-bold text-xl mb-3">Place Private Bets</h3>
                <p className="text-sm opacity-70">
                  Bet on outcomes with complete privacy using zero-knowledge proofs
                </p>
              </div>
              <div className={`step-card text-center p-8 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-gray-100 ${isVisible ? 'animate-fade-in-up delay-800' : ''}`} style={{ '--accent-color': '#8b5cf6' } as React.CSSProperties}>
                <div className="text-6xl font-black text-purple-600 mb-4">3</div>
                <h3 className="font-bold text-xl mb-3">Claim Winnings</h3>
                <p className="text-sm opacity-70">
                  When markets resolve, claim your winnings privately with your bet ID
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced CTA */}
          <div className={`cta-card text-center py-16 px-8 rounded-2xl max-w-4xl mx-auto ${isVisible ? 'animate-fade-in-up delay-800' : ''}`}>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 opacity-70 max-w-2xl mx-auto">
              Connect your Aleo wallet and start trading on prediction markets with complete privacy
            </p>
            <Link href="/markets">
              <Button className="btn btn-primary btn-lg px-12 font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                View All Markets →
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
