import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Full-page PDF "book" viewer for /undergraduate-portfolio.
// - Your PDF is single pages (each page = a designed spread).
// - We show ONLY one spread at a time:
//   • First and last pages render as singles.
//   • Middle pages render as pairs (two-up).
// - Prev/Next flips by spread; never more than one spread visible.
// - Zoom +/− and Fit-to-width.
// - Keyboard: ←/→ to flip, +/- to zoom, F to fit.

export default function PdfBookViewer({
  file,
  title,
  headerHeight = 76
}) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1100);
  const [scale, setScale] = useState(1.0);      // zoom factor when not fitting
  const [fitToWidth, setFitToWidth] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Book state (spread index only; we render one spread at a time)
  const [currentSpreadIdx, setCurrentSpreadIdx] = useState(0);
  const loadedOnceRef = useRef(false);
  const wrapperRef = useRef(null);

  // Use ESM worker compatible with react-pdf v10
  useEffect(() => {
    setIsClient(true);
    const ver = pdfjs.version || "latest";
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${ver}/build/pdf.worker.min.mjs`;
  }, []);

  // Resolve absolute URL for the PDF
  const resolvedFile = useMemo(() => {
    if (typeof window === "undefined") return file || "";
    if (!file) return "";
    const path = file.startsWith("/") ? file : `/${file}`;
    return `${window.location.origin}${path}`;
  }, [file]);

  // Size to fill under header with small side padding
  useEffect(() => {
    function handleResize() {
      if (!wrapperRef.current) return;
      const maxWidth = Math.max(360, Math.min(window.innerWidth - 24, 1800));
      setContainerWidth(maxWidth);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function onPdfLoadSuccess({ numPages: np }) {
    setNumPages(np);
    setLoadError(null);
    // Only set to the first spread on initial load
    if (!loadedOnceRef.current) {
      loadedOnceRef.current = true;
      setCurrentSpreadIdx(0);
      if (fitToWidth) setScale(1.0);
    } else {
      // Clamp if needed after reload
      setCurrentSpreadIdx(prev => Math.min(prev, Math.max(0, buildTwoUpPairs(np).length - 1)));
    }
  }

  function onPdfLoadError(err) {
    console.error("PDF load error:", err);
    setLoadError(err?.message || "Failed to load PDF.");
  }

  // Build pairs with covers as singles:
  // [ [1], [2,3], [4,5], ..., [N] ]
  function buildTwoUpPairs(n) {
    if (!n || n <= 0) return [];
    if (n === 1) return [[1]];
    if (n === 2) return [[1], [2]];
    const pairs = [];
    pairs.push([1]); // front cover
    for (let p = 2; p <= n - 1; p += 2) {
      if (p + 1 <= n - 1) pairs.push([p, p + 1]);
      else pairs.push([p]);
    }
    pairs.push([n]); // back cover
    return pairs;
  }

  const twoUpPairs = useMemo(() => buildTwoUpPairs(numPages || 0), [numPages]);

  // Determine which page(s) to render for the current spread
  const visiblePages = useMemo(() => {
    if (!twoUpPairs.length) return [];
    const i = Math.max(0, Math.min(currentSpreadIdx, twoUpPairs.length - 1));
    return twoUpPairs[i];
  }, [twoUpPairs, currentSpreadIdx]);

  // Width calculation for the currently visible spread
  const gap = 24;
  const pairMode = visiblePages.length === 2;
  const baseWidth = pairMode ? Math.floor((containerWidth - gap) / 2) : containerWidth;
  const pageRenderWidth = Math.floor(baseWidth * (fitToWidth ? 1.0 : scale));

  // Controls
  function zoomIn() {
    setFitToWidth(false);
    setScale((s) => Math.min(3.0, s + 0.15));
  }
  function zoomOut() {
    setFitToWidth(false);
    setScale((s) => Math.max(0.35, s - 0.15));
  }
  function setFitWidth() {
    setFitToWidth(true);
    setScale(1.0);
  }
  function goPrev() {
    setCurrentSpreadIdx(i => Math.max(0, i - 1));
  }
  function goNext() {
    const maxIdx = Math.max(0, twoUpPairs.length - 1);
    setCurrentSpreadIdx(i => Math.min(maxIdx, i + 1));
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      const k = e.key.toLowerCase();
      if (k === "arrowleft") { e.preventDefault(); goPrev(); }
      else if (k === "arrowright") { e.preventDefault(); goNext(); }
      else if (k === "+") { e.preventDefault(); zoomIn(); }
      else if (k === "-") { e.preventDefault(); zoomOut(); }
      else if (k === "f") { e.preventDefault(); setFitWidth(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [twoUpPairs.length]);

  if (!isClient) {
    return (
      <div
        style={{
          marginTop: headerHeight,
          minHeight: `calc(100vh - ${headerHeight}px)`,
          background: "#fff",
        }}
      />
    );
  }

  const spreadCounter = twoUpPairs.length
    ? `${Math.min(currentSpreadIdx + 1, twoUpPairs.length)} / ${twoUpPairs.length}`
    : null;

  return (
    <div
      ref={wrapperRef}
      className="mesopotamia-scrollbar"
      style={{
        background: "#fff",
        color: "#181818",
        minHeight: `calc(100vh - ${headerHeight}px)`,
        padding: "16px 20px 40px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          padding: "8px 0",
          zIndex: 10,
          borderBottom: "1px solid #eee",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0, fontFamily: "coolvetica, sans-serif", fontSize: 20 }}>
          {title || "Portfolio"}
        </h1>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={goPrev} aria-label="Previous" style={btnStyle} title="Previous spread">
            ‹ Prev
          </button>
          <button onClick={goNext} aria-label="Next" style={btnStyle} title="Next spread">
            Next ›
          </button>

          <span style={counterStyle}>
            {spreadCounter ? `Spread: ${spreadCounter}` : ""}
          </span>

          <button onClick={zoomOut} aria-label="Zoom out" style={btnStyle} title="Zoom out">
            −
          </button>
          <button onClick={zoomIn} aria-label="Zoom in" style={btnStyle} title="Zoom in">
            +
          </button>
          <button onClick={setFitWidth} aria-label="Fit to width" style={btnStyle} title="Fit to width">
            Fit
          </button>

          <a href={resolvedFile} download style={linkStyle} title="Download PDF">
            Download
          </a>
          <a href={resolvedFile} target="_blank" rel="noreferrer" style={linkStyle} title="Open in browser tab">
            Open
          </a>
        </div>
      </div>

      {/* Content: only the current spread is rendered */}
      <div style={{ width: containerWidth, margin: "0 auto" }}>
        {!resolvedFile ? (
          <p>No PDF file provided.</p>
        ) : (
          <>
            {loadError && (
              <div style={{ color: "#b00020", marginBottom: 12, fontSize: 14 }}>
                Failed to load PDF. Please refresh the page. If it persists, check the browser console for details.
              </div>
            )}
            <Document
              file={{ url: resolvedFile }}
              onLoadSuccess={onPdfLoadSuccess}
              onLoadError={onPdfLoadError}
              loading={<p>Loading PDF…</p>}
              error={<p>Failed to load PDF.</p>}
              options={{
                cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version || "latest"}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version || "latest"}/standard_fonts/`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap,
                  alignItems: "flex-start",
                  justifyContent: "center",
                  marginBottom: 16,
                  overflowX: pairMode ? "auto" : "hidden", // mobile portrait can pan a spread
                }}
              >
                {visiblePages.map((pageNum) => (
                  <Page
                    key={`page-${pageNum}`}
                    pageNumber={pageNum}
                    width={pageRenderWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </div>
            </Document>
          </>
        )}
      </div>
    </div>
  );
}

const btnStyle = {
  background: "none",
  border: "1px solid #ddd",
  padding: "6px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "coolvetica, sans-serif",
  fontSize: 14,
  color: "#181818",
};

const linkStyle = {
  fontFamily: "coolvetica, sans-serif",
  fontSize: 12,
  color: "#181818",
  textDecoration: "underline",
  padding: "0 6px",
};

const counterStyle = {
  fontFamily: "coolvetica, sans-serif",
  fontSize: 12,
  color: "#666",
  padding: "0 6px",
};
