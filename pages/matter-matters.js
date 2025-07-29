import React, { useRef, useEffect, useState } from "react";

const EXPORT_WIDTH = 1366; // Set this to your InDesign export's pixel width

export default function MatterMatters() {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState("800px"); // fallback
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for responsive behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < EXPORT_WIDTH);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Dynamically set iframe height to match content
  useEffect(() => {
    function handleResize() {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow && iframe.contentDocument) {
        try {
          const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
          const newHeight = innerDoc.body.scrollHeight + "px";
          setIframeHeight(newHeight);
        } catch (err) {
          // Cross-origin issue shouldn't happen for local/public files
        }
      }
    }

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleResize);
    }
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (iframe) {
        iframe.removeEventListener("load", handleResize);
      }
      window.removeEventListener("resize", handleResize);
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
        overflowX: isMobile ? "auto" : "hidden",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {/* Centered horizontally, scrollable on mobile if needed */}
      <div
        style={{
          width: isMobile ? "100vw" : "100%",
          display: "flex",
          justifyContent: "center",
          overflowX: isMobile ? "auto" : "visible"
        }}
      >
        <iframe
          ref={iframeRef}
          src="/static/matter-matters/index.html"
          style={{
            width: isMobile ? "100vw" : `${EXPORT_WIDTH}px`,
            maxWidth: "100vw",
            height: iframeHeight,
            border: "none",
            display: "block",
            background: "#fff",
            margin: 0,
            padding: 0
          }}
          title="Matter Matters — Studio Stewart"
          scrolling="no"
        />
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
