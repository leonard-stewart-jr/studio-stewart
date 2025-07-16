import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Document, Page, pdfjs } from "react-pdf";

// This line ensures pdf.js worker is loaded only on the client
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

const MESO_PDF_PATH = "/models/world/mesopotamia.pdf";
const MESO_PDF_WIDTH = 2995;
const MESO_PDF_HEIGHT = 880;

export default function MesopotamiaModal({ open, onClose }) {
  const backdropRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const scrollAreaRef = useRef();

  // ESC closes
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Click outside closes
  const handleBackdropClick = e => {
    if (e.target === backdropRef.current) onClose();
  };

  // Responsive height for modal content
  useEffect(() => {
    const handleResize = () => {
      const maxH = Math.min(window.innerHeight - 92, 900);
      setContainerHeight(maxH);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to left on open
  useEffect(() => {
    if (open && scrollAreaRef.current) {
      scrollAreaRef.current.scrollLeft = 0;
    }
  }, [open, containerHeight]);

  // Scale PDF: fit height to modal, width auto
  const pdfScale = containerHeight ? (containerHeight / MESO_PDF_HEIGHT) : 1;

  if (!open) return null;

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
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <Document
            file={MESO_PDF_PATH}
            loading=""
            error="Could not load PDF"
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

// Styled components

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
  & > * {
    margin: 0 auto;
  }
`;
