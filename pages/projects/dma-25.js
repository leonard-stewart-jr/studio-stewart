import Head from "next/head";
import { useEffect } from "react";

export default function DMA25ProjectPage() {
  // Ensure normal page scrolling (some pages lock scroll)
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyHeight = document.body.style.height;
    const prevHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    document.body.style.height = "";
    document.documentElement.style.height = "";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.height = prevBodyHeight;
      document.documentElement.style.height = prevHtmlHeight;
    };
  }, []);

  // Header height is 76px in your layout; reserve that space
  const HEADER_HEIGHT = 76;

  return (
    <>
      <Head>
        <title>Des Moines Academy — Studio Stewart</title>
        <meta name="description" content="Des Moines Academy of Arts and Athletics — Comprehensive Building Studio (Solo)." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main
        style={{
          paddingTop: HEADER_HEIGHT,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 1600,
            boxSizing: "border-box",
            padding: "18px 18px 0 18px"
          }}
        >
          <h1 style={{ margin: "6px 0 6px 0", fontSize: 24, letterSpacing: ".06em" }}>
            DES MOINES ACADAMY OF ARTS AND ATHLETICS
          </h1>
          <p style={{ margin: "0 0 14px 0", color: "#6c6c6a", fontSize: 14 }}>
            ARCH 650 — Comprehensive Building Studio — Solo • Spring 25&apos;
          </p>

          {/* Optional action row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <a
              href="/portfolio/dma/25/index"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "coolvetica, sans-serif",
                fontSize: 13,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "#e6dbb9",
                textDecoration: "underline",
              }}
              title="Open interactive in a new tab"
            >
              Open in new tab
            </a>
            {/* If you have a PDF for this project, set the href below */}
            {/* <a href="/portfolio/dma/25/project.pdf" download
              style={{
                fontFamily: "coolvetica, sans-serif",
                fontSize: 13,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "#e6dbb9",
                textDecoration: "underline",
              }}
              title="Download PDF"
            >
              Download PDF
            </a> */}
          </div>
        </section>

        {/* Full-height iframe viewer */}
        <section
          style={{
            width: "100%",
            flex: "1 1 auto",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            background: "#ffffff",
          }}
        >
          <iframe
            title="Des Moines Academy Interactive"
            src="/portfolio/dma/25/index"
            style={{
              border: "none",
              width: "100%",
              height: `calc(100vh - ${HEADER_HEIGHT + 58}px)`, // 58px approx for title+actions area
              background: "transparent",
            }}
          />
        </section>
      </main>
    </>
  );
}
