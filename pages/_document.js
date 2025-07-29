import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Adobe Fonts: Coolvetica Typekit */}
        <link rel="stylesheet" href="https://use.typekit.net/mzk5snr.css" />
        <link
          href="https://fonts.googleapis.com/css?family=Bungee+Shade&display=swap"
          rel="stylesheet"
/>
        {/* Favicon: PNG fallback and SVG */}
        <link rel="icon" type="image/png" href="/assets/logo-mark-only-32.png" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/assets/logo-mark-only.svg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
