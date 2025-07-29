import React, { useRef } from "react";
import PTableSection from "../components/p-table-section";

const EXPORT_WIDTH = 1366;
const IFRAME_EXTRA_WIDTH = 16; // fudge factor for scrollbar
const IFRAME_WIDTH = EXPORT_WIDTH + IFRAME_EXTRA_WIDTH;
// You may tune PAGE_OFFSET if you want the iFrame not to overlap with any nav/header
const PAGE_OFFSET = 76; // Try subtracting 36px if you want less offset

export default function MatterMatters() {
  const iframeRef = useRef(null);

  return (
    <main
      className="matter-matters-page"
      style={{
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "#fff",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {/* ======================= */}
      {/* 1. Main Tall iFrame     */}
      {/* ======================= */}
      <div
        style={{
          width: "100vw",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#fff",
          margin: 0,
          padding: 0,
          boxShadow: "none",
        }}
      >
        <div
          style={{
            width: IFRAME_WIDTH,
            minHeight: "8000px", // allow your HTML to fill height
            position: "relative",
            background: "#fff",
            margin: 0,
            padding: 0,
            boxShadow: "none",
            overflow: "visible",
            border: "none",
          }}
        >
          <iframe
            ref={iframeRef}
            src="/static/matter-matters/index.html"
            title="Matter Matters — Studio Stewart"
            width={IFRAME_WIDTH}
            height="8000px" // This allows the iFrame to be as tall as your HTML content
            style={{
              width: IFRAME_WIDTH,
              height: "8000px", // Same as above, so the content is fully visible
              border: "none",
              background: "#fff",
              display: "block",
              boxSizing: "content-box",
              boxShadow: "none",
              outline: "none",
              overflow: "visible",
            }}
            scrolling="yes"
            allowFullScreen
          />
        </div>
      </div>
      {/* ======================= */}
      {/* 2. Periodic Table Section (React) */}
      {/* ======================= */}
      <div
        id="hc-periodic-table-root"
        style={{
          margin: "0px 0 0 0",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
        }}
      >
        <PTableSection />
      </div>
    </main>
  );
}
