import React, { useRef, useEffect, useState } from "react";

const EXPORT_WIDTH = 1366; // Match your export!

export default function MatterMatters() {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState("800px");

  useEffect(() => {
    function setHeight() {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow && iframe.contentDocument) {
        try {
          const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
          // Use the height of the main div if possible
          const wrapper = innerDoc.body.firstElementChild;
          const newHeight = wrapper ? wrapper.scrollHeight : innerDoc.body.scrollHeight;
          setIframeHeight(newHeight + "px");
        } catch (err) {}
      }
    }
    const iframe = iframeRef.current;
    if (iframe) iframe.addEventListener("load", setHeight);
    window.addEventListener("resize", setHeight);
    return () => {
      if (iframe) iframe.removeEventListener("load", setHeight);
      window.removeEventListener("resize", setHeight);
    };
  }, []);

  return (
    <main
      style={{
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "#fff",
        overflowX: "hidden", // Prevent horizontal scroll
        overflowY: "auto"
      }}
    >
      <div
        style={{
          width: "100vw",
          overflowX: "hidden",
          margin: 0,
          padding: 0,
          background: "#fff"
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            margin: 0,
            padding: 0
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
              background: "#fff",
              boxSizing: "border-box"
            }}
            title="Matter Matters — Studio Stewart"
            scrolling="no"
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
