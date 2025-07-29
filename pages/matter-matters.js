import React, { useRef } from "react";

const EXPORT_WIDTH = 1366;
const IFRAME_EXTRA_WIDTH = 16; // fudge factor for scrollbar
const IFRAME_WIDTH = EXPORT_WIDTH + IFRAME_EXTRA_WIDTH;
const PAGE_OFFSET = 74; // Try subtracting 36px instead of 76px

export default function MatterMatters() {
  const iframeRef = useRef(null);

  return (
    <main
      className="matter-matters-page"
      style={{
        width: "100vw",
        height: `calc(100vh - ${PAGE_OFFSET}px)`, // now subtracts 36px
        margin: 0,
        padding: 0,
        background: "#fff",
        overflow: "hidden",
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
          background: "#fff",
          margin: 0,
          padding: 0,
          boxShadow: "none",
        }}
      >
        <div
          style={{
            width: IFRAME_WIDTH,
            height: `calc(100vh - 76px)`, // keep iframe perfect as you said!
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
            width={IFRAME_WIDTH}
            height={`calc(100vh - 76px)`}
            style={{
              width: IFRAME_WIDTH,
              height: `calc(100vh - 76px)`,
              border: "none",
              background: "#fff",
              display: "block",
              overflowY: "auto",
              overflowX: "hidden",
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
