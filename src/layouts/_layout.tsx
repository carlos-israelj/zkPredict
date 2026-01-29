import { useWindowScroll } from '@/hooks/use-window-scroll';
import { useIsMounted } from '@/hooks/use-is-mounted';
import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { HomeIcon } from '@/components/icons/home';
import { Twitter } from '@/components/icons/twitter';
import { Discord } from '@/components/icons/discord';
import { useTheme } from 'next-themes';
import Footer from '@/components/ui/Footer';

require('@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css');

// ThemeToggle component - Only Dark/Light
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="btn btn-ghost btn-circle btn-sm hover:bg-base-300"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

function HeaderRightArea() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <ThemeToggle />
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
      className={`fixed top-0 z-30 w-full bg-base-200 transition-all duration-300 ${
        isMounted && windowScroll.y > 10 ? 'shadow-card backdrop-blur' : ''
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left side - Social links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {process.env.URL && (
              <a
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-300"
                href={`${process.env.URL}`}
                aria-label="Home"
              >
                <HomeIcon />
              </a>
            )}
            {process.env.TWITTER && (
              <a
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-300"
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
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-300"
                href={`${process.env.DISCORD}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <Discord width="18" height="18" />
              </a>
            )}
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
    <div className="bg-base-100 text-base-content flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-grow flex-col pt-20 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
