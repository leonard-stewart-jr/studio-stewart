import React, { useRef } from "react";
import PTableSection from "../components/p-table-section";
import HeaderBar from "../components/HeaderBar";

const IFRAME_WIDTH = 1366 + 16; // 16px fudge for scrollbar
const IFRAME_HEIGHT = 7452; // matches your HTML height exactly

export default function MatterMatters() {
  const iframeRef = useRef(null);
  return (
    <>
      {/* Fixed nav bar, only for this page */}
      <HeaderBar fixedNav={true} />
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
          paddingTop: 76, // Prevents content from hiding under the fixed nav!
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
              height: IFRAME_HEIGHT,
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
              height={IFRAME_HEIGHT}
              style={{
                width: IFRAME_WIDTH,
                height: IFRAME_HEIGHT,
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
    </>
  );
}
