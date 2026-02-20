// _app.tsx
import type { AppProps } from 'next/app';
import type { NextPageWithLayout } from '@/types';
import { useState } from 'react';
import Head from 'next/head';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider } from 'next-themes';

// Import Aleo Wallet Adapter dependencies
import { AleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react';
import { WalletModalProvider } from '@provablehq/aleo-wallet-adaptor-react-ui';
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo';
import { FoxWalletAdapter } from '@provablehq/aleo-wallet-adaptor-fox';
import { PuzzleWalletAdapter } from '@provablehq/aleo-wallet-adaptor-puzzle';
import { SoterWalletAdapter } from '@provablehq/aleo-wallet-adaptor-soter';
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield';
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core';
import { Network } from '@provablehq/aleo-types';

// Import global styles and wallet modal styles
import 'swiper/swiper-bundle.css';

import '@/assets/css/globals.css';

import '@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css';

import { CURRENT_NETWORK, CURRENT_RPC_URL } from '@/types';

// Initialize the wallet adapters outside the component
// Multiple wallet support: Leo, Shield, Fox, Puzzle, Soter
const wallets = [
  new LeoWalletAdapter({
    appName: 'zkPredict',
  }),
  new ShieldWalletAdapter({
    appName: 'zkPredict',
  }),
  new FoxWalletAdapter({
    appName: 'zkPredict',
  }),
  new PuzzleWalletAdapter({
    appName: 'zkPredict',
  }),
  new SoterWalletAdapter({
    appName: 'zkPredict',
  }),
];

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function CustomApp({ Component, pageProps }: AppPropsWithLayout) {
  const [queryClient] = useState(() => new QueryClient());
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <AleoWalletProvider
            wallets={wallets}
            decryptPermission={DecryptPermission.AutoDecrypt}
            network={Network.TESTNET}
            programs={['zkpredict.aleo', 'credits.aleo']}
            autoConnect={false}
            onError={(error) => console.error('[Wallet Error]', error.message)}
          >
            <WalletModalProvider>
              <ThemeProvider attribute="data-theme" enableSystem={true} defaultTheme="dark">
                {getLayout(<Component {...pageProps} />)}
              </ThemeProvider>
            </WalletModalProvider>
          </AleoWalletProvider>
        </Hydrate>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </>
  );
}

export default CustomApp;
