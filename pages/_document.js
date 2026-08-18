import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Inter variable font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />

        {/* Keep the 3D sports conference logos locked to the gaps in the 4-column print grid. */}
        <style>{`
          @media (min-width: 1100px) {
            .three-d-printing-page > div > div[style*="width: 100vw"]:has(
              img[src="/images/prints/nfl/afc.png"],
              img[src="/images/prints/nfl/nfc.png"],
              img[src="/images/prints/nba/eastern.png"],
              img[src="/images/prints/nba/western.png"]
            ) {
              width: 100% !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }

            .three-d-printing-page > div > div[style*="width: 100vw"]:has(
              img[src="/images/prints/nfl/afc.png"],
              img[src="/images/prints/nfl/nfc.png"],
              img[src="/images/prints/nba/eastern.png"],
              img[src="/images/prints/nba/western.png"]
            ) > div {
              column-gap: 24px !important;
            }

            .three-d-printing-page img[src="/images/prints/nfl/afc.png"],
            .three-d-printing-page img[src="/images/prints/nfl/nfc.png"],
            .three-d-printing-page img[src="/images/prints/nba/eastern.png"],
            .three-d-printing-page img[src="/images/prints/nba/western.png"] {
              transform: none !important;
            }
          }
        `}</style>

        {/* Favicon: PNG fallback and SVG */}
        <link rel="icon" href="/favicon.png" />
        <link rel="icon" type="image/svg+xml" href="/assets/logo-mark-only.svg" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
