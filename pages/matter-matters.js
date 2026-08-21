import React, { useRef } from "react";
import PTableSection from "../components/p-table-section";

const IFRAME_WIDTH = 1366; // matches the exported HTML width exactly
const IFRAME_HEIGHT = 7452; // matches your HTML height exactly
const IFRAME_RATIO = IFRAME_HEIGHT / IFRAME_WIDTH;

export default function MatterMatters() {
  const iframeRef = useRef(null);

  return (
    <>
      <main
        className="matter-matters-page"
        style={{
          width: "100%",
          minHeight: "100vh",
          margin: 0,
          padding: 0,
          background: "#fff",
          overflowX: "hidden",
          overflowY: "visible",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 76, // Prevents content from hiding under the fixed nav.
        }}
      >
        {/* ======================= */}
        {/* 1. Main Tall iFrame     */}
        {/* ======================= */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            background: "#fff",
            margin: 0,
            padding: 0,
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `min(100vw, ${IFRAME_WIDTH}px)`,
              height: `calc(min(100vw, ${IFRAME_WIDTH}px) * ${IFRAME_RATIO})`,
              position: "relative",
              background: "#fff",
              margin: 0,
              padding: 0,
              boxShadow: "none",
              overflow: "hidden",
              border: "none",
              flex: "0 0 auto",
            }}
          >
            <iframe
              ref={iframeRef}
              src="/static/matter-matters/index.html"
              title="Matter Matters — Studio Stewart"
              width={IFRAME_WIDTH}
              height={IFRAME_HEIGHT}
              style={{
                width: IFRAME_WIDTH,
                height: IFRAME_HEIGHT,
                border: "none",
                background: "#fff",
                display: "block",
                boxSizing: "border-box",
                boxShadow: "none",
                outline: "none",
                overflow: "hidden",
                transform: `scale(calc(min(100vw, ${IFRAME_WIDTH}px) / ${IFRAME_WIDTH}))`,
                transformOrigin: "top left",
              }}
              scrolling="no"
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
            margin: "0",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          <PTableSection />
        </div>
      </main>
    </>
  );
}
