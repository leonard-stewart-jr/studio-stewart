import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Full-page PDF viewer used on /undergraduate-portfolio.
// - Renders only the current page (each page in your PDF is already a spread).
// - Zoom +/− and Fit-to-width.
// - Prev/Next controls and keyboard shortcuts for flipping pages.
// - Mobile portrait: horizontal scroll if needed; landscape fills more naturally.

export default function PdfBookViewer({
  file,
  title,
  headerHeight = 76
}) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1100);
  const [scale, setScale] = useState(1.0);          // zoom when not fit-to-width
  const [fitToWidth, setFitToWidth] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Book state (only render current page)
  const [currentPage, setCurrentPage] = useState(1);
  const loadedOnceRef = useRef(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    // Use ESM worker (react-pdf v10 expects .mjs)
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
      // Fill viewport width under header with a small side padding.
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
    // Only set page 1 the first time the document loads.
    if (!loadedOnceRef.current) {
      loadedOnceRef.current = true;
      setCurrentPage(1);
      if (fitToWidth) setScale(1.0);
    } else {
      // Clamp current page if it exceeds new bounds
      setCurrentPage(prev => Math.min(Math.max(prev, 1), np));
    }
  }

  function onPdfLoadError(err) {
    console.error("PDF load error:", err);
    setLoadError(err?.message || "Failed to load PDF.");
  }

  // Page width calculation
  const pageRenderWidth = useMemo(() => {
    return Math.floor((fitToWidth ? containerWidth : containerWidth * scale));
  }, [containerWidth, fitToWidth, scale]);

  // Controls
  function zoomIn() {
    setFitToWidth(false);
    setScale(s => Math.min(3.0, s + 0.15));
  }
  function zoomOut() {
    setFitToWidth(false);
    setScale(s => Math.max(0.35, s - 0.15));
  }
  function setFitWidth() {
    setFitToWidth(true);
    setScale(1.0);
  }
  function goPrev() {
    setCurrentPage(p => Math.max(1, p - 1));
  }
  function goNext() {
    setCurrentPage(p => Math.min((numPages || 1), p + 1));
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
  }, [numPages]);

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

  const pageCounter = numPages ? `${currentPage} / ${numPages}` : null;

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
          <button onClick={goPrev} aria-label="Previous" style={btnStyle} title="Previous page">
            ‹ Prev
          </button>
          <button onClick={goNext} aria-label="Next" style={btnStyle} title="Next page">
            Next ›
          </button>

          <span style={counterStyle}>
            {pageCounter ? `Page: ${pageCounter}` : ""}
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

      {/* PDF content: only render the current page (spread) */}
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
              // Provide cMap and standard font data to improve rendering fidelity
              options={{
                cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version || "latest"}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version || "latest"}/standard_fonts/`,
              }}
            >
              <div style={{ marginBottom: 16, overflowX: "auto" }}>
                <Page
                  pageNumber={currentPage}
                  width={pageRenderWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
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
