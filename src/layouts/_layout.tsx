import { useWindowScroll } from '@/hooks/use-window-scroll';
import { useIsMounted } from '@/hooks/use-is-mounted';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { HomeIcon } from '@/components/icons/home';
import { Twitter } from '@/components/icons/twitter';
import { Discord } from '@/components/icons/discord';
import Footer from '@/components/ui/Footer';

require('@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css');

function HeaderRightArea() {
  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
      <div className="wallet-adapter-button-trigger-wrapper">
        <WalletMultiButton className="!h-10 !min-h-[44px] !px-3 !text-xs sm:!h-12 sm:!min-h-[48px] sm:!px-6 sm:!text-base touch-manipulation" />
      </div>
    </div>
  );
}

export function Header() {
  const windowScroll = useWindowScroll();
  const isMounted = useIsMounted();
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 z-30 w-full bg-base-200/80 backdrop-blur-xl border-b transition-all duration-300 ${
        isMounted && windowScroll.y > 10
          ? 'border-cyan-500/30 shadow-lg shadow-cyan-500/10'
          : 'border-transparent'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Left side - Logo and Nav Links - Mobile optimized */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0 flex-1">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform group touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg flex-shrink-0"
              aria-label="Go to zkPredict home page"
            >
              <img src="/logo.svg" alt="" className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0" aria-hidden="true" loading="eager" />
              <span className="font-display text-lg sm:text-xl md:text-2xl font-bold gradient-text-cyan hidden xs:inline truncate">
                zkPredict
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1" role="group" aria-label="Main navigation">
              <Link
                href="/markets"
                className={`px-3 py-2 rounded-lg text-sm font-bold font-mono uppercase tracking-wider transition-all ${
                  isActive('/markets')
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-base-content/60 hover:text-base-content hover:bg-base-300/50'
                }`}
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className={`px-3 py-2 rounded-lg text-sm font-bold font-mono uppercase tracking-wider transition-all ${
                  isActive('/portfolio')
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-base-content/60 hover:text-base-content hover:bg-base-300/50'
                }`}
              >
                Portfolio
              </Link>
            </div>

            {/* Social Links */}
            <div className="h-5 sm:h-6 w-px bg-base-content/20 hidden md:block" aria-hidden="true" />
            <div className="hidden md:flex items-center gap-1 sm:gap-2 flex-shrink-0" role="group" aria-label="Social media links">
              {process.env.URL && (
                <a
                  className="btn btn-ghost btn-circle btn-xs sm:btn-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-transparent transition-all duration-300 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary"
                  href={`${process.env.URL}`}
                  aria-label="Visit zkPredict website"
                >
                  <HomeIcon aria-hidden="true" />
                </a>
              )}
              {process.env.TWITTER && (
                <a
                  className="btn btn-ghost btn-circle btn-xs sm:btn-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-transparent transition-all duration-300 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary"
                  href={`${process.env.TWITTER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow zkPredict on Twitter (opens in new tab)"
                >
                  <Twitter width="16" height="16" className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                </a>
              )}
              {process.env.DISCORD && (
                <a
                  className="btn btn-ghost btn-circle btn-xs sm:btn-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-transparent transition-all duration-300 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary"
                  href={`${process.env.DISCORD}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join zkPredict Discord community (opens in new tab)"
                >
                  <Discord width="16" height="16" className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Right side - Wallet - Mobile optimized */}
          <HeaderRightArea />
        </div>
      </div>
    </nav>
  );
}

interface LayoutProps {}

export default function Layout({
  children,
}: React.PropsWithChildren<LayoutProps>) {
  return (
    <div className="bg-base-100 text-base-content flex min-h-screen flex-col relative overflow-hidden">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Background decorative elements - Mobile optimized */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 cyber-grid opacity-[0.02]" />
      </div>

      <Header />
      <main id="main-content" className="flex flex-grow flex-col pt-16 sm:pt-18 md:pt-24 pb-6 sm:pb-8 px-3 sm:px-4 lg:px-8 relative z-10" tabIndex={-1}>
        <div className="container mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
