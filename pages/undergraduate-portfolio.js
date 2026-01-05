import React from "react";
import dynamic from "next/dynamic";
import HeaderBar from "../components/HeaderBar";

// Load PdfBookViewer only on the client to avoid SSR pdf.js (DOMMatrix) errors
const PdfBookViewer = dynamic(() => import("../components/PdfBookViewer"), { ssr: false });

export default function UndergraduatePortfolioPage() {
  const HEADER_HEIGHT = 76;

  return (
    <>
      <HeaderBar fixedNav={true} />
      <main
        style={{
          marginTop: HEADER_HEIGHT,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          background: "#fff",
        }}
      >
        <PdfBookViewer
          file="/portfolio/undergraduate-portfolio.pdf"
          title="UNDERGRADUATE PORTFOLIO (2020–2024)"
          headerHeight={HEADER_HEIGHT}
        />
      </main>
    </>
  );
}
