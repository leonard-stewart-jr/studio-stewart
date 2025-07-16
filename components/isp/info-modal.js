import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Document, Page, pdfjs } from "react-pdf";

// Set worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const MESO_PDF_PATH = "/models/world/mesopotamia.pdf";
// Use your provided size for a perfect fit
const MESO_PDF_WIDTH = 2995;
const MESO_PDF_HEIGHT = 880;

export default function InfoModal({ open, onClose, marker }) {
  const backdropRef = useRef(null);

  // Trap ESC key to close
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Only render when open and marker is MESOPOTAMIA
  if (
    !open ||
    !marker ||
    !marker.name.toLowerCase().startsWith("mesopotamia")
  )
    return null;

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  // Responsive calculated height (modal) and PDF scale
  const [pageReady, setPageReady] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const scrollAreaRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      // 92px = modal paddings/top margin, adjust if needed
      const maxH = Math.min(window.innerHeight - 92, 900);
      setContainerHeight(maxH);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute scale: always match vertical height to modal, width auto
  const pdfScale = containerHeight ? (containerHeight / MESO_PDF_HEIGHT) : 1;
  const renderedWidth = MESO_PDF_WIDTH * pdfScale;

  // Scroll to left on open
  useEffect(() => {
    if (open && scrollAreaRef.current) {
      scrollAreaRef.current.scrollLeft = 0;
    }
  }, [open, renderedWidth]);

  return (
    <ModalBackdrop
      ref={backdropRef}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <ModalBody>
        <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
        <ScrollArea
          ref={scrollAreaRef}
          style={{
            height: containerHeight,
            minHeight: containerHeight,
            maxHeight: containerHeight,
            // horizontal scroll only!
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <Document
            file={MESO_PDF_PATH}
            loading=""
            error="Could not load PDF"
            onLoadSuccess={() => setPageReady(true)}
            renderMode="canvas"
          >
            <Page
              pageNumber={1}
              height={containerHeight}
              width={null}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading=""
              customTextRenderer={null}
            />
          </Document>
        </ScrollArea>
      </ModalBody>
    </ModalBackdrop>
  );
}

// Styles

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0,0,0,0.56);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 48px;
  @media (max-width: 700px) {
    align-items: flex-start;
    padding-top: 0;
  }
`;

const ModalBody = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 44px #2229;
  max-width: 99vw;
  width: 99vw;
  max-height: 96vh;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #181818;
  overflow: hidden;
  @media (max-width: 700px) {
    max-width: 100vw;
    width: 100vw;
    height: 96vh;
    max-height: 98vh;
    border-radius: 4vw;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 22px;
  right: 32px;
  background: none;
  border: none;
  color: #888;
  font-size: 2.8rem;
  font-weight: bold;
  z-index: 2;
  cursor: pointer;
  transition: color 0.18s;
  &:hover, &:focus { color: #b32c2c; }
  @media (max-width: 700px) {
    top: 18px;
    right: 18px;
    font-size: 2.1rem;
  }
`;

const ScrollArea = styled.div`
  width: 100%;
  background: #f7f7f7;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  scrollbar-width: thin;
  scrollbar-color: #e6dbb9 #f0f0ed;
  /* horizontal scroll only */
  & > * {
    margin: 0 auto;
  }
`;
