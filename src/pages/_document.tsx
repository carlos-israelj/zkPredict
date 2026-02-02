import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

class CustomDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    return Document.getInitialProps(ctx);
  }
  
  render() {
    return (
      <Html lang="en-US" dir="ltr">
        <Head>
          {/* PWA Meta Tags */}
          <meta name="application-name" content="zkPredict" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="zkPredict" />
          <meta name="description" content="Zero-Knowledge Private Prediction Markets on Aleo blockchain" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#06b6d4" />

          {/* PWA Icons */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icon-152x152.png" />

          {/* Load fonts, etc. */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap"
            rel="stylesheet"
          />

          {/* 
            Inline script to read localStorage and set data-theme immediately.
          */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Always use light theme
                  document.documentElement.setAttribute('data-theme', 'zkpredict-light');
                })();
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
