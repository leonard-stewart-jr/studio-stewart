import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Full-page PDF viewer used on /undergraduate-portfolio.
// - Zoom +/−
// - Fit to width
// - Two-up spreads toggle
// - Optional "skip covers" (first/last single pages)
// - Mobile: spreads still render; portrait allows horizontal scroll to see full spread.

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
  const [scale, setScale] = useState(1.0); // zoom multiplier when not fit-to-width
  const [fitToWidth, setFitToWidth] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const wrapperRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    // Use a CDN worker or host locally if you prefer. CDN is fine for most setups.
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }, []);

  // Resolve an absolute URL for the PDF to avoid any path resolution issues.
  const resolvedFile = useMemo(() => {
    if (typeof window === "undefined") return file || "";
    if (!file) return "";
    // Ensure leading slash and prepend origin
    const path = file.startsWith("/") ? file : `/${file}`;
    return `${window.location.origin}${path}`;
  }, [file]);

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
    setLoadError(null);
    if (fitToWidth) setScale(1.0);
  }

  function onPdfLoadError(err) {
    // Show a friendly message and log the raw error for debugging.
    console.error("PDF load error:", err);
    setLoadError(err?.message || "Failed to load PDF.");
  }

  const gap = 24;
  const baseWidth = twoUpView ? Math.floor((containerWidth - gap) / 2) : containerWidth;
  const pageRenderWidth = Math.floor(baseWidth * (fitToWidth ? 1.0 : scale));

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

  const twoUpPairs = useMemo(() => {
    if (!numPages || !twoUpView) return null;
    const pages = Array.from({ length: numPages }, (_, i) => i + 1);

    if (!skipCoversInTwoUp) {
      const out = [];
      for (let i = 0; i < pages.length; i += 2) {
        const left = pages[i];
        const right = pages[i + 1] || null;
        out.push([left, right].filter(Boolean));
      }
      return out;
    }

    // Skip covers: first and last single; middle pages paired.
    const out = [];
    if (pages.length <= 2) {
      for (const p of pages) out.push([p]);
      return out;
    }
    out.push([pages[0]]); // front cover single
    for (let i = 1; i < pages.length - 1; i += 2) {
      const left = pages[i];
      const right = pages[i + 1];
      if (right && i + 1 < pages.length - 1) {
        out.push([left, right]);
      } else {
        out.push([left]);
      }
    }
    out.push([pages[pages.length - 1]]); // back cover single
    return out;
  }, [numPages, twoUpView, skipCoversInTwoUp]);

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
          <button onClick={zoomOut} aria-label="Zoom out" style={btnStyle} title="Zoom out">
            −
          </button>
          <button onClick={zoomIn} aria-label="Zoom in" style={btnStyle} title="Zoom in">
            +
          </button>
          <button onClick={setFitWidth} aria-label="Fit to width" style={btnStyle} title="Fit to width">
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

          <a href={resolvedFile} download style={linkStyle} title="Download PDF">
            Download
          </a>
          <a href={resolvedFile} target="_blank" rel="noreferrer" style={linkStyle} title="Open in browser tab">
            Open
          </a>
        </div>
      </div>

      {/* PDF content */}
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
              options={{}}
            >
              {numPages &&
                (twoUpView
                  ? twoUpPairs.map((pair, idx) => (
                      <div
                        key={`pair-${idx}`}
                        style={{
                          display: "flex",
                          gap,
                          alignItems: "flex-start",
                          justifyContent: "center",
                          marginBottom: 16,
                          overflowX: "auto", // mobile portrait: allow horizontal scroll for full spread
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
                  : Array.from({ length: numPages }, (_, i) => (
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
