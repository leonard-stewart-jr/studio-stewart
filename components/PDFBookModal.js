import React, { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

export default function PdfBookModal({ open, onClose, file, title, spreadsMode = true }) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1000);

  useEffect(() => {
    // Ensure the PDF.js worker is available
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    function handleResize() {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      // Leave some side padding inside the modal
      setContainerWidth(Math.max(320, Math.min(1200, w - 160)));
    }
    handleResize();
    if (open) {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [open]);

  const pageWidth = useMemo(() => {
    if (!spreadsMode) return containerWidth;
    // For spreads, show two pages per row with a gap
    const gap = 24;
    return Math.floor((containerWidth - gap) / 2);
  }, [containerWidth, spreadsMode]);

  function onPdfLoadSuccess({ numPages: np }) {
    setNumPages(np);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "PDF Viewer"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        className="mesopotamia-scrollbar"
        style={{
          background: "#fff",
          color: "#181818",
          width: "90vw",
          maxWidth: 1400,
          maxHeight: "85vh",
          borderRadius: 8,
          boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          padding: "18px 24px 28px 24px"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close PDF"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            color: "#181818",
            fontSize: 28,
            width: 42,
            height: 42,
            cursor: "pointer"
          }}
        >
          ×
        </button>

        {title && (
          <h2 style={{ margin: "10px 0 16px 0", fontFamily: "coolvetica, sans-serif" }}>
            {title}
          </h2>
        )}

        {!file ? (
          <p style={{ margin: "24px 0" }}>No PDF file provided.</p>
        ) : (
          <div style={{ width: containerWidth, margin: "0 auto" }}>
            <Document file={file} onLoadSuccess={onPdfLoadSuccess} loading={<p>Loading PDF…</p>}>
              {numPages &&
                (spreadsMode
                  ? // Render spreads (two pages side by side)
                    Array.from({ length: Math.ceil(numPages / 2) }, (_, i) => {
                      const leftPage = i * 2 + 1;
                      const rightPage = leftPage + 1;
                      return (
                        <div
                          key={`spread-${i}`}
                          style={{
                            display: "flex",
                            gap: 24,
                            alignItems: "flex-start",
                            justifyContent: "center",
                            marginBottom: 16
                          }}
                        >
                          <Page
                            pageNumber={leftPage}
                            width={pageWidth}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                          {rightPage <= numPages ? (
                            <Page
                              pageNumber={rightPage}
                              width={pageWidth}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                            />
                          ) : null}
                        </div>
                      );
                    })
                  : // Render single pages stacked
                    Array.from({ length: numPages }, (_, i) => (
                      <div key={`page-${i}`} style={{ marginBottom: 16 }}>
                        <Page
                          pageNumber={i + 1}
                          width={pageWidth}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </div>
                    )))}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
