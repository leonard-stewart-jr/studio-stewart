import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Google Fonts: Open Sans */}
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap"
          rel="stylesheet"
        />
        {/* Favicon: SVG with PNG fallback */}
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
