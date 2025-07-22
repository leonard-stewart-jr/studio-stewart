import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

// Default values
const DEFAULT_HEIGHT = 720;
const DEFAULT_MARGIN = 32;
const EDGE_HOVER_WIDTH = 48;
const SCROLL_AMOUNT = 440;
const HEADER_TABS_HEIGHT = 74; // Updated per your changes

export default function FloatingModal({
  open,
  onClose,
  src,
  width = 2995, // Set per modal (e.g. 2995 for first modal)
  height // We'll set height dynamically below
}) {
  const backdropRef = useRef(null);
  const iframeRef = useRef(null);
  const [mouseEdge, setMouseEdge] = useState(null);
  const [modalHeight, setModalHeight] = useState(DEFAULT_HEIGHT);

  // Dynamically set modal height so it fits between tabs/header and 32px above bottom
  useEffect(() => {
    function updateHeight() {
      setModalHeight(window.innerHeight - HEADER_TABS_HEIGHT - DEFAULT_MARGIN);
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ESC closes
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Click outside (backdrop) closes
  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  // Mouse edge detection for custom cursor
  function handleMouseMove(e) {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    if (x <= EDGE_HOVER_WIDTH) setMouseEdge("left");
    else if (x >= bounds.width - EDGE_HOVER_WIDTH) setMouseEdge("right");
    else setMouseEdge(null);
  }
  function handleMouseLeave() {
    setMouseEdge(null);
  }

  // Click edge to scroll iframe horizontally
  function handleEdgeClick(e) {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    // Try to scroll the iframe content horizontally
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const win = iframeRef.current.contentWindow;
      if (x <= EDGE_HOVER_WIDTH) {
        win.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
      } else if (x >= bounds.width - EDGE_HOVER_WIDTH) {
        win.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
      }
    }
  }

  // Custom cursor for left/right edge
  const cursorStyle =
    mouseEdge === "left"
      ? "url('/icons/arrow-left.svg'), w-resize"
      : mouseEdge === "right"
      ? "url('/icons/arrow-right.svg'), e-resize"
      : "grab";

  if (!open) return null;

  return (
    <Backdrop
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <ModalContainer
        style={{
          width,
          height: modalHeight,
          cursor: cursorStyle,
          marginTop: 0,
          marginBottom: DEFAULT_MARGIN
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
      >
        <iframe
          ref={iframeRef}
          src={src}
          title="Modal Content"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            background: "transparent",
            display: "block"
          }}
        />
      </ModalContainer>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 74px; /* Starts just below the tabs/header */
  z-index: 1600;
  background: rgba(32,32,32,0.13); /* Lower opacity for a lighter gray */
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
`;

const ModalContainer = styled.div`
  margin-top: 0;
  margin-bottom: ${DEFAULT_MARGIN}px;
  margin-left: ${DEFAULT_MARGIN}px;
  margin-right: 0; /* No margin on right */
  height: ${({ height }) => typeof height === "number" ? `${height}px` : height};
  width: ${({ width }) => typeof width === "number" ? `${width}px` : width};
  background: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: none;
`;
