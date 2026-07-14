import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import ErrorBoundary from "src/components/Layout/ErrorBoundary";
import "src/lib/init";
import { hydrateTranslationsFromStorage } from "src/lib/translations";

// Styles
import "src/styles/globals.css";
import "src/styles/animations.css";
import "src/styles/circular-progress.css";
import "src/styles/fonts.css";
import "src/styles/games.css";
import "src/styles/nprogress.css";

function App({ Component, pageProps }: AppProps) {
  const [, setLanguageVersion] = useState(0);

  useEffect(() => {
    if (hydrateTranslationsFromStorage()) {
      setLanguageVersion((version) => version + 1);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Head>
        <title>Recognaize</title>
        {/* CJK web font for Mandarin pages. Latin stays Avenir (first in the
            tailwind sans stack); the browser falls through to Noto Sans SC
            per-glyph for Chinese characters. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Poppins:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="manifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, user-scalable=0" />
        <link rel="apple-touch-startup-image" href="android-chrome-512x512.png" />
        <meta name="theme-color" content="#5067D3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
      </Head>

      <GoogleAnalytics gaId="G-BXHXCCLQM5" />

      <Script>{` (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:4975438,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}</Script>
      <noscript>
        <h2>This browser does not support javascript. Please use a different browser.</h2>
      </noscript>

      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default App;
