import React, { useRef, useEffect, useState } from "react";

const EXPORT_WIDTH = 1366; // Your publication's pixel width

export default function MatterMatters() {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState("800px");

  useEffect(() => {
    function setHeight() {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow && iframe.contentDocument) {
        try {
          const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
          // The body height includes all content
          const newHeight = innerDoc.body.scrollHeight + "px";
          setIframeHeight(newHeight);
        } catch (err) {}
      }
    }

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", setHeight);
    }
    window.addEventListener("resize", setHeight);

    return () => {
      if (iframe) {
        iframe.removeEventListener("load", setHeight);
      }
      window.removeEventListener("resize", setHeight);
    };
  }, []);

  return (
    <main
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#fff",
        margin: 0,
        padding: 0,
        overflowX: "hidden", // Prevents horizontal scroll on the page
        overflowY: "auto"
      }}
    >
      <div
        style={{
          width: "100vw",
          margin: 0,
          padding: 0,
          background: "#fff",
          overflowX: "hidden",
          overflowY: "visible"
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
            margin: 0,
            padding: 0,
            overflow: "visible"
          }}
        >
          <iframe
            ref={iframeRef}
            src="/static/matter-matters/index.html"
            style={{
              width: `${EXPORT_WIDTH}px`,
              minWidth: `${EXPORT_WIDTH}px`,
              maxWidth: `${EXPORT_WIDTH}px`,
              height: iframeHeight,
              border: "none",
              display: "block",
              margin: 0,
              padding: 0,
              overflow: "hidden",
              background: "#fff",
              boxSizing: "border-box"
            }}
            title="Matter Matters — Studio Stewart"
            scrolling="no"
            allow="fullscreen"
          />
        </div>
      </div>
      {/* Placeholder for Human Capital Index React component */}
      <div
        id="hc-periodic-table-root"
        style={{
          margin: "64px 0 0 0",
          width: "100vw"
        }}
      >
        {/* Your <HcPeriodicTable /> React component will go here later */}
      </div>
    </main>
  );
}
