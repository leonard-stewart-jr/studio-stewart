import React, { useRef } from "react";

const EXPORT_WIDTH = 1366;
const IFRAME_EXTRA_WIDTH = 16; // fudge factor so iframe's scrollbar doesn't cover content
const IFRAME_WIDTH = EXPORT_WIDTH + IFRAME_EXTRA_WIDTH;
const HEADER_HEIGHT = 76;

export default function MatterMatters() {
  const iframeRef = useRef(null);

  return (
    <main
      className="matter-matters-page"
      style={{
        width: "100vw",
        height: "100vh", // fill full viewport height
        margin: 0,
        padding: 0,
        background: "#fff",
        overflow: "hidden", // only iframe scrolls
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
            height: `calc(100vh - ${HEADER_HEIGHT}px)`, // fills the rest below header
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
            height={`calc(100vh - ${HEADER_HEIGHT}px)`}
            style={{
              width: IFRAME_WIDTH,
              height: `calc(100vh - ${HEADER_HEIGHT}px)`,
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
      {/* If you want to keep this, it should not force page height */}
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
