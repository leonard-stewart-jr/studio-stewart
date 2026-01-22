import React, { useRef } from "react";
import HeaderBar from "../components/HeaderBar";

const IFRAME_WIDTH = 1600;
const IFRAME_HEIGHT = 3940;

export default function AboutPage() {
  const iframeRef = useRef(null);

  return (
    <>
      {/* Keep the normal header/navigation */}
      <HeaderBar fixedNav={true} />

      <main
        className="about-page"
        style={{
          width: "100vw",
          minHeight: "100vh",
          margin: 0,
          padding: 40, // no top padding as requested
          background: "#fff",
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* Full-bleed wrapper so the iframe is centered but the page edge remains full-bleed */}
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
              src="/static/about-page/index.html"
              title="About — Studio Stewart"
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
      </main>
    </>
  );
}
