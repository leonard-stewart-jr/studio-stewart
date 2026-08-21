import React, { useEffect, useRef, useState } from "react";
import PTableSection from "../components/p-table-section";

const IFRAME_WIDTH = 1366; // matches the exported HTML width exactly
const IFRAME_HEIGHT = 7452; // matches your HTML height exactly

function getMatterMattersScale() {
  if (typeof window === "undefined") return 1;
  return Math.min(1, window.innerWidth / IFRAME_WIDTH);
}

export default function MatterMatters() {
  const iframeRef = useRef(null);
  const [scale, setScale] = useState(getMatterMattersScale);

  useEffect(() => {
    function updateScale() {
      setScale(getMatterMattersScale());
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);
    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
    };
  }, []);

  const scaledWidth = IFRAME_WIDTH * scale;
  const scaledHeight = IFRAME_HEIGHT * scale;

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
          paddingTop: "clamp(34px, 5vw, 76px)", // Desktop stays 76px, phone gets less top whitespace.
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
              width: scaledWidth,
              height: scaledHeight,
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
                transform: `scale(${scale})`,
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
