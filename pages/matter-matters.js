import React, { useRef, useEffect } from "react";

const EXPORT_WIDTH = 1366; // Your static publication width in px
const HEADER_HEIGHT = 76; // Your fixed header/nav height in px

export default function MatterMatters() {
  const iframeRef = useRef(null);

  // Ensure iframe is scrolled to top on page change
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.scrollTop = 0;
    }
  }, []);

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        background: "#fff",
        overflow: "hidden", // No scroll on the page itself
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <div
        style={{
          flex: 1,
          width: "100vw",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <iframe
          ref={iframeRef}
          src="/static/matter-matters/index.html"
          title="Matter Matters — Studio Stewart"
          width={EXPORT_WIDTH}
          height={`calc(100vh - ${HEADER_HEIGHT}px)`}
          style={{
            width: EXPORT_WIDTH,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
            minHeight: 0,
            border: "none",
            display: "block",
            background: "#fff",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
          }}
          scrolling="yes"
        />
      </div>
      </div>
      <div
        id="hc-periodic-table-root"
        style={{
          margin: "64px 0 0 0",
          width: "100vw"
        }}
      >
        {/* <HcPeriodicTable /> goes here */}
      </div>
    </main>
  );
}
