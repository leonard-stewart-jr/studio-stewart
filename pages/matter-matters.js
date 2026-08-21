import React, { useEffect, useRef, useState } from "react";
import PTableSection from "../components/p-table-section";

const IFRAME_WIDTH = 1366; // matches the exported HTML width exactly
const IFRAME_HEIGHT = 7452; // matches your HTML height exactly
const MOBILE_BREAKPOINT = 768;
const MOBILE_LAST_SLICE_VISIBLE_HEIGHT = 130;

const mobilePublicationSlices = [
  "/static/matter-matters/mobile/matter-matters-mobile_01.gif",
  "/static/matter-matters/mobile/matter-matters-mobile_02.gif",
  "/static/matter-matters/mobile/matter-matters-mobile_03.gif",
  "/static/matter-matters/mobile/matter-matters-mobile_04.gif",
];

function getViewportWidth() {
  if (typeof window === "undefined") return IFRAME_WIDTH;
  return window.innerWidth;
}

export default function MatterMatters() {
  const iframeRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);

  useEffect(() => {
    function updateViewportWidth() {
      setViewportWidth(getViewportWidth());
    }

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    window.addEventListener("orientationchange", updateViewportWidth);
    return () => {
      window.removeEventListener("resize", updateViewportWidth);
      window.removeEventListener("orientationchange", updateViewportWidth);
    };
  }, []);

  const scale = Math.min(1, viewportWidth / IFRAME_WIDTH);
  const scaledWidth = IFRAME_WIDTH * scale;
  const scaledHeight = IFRAME_HEIGHT * scale;
  const useMobileImageFallback = viewportWidth < MOBILE_BREAKPOINT;

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
          paddingTop: useMobileImageFallback ? "22px" : "76px",
        }}
      >
        {/* ======================= */}
        {/* 1. Main Publication     */}
        {/* ======================= */}
        {useMobileImageFallback ? (
          <div
            aria-label="Matter Matters publication mobile image version"
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
                width: "100%",
                maxWidth: "430px",
                background: "#fff",
                margin: 0,
                padding: 0,
                lineHeight: 0,
                fontSize: 0,
                overflow: "hidden",
              }}
            >
              {mobilePublicationSlices.map((src, index) => {
                const isLastSlice = index === mobilePublicationSlices.length - 1;

                return (
                  <div
                    key={src}
                    style={{
                      width: "100%",
                      height: isLastSlice ? MOBILE_LAST_SLICE_VISIBLE_HEIGHT : "auto",
                      margin: 0,
                      padding: 0,
                      lineHeight: 0,
                      fontSize: 0,
                      overflow: isLastSlice ? "hidden" : "visible",
                    }}
                  >
                    <img
                      src={src}
                      alt={`Matter Matters mobile publication section ${index + 1}`}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        boxShadow: "none",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
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
        )}

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
