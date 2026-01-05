import Head from "next/head";

export default function DMA25ProjectPage() {
  const HEADER_HEIGHT = 76; // matches your site header

  return (
    <>
      <Head>
        <title>Des Moines Academy — In Progress</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Blank white page with centered "IN PROGRESS" */}
      <main
        style={{
          background: "#fff",
          paddingTop: HEADER_HEIGHT,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "coolvetica, sans-serif",
            fontSize: 28,
            letterSpacing: ".06em",
            color: "#181818",
          }}
        >
          IN PROGRESS
        </h1>
      </main>
    </>
  );
}
