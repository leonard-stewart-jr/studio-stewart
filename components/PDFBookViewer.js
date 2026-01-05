import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// A full-page PDF viewer with:
// - Zoom +/-
// - Fit to width
// - Two-up spreads toggle
// - Optional "skip covers" in two-up (first and last shown as single pages)
// - Responsive sizing beneath your header

export default function PdfBookViewer({
  file,
  title,
  headerHeight = 76,
  twoUpView = true,
  onToggleTwoUp,
  skipCoversInTwoUp = true,
  onToggleSkipCovers,
}) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1100);
  const [scale, setScale] = useState(1.0); // zoom scale multiplier
  const [fitToWidth, setFitToWidth] = useState(true); // when true, width is auto-fit
  const [isClient, setIsClient] = useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    // Configure PDF.js worker
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    function handleResize() {
      if (!wrapperRef.current) return;
      const maxWidth = Math.min(window.innerWidth - 40, 1400); // side padding
      setContainerWidth(Math.max(360, maxWidth));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function onPdfLoadSuccess({ numPages: np }) {
    setNumPages(np);
    // Reset zoom on load if fit-to-width
    if (fitToWidth) setScale(1.0);
  }

  // Compute per-page width based on mode and zoom
  const gap = 24;
  const baseWidth = twoUpView ? Math.floor((containerWidth - gap) / 2) : containerWidth;
  const pageRenderWidth = Math.floor(baseWidth * (fitToWidth ? 1.0 : scale));

  // Zoom controls
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

  // Build a page ordering for two-up spreads skipping covers:
  // - First page alone
  // - Middle pages in pairs
  // - Last page alone (if odd count or you want both ends single)
  const twoUpPairs = useMemo(() => {
    if (!numPages || !twoUpView) return null;
    const pages = Array.from({ length: numPages }, (_, i) => i + 1);

    if (!skipCoversInTwoUp) {
      // Just pair pages in sequence
      const out = [];
      for (let i = 0; i < pages.length; i += 2) {
        const left = pages[i];
        const right = pages[i + 1] || null;
        out.push([left, right].filter(Boolean));
      }
      return out;
    }

    // Skip covers: first and last single; middle in pairs
    const out = [];
    if (pages.length <= 2) {
      // Edge cases: 1 or 2 pages -> render singles
      for (const p of pages) out.push([p]);
      return out;
    }
    // First cover single
    out.push([pages[0]]);
    // Middle pairs
    for (let i = 1; i < pages.length - 1; i += 2) {
      const left = pages[i];
      const right = pages[i + 1];
      if (right && i + 1 < pages.length - 1) {
        out.push([left, right]);
      } else {
        // If odd count in middle, push leftover single
        out.push([left]);
      }
    }
    // Last cover single
    out.push([pages[pages.length - 1]]);
    return out;
  }, [numPages, twoUpView, skipCoversInTwoUp]);

  if (!isClient) {
    // Avoid SSR layout thrash; render a minimal shell
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
          <button
            onClick={zoomOut}
            aria-label="Zoom out"
            style={btnStyle}
            title="Zoom out"
          >
            −
          </button>
          <button
            onClick={zoomIn}
            aria-label="Zoom in"
            style={btnStyle}
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={setFitWidth}
            aria-label="Fit to width"
            style={btnStyle}
            title="Fit to width"
          >
            Fit
          </button>

          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={twoUpView}
              onChange={onToggleTwoUp}
              style={{ marginRight: 6 }}
            />
            Two-up (spreads)
          </label>

          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={skipCoversInTwoUp}
              onChange={onToggleSkipCovers}
              style={{ marginRight: 6 }}
              disabled={!twoUpView}
              title={!twoUpView ? "Enable Two-up to use this option" : ""}
            />
            Skip covers
          </label>

          <a
            href={file}
            download
            style={linkStyle}
            title="Download PDF"
          >
            Download
          </a>
          <a
            href={file}
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
            title="Open in browser tab"
          >
            Open
          </a>
        </div>
      </div>

      {/* PDF content */}
      <div style={{ width: containerWidth, margin: "0 auto" }}>
        {!file ? (
          <p>No PDF file provided.</p>
        ) : (
          <Document
            file={file}
            onLoadSuccess={onPdfLoadSuccess}
            loading={<p>Loading PDF…</p>}
          >
            {numPages &&
              (twoUpView
                ? // Render pairs according to twoUpPairs
                  twoUpPairs.map((pair, idx) => (
                    <div
                      key={`pair-${idx}`}
                      style={{
                        display: "flex",
                        gap,
                        alignItems: "flex-start",
                        justifyContent: "center",
                        marginBottom: 16,
                        // On narrow mobile portrait, allow horizontal scroll to view the full spread
                        overflowX: "auto",
                      }}
                    >
                      {pair.map((pageNum) => (
                        <Page
                          key={`page-${pageNum}`}
                          pageNumber={pageNum}
                          width={pageRenderWidth}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      ))}
                    </div>
                  ))
                : // Single page stacked
                  Array.from({ length: numPages }, (_, i) => (
                    <div key={`single-${i + 1}`} style={{ marginBottom: 16 }}>
                      <Page
                        pageNumber={i + 1}
                        width={pageRenderWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  )))}
          </Document>
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

const labelStyle = {
  display: "inline-flex",
  alignItems: "center",
  fontFamily: "coolvetica, sans-serif",
  fontSize: 12,
  color: "#666",
  padding: "0 6px",
};

const linkStyle = {
  fontFamily: "coolvetica, sans-serif",
  fontSize: 12,
  color: "#181818",
  textDecoration: "underline",
  padding: "0 6px",
};
