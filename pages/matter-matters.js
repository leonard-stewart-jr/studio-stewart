import React, { useRef, useEffect, useState } from "react";

export default function MatterMatters() {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState("800px"); // fallback

  useEffect(() => {
    function handleResize() {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow && iframe.contentDocument) {
        try {
          const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
          // Get height of the HTML content inside the iframe
          const newHeight = innerDoc.body.scrollHeight + "px";
          setIframeHeight(newHeight);
        } catch (err) {
          // Likely a cross-origin issue (shouldn't happen in your case)
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

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        try {
          const innerDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
          setIframeHeight(innerDoc.body.scrollHeight + "px");
        } catch (err) {}
      };
    }
  }, [iframeRef.current]);

  return (
    <main style={{
      width: "100vw",
      minHeight: "100vh",
      background: "#fff",
      margin: 0,
      padding: 0,
      overflow: "hidden"
    }}>
      <iframe
        ref={iframeRef}
        src="/static/matter-matters/index.html"
        style={{
          width: "100vw",
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
      {/* Placeholder for Human Capital Index React component */}
      <div id="hc-periodic-table-root" style={{
        margin: "64px 0 0 0",
        width: "100vw"
      }}>
        {/* Your <HcPeriodicTable /> React component will go here later */}
      </div>
    </main>
  );
}
