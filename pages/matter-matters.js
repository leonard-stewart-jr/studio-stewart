import React, { useRef } from "react";

const EXPORT_WIDTH = 1366; // Your static publication width
const HEADER_HEIGHT = 76;  // Height of your sticky header/nav
const SCROLLBAR_WIDTH = 16; // Typical browser scrollbar width (adjust as needed)

export default function MatterMatters() {
  const iframeRef = useRef(null);

  return (
    <main
      className="matter-matters-page"
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        background: "#fff",
        overflow: "hidden", // Only the iframe scrolls!
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        boxShadow: "none", // Remove any box-shadow for this page
        border: "none",
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
          background: "#fff",
          margin: 0,
          padding: 0,
          boxShadow: "none",
        }}
      >
        <div
          style={{
            width: EXPORT_WIDTH,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            position: "relative",
            background: "#fff",
            margin: 0,
            padding: 0,
            boxShadow: "none",
            overflow: "visible",
            border: "none"
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
              border: "none",
              background: "#fff",
              display: "block",
              overflowY: "auto",
              overflowX: "hidden",
              // Scrollbar offset trick:
              paddingRight: SCROLLBAR_WIDTH,
              marginRight: -SCROLLBAR_WIDTH,
              boxSizing: "content-box",
              boxShadow: "none",
              outline: "none",
            }}
            scrolling="yes"
            allowFullScreen
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
