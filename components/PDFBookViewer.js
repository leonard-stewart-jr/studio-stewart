import React, { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

export default function PdfBookViewer({ file, title, spreadsMode = true }) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1100);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    function handleResize() {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      setContainerWidth(Math.max(320, Math.min(1200, w - 120)));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pageWidth = useMemo(() => {
    if (!spreadsMode) return containerWidth;
    const gap = 24;
    return Math.floor((containerWidth - gap) / 2);
  }, [containerWidth, spreadsMode]);

  function onPdfLoadSuccess({ numPages: np }) {
    setNumPages(np);
  }

  return (
    <div
      className="mesopotamia-scrollbar"
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: "#181818",
        padding: "24px 24px 48px 24px"
      }}
    >
      {title && (
        <h1 style={{ margin: "6px 0 18px 0", fontFamily: "coolvetica, sans-serif" }}>
          {title}
        </h1>
      )}
      {!file ? (
        <p>No PDF file provided.</p>
      ) : (
        <div style={{ width: containerWidth, margin: "0 auto" }}>
          <Document file={file} onLoadSuccess={onPdfLoadSuccess} loading={<p>Loading PDF…</p>}>
            {numPages &&
              (spreadsMode
                ? Array.from({ length: Math.ceil(numPages / 2) }, (_, i) => {
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
                : Array.from({ length: numPages }, (_, i) => (
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
  );
}
