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

        {/* Keep the 3D sports conference logos locked to the exact same grid as the print cards. */}
        <style>{`
          @media (min-width: 1100px) {
            /* The logo container is the sibling immediately after the fixed mid-nav.
               Force it to use the page container instead of the full viewport. */
            .three-d-printing-page > div > .nav-card-mid + div {
              width: 100% !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }

            /* Match the exact four-column geometry used by the print grid. */
            .three-d-printing-page > div > .nav-card-mid + div > div {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              column-gap: 24px !important;
            }

            /* Remove the old fixed inward nudges. */
            .three-d-printing-page > div > .nav-card-mid + div img {
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
