import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Full-page PDF viewer used on /undergraduate-portfolio.
// - Renders only the current page (single) or current spread (two-up) — not the whole PDF.
// - Zoom +/− and Fit-to-width.
// - Two-up spreads toggle, optional "skip covers" (first/last single).
// - Mobile portrait: spreads render with horizontal scroll; landscape fills more naturally.
// - Keyboard shortcuts: Left/Right to flip, +/- to zoom, F to fit.

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
  const [scale, setScale] = useState(1.0);          // zoom when not fit-to-width
  const [fitToWidth, setFitToWidth] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Book state (only render current)
  const [currentPage, setCurrentPage] = useState(1);        // for single-page mode
  const [currentSpreadIdx, setCurrentSpreadIdx] = useState(0); // for two-up mode

  const wrapperRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    // Use ESM worker matching react-pdf v10 expectations
    const ver = pdfjs.version || "latest";
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${ver}/build/pdf.worker.min.mjs`;
  }, []);

  // Resolve an absolute URL for the PDF to avoid path resolution issues.
  const resolvedFile = useMemo(() => {
    if (typeof window === "undefined") return file || "";
    if (!file) return "";
    const path = file.startsWith("/") ? file : `/${file}`;
    return `${window.location.origin}${path}`;
  }, [file]);

  useEffect(() => {
    function handleResize() {
      if (!wrapperRef.current) return;
      // Fill the viewport width under header with a small side padding.
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
    // Reset book indices on load
    setCurrentPage(1);
    setCurrentSpreadIdx(0);
    if (fitToWidth) setScale(1.0);
  }

  function onPdfLoadError(err) {
    console.error("PDF load error:", err);
    setLoadError(err?.message || "Failed to load PDF.");
  }

  // Build two-up pairs (array of [left,right] or [single]).
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

  // Page width calculation
  const gap = 24;
  const baseWidth = twoUpView ? Math.floor((containerWidth - gap) / 2) : containerWidth;
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
    if (twoUpView) {
      setCurrentSpreadIdx((i) => Math.max(0, i - 1));
    } else {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
  }
  function goNext() {
    if (twoUpView) {
      const maxIdx = (twoUpPairs?.length || 1) - 1;
      setCurrentSpreadIdx((i) => Math.min(maxIdx, i + 1));
    } else {
      setCurrentPage((p) => Math.min(numPages || 1, p + 1));
    }
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
  }, [twoUpView, twoUpPairs, numPages]);

  // Visible pages for current state
  const visiblePages = useMemo(() => {
    if (!numPages) return [];
    if (twoUpView && twoUpPairs) {
      const pair = twoUpPairs[Math.max(0, Math.min(currentSpreadIdx, twoUpPairs.length - 1))] || [];
      return pair;
    }
    // single-page mode
    return [Math.max(1, Math.min(currentPage, numPages))];
  }, [numPages, twoUpView, twoUpPairs, currentSpreadIdx, currentPage]);

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

  // Counters
  const spreadTotal = twoUpPairs?.length || 0;
  const spreadCounter = twoUpView ? `${Math.min(currentSpreadIdx + 1, spreadTotal)} / ${spreadTotal || "—"}` : null;
  const pageCounter = !twoUpView && numPages ? `${currentPage} / ${numPages}` : null;

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
          <button onClick={goPrev} aria-label="Previous" style={btnStyle} title="Previous spread/page">
            ‹ Prev
          </button>
          <button onClick={goNext} aria-label="Next" style={btnStyle} title="Next spread/page">
            Next ›
          </button>

          <span style={counterStyle}>
            {twoUpView ? `Spread: ${spreadCounter}` : `Page: ${pageCounter}`}
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

          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={twoUpView}
              onChange={() => {
                // Toggle mode: normalize indices
                if (onToggleTwoUp) onToggleTwoUp();
                setCurrentSpreadIdx(0);
                setCurrentPage(1);
              }}
              style={{ marginRight: 6 }}
            />
            Two-up (spreads)
          </label>

          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={skipCoversInTwoUp}
              onChange={() => {
                if (onToggleSkipCovers) onToggleSkipCovers();
                setCurrentSpreadIdx(0);
              }}
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

      {/* PDF content: only render current page(s) */}
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
            >
              {twoUpView ? (
                <div
                  style={{
                    display: "flex",
                    gap,
                    alignItems: "flex-start",
                    justifyContent: "center",
                    marginBottom: 16,
                    overflowX: "auto", // mobile portrait: allow horizontal scroll for full spread
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
              ) : (
                <div style={{ marginBottom: 16 }}>
                  <Page
                    pageNumber={visiblePages[0]}
                    width={pageRenderWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              )}
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

const counterStyle = {
  fontFamily: "coolvetica, sans-serif",
  fontSize: 12,
  color: "#666",
  padding: "0 6px",
};
