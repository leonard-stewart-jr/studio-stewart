import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configure PDF.js worker (compatible with Next.js)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfBookViewer({
  file,
  spreadsMode = true,  // Your PDF already contains spreads except covers
  initialPage = 1,
  onRequestClose,       // optional
  title,                // optional
  style                 // optional wrapper style
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [vw, setVw] = useState(1200);
  const [vh, setVh] = useState(800);

  useEffect(() => {
    const onResize = () => {
      if (typeof window !== "undefined") {
        setVw(window.innerWidth);
        setVh(window.innerHeight);
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const baseWidth = useMemo(() => {
    // Leave some padding for controls
    const horizontalPadding = 160;
    return Math.max(320, Math.min(1200, vw - horizontalPadding));
  }, [vw]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    // Clamp current page if needed
    setPageNumber((p) => Math.min(Math.max(p, 1), numPages));
  }

  function prev() {
    setPageNumber((p) => Math.max(1, p - 1));
  }

  function next() {
    setPageNumber((p) => Math.min(numPages || p, p + 1));
  }

  function onKeyDown(e) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape" && onRequestClose) onRequestClose();
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [numPages, onRequestClose]);

  const canPrev = pageNumber > 1;
  const canNext = numPages ? pageNumber < numPages : false;

  const computedWidth = baseWidth * zoom;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...style
      }}
    >
      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "8px 12px",
          background: "#fff",
          border: "1px solid #eee",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {title && <strong style={{ fontSize: 14 }}>{title}</strong>}
          <span style={{ color: "#777", fontSize: 13 }}>
            Page {pageNumber}{numPages ? ` / ${numPages}` : ""}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={prev} disabled={!canPrev} aria-label="Previous page">‹</button>
          <button onClick={next} disabled={!canNext} aria-label="Next page">›</button>
          <span style={{ width: 10 }} />
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} aria-label="Zoom out">–</button>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} aria-label="Zoom in">+</button>
          {onRequestClose && (
            <>
              <span style={{ width: 10 }} />
              <button onClick={onRequestClose} aria-label="Close">Close</button>
            </>
          )}
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          overflow: "auto",
          background: "#f4f4f2",
          border: "1px solid #eee",
          padding: 12,
          minHeight: 200
        }}
      >
        {file ? (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => console.error("PDF load error:", err)}
            loading={<div style={{ padding: 24 }}>Loading PDF…</div>}
            error={<div style={{ padding: 24, color: "#b00" }}>Failed to load PDF.</div>}
          >
            {/* Since your PDF already contains spreads (except covers), render one page at a time */}
            <Page
              pageNumber={pageNumber}
              width={computedWidth}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        ) : (
          <div style={{ padding: 24, color: "#555" }}>
            No file specified. Place your portfolio PDF at /public/portfolio/undergraduate-portfolio.pdf
          </div>
        )}
      </div>
    </div>
  );
}
