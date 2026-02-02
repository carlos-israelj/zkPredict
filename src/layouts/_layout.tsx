import { useWindowScroll } from '@/hooks/use-window-scroll';
import { useIsMounted } from '@/hooks/use-is-mounted';
import React from 'react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { HomeIcon } from '@/components/icons/home';
import { Twitter } from '@/components/icons/twitter';
import { Discord } from '@/components/icons/discord';
import Footer from '@/components/ui/Footer';

require('@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css');

function HeaderRightArea() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="wallet-adapter-button-trigger-wrapper">
        <WalletMultiButton className="!h-10 !min-h-0 !px-4 !text-sm sm:!h-12 sm:!px-6 sm:!text-base" />
      </div>
    </div>
  );
}

export function Header() {
  const windowScroll = useWindowScroll();
  const isMounted = useIsMounted();

  return (
    <nav
      className={`fixed top-0 z-30 w-full bg-base-200/80 backdrop-blur-xl border-b transition-all duration-300 ${
        isMounted && windowScroll.y > 10
          ? 'border-cyan-500/30 shadow-lg shadow-cyan-500/10'
          : 'border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left side - Logo and Social links */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/" className="flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform group">
              <img src="/logo.svg" alt="zkPredict Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
              <span className="font-display text-2xl font-bold gradient-text-cyan">
                zkPredict
              </span>
            </a>
            <div className="h-6 w-px bg-base-content/20" />
            <div className="flex items-center gap-1 sm:gap-2">
              {process.env.URL && (
                <a
                  className="btn btn-ghost btn-circle btn-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-transparent transition-all duration-300"
                  href={`${process.env.URL}`}
                  aria-label="Home"
                >
                  <HomeIcon />
                </a>
              )}
              {process.env.TWITTER && (
                <a
                  className="btn btn-ghost btn-circle btn-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-transparent transition-all duration-300"
                  href={`${process.env.TWITTER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter width="18" height="18" />
                </a>
              )}
              {process.env.DISCORD && (
                <a
                  className="btn btn-ghost btn-circle btn-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-transparent transition-all duration-300"
                  href={`${process.env.DISCORD}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord"
                >
                  <Discord width="18" height="18" />
                </a>
              )}
            </div>
          </div>

          {/* Right side - Theme toggle and Wallet */}
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
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 cyber-grid opacity-[0.02]" />
      </div>

      <Header />
      <main className="flex flex-grow flex-col pt-20 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
