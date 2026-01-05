import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import HeaderBar from "../components/HeaderBar";

// IMPORTANT: Load PdfBookViewer only on the client to avoid SSR pdf.js (DOMMatrix) errors
const PdfBookViewer = dynamic(() => import("../components/PdfBookViewer"), { ssr: false });

export default function UndergraduatePortfolioPage() {
  // Header height in your app is 76px
  const HEADER_HEIGHT = 76;

  // Default preferences:
  // - twoUpView: show spreads (two pages side-by-side)
  // - skipCoversInTwoUp: first and last pages render as single pages
  const [twoUpView, setTwoUpView] = useState(true);
  const [skipCoversInTwoUp, setSkipCoversInTwoUp] = useState(true);

  // Allow deep-link overrides via query if you want in future
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("twoUp")) {
      setTwoUpView(params.get("twoUp") === "true");
    }
    if (params.has("skipCovers")) {
      setSkipCoversInTwoUp(params.get("skipCovers") === "true");
    }
  }, []);

  return (
    <>
      <HeaderBar fixedNav={true} />

      <main
        style={{
          // Fill viewport beneath header
          marginTop: HEADER_HEIGHT,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          background: "#fff",
        }}
      >
        <PdfBookViewer
          file="/portfolio/undergraduate-portfolio.pdf"
          title="UNDERGRADUATE PORTFOLIO (2020–2024)"
          twoUpView={twoUpView}
          onToggleTwoUp={() => setTwoUpView((t) => !t)}
          skipCoversInTwoUp={skipCoversInTwoUp}
          onToggleSkipCovers={() => setSkipCoversInTwoUp((s) => !s)}
          headerHeight={HEADER_HEIGHT}
        />
      </main>
    </>
  );
}
