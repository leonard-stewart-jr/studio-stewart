import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const MODAL_HEIGHT = 800;
const MODAL_MAX_WIDTH = 1200;
const EDGE_HOVER_WIDTH = 48; // px from left/right edge for arrow cursor
const SCROLL_AMOUNT = 440; // px to scroll per click
const MODAL_MARGIN = 32; // px top, bottom, left

export default function MesopotamiaModal({ open, onClose }) {
  const backdropRef = useRef(null);
  const iframeRef = useRef(null);
  const [mouseEdge, setMouseEdge] = useState(null);

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

  // Set custom cursor for scroll area
  const cursorStyle =
    mouseEdge === "left"
      ? "url('/icons/arrow-left.svg'), w-resize"
      : mouseEdge === "right"
      ? "url('/icons/arrow-right.svg'), e-resize"
      : "grab";

  if (!open) return null;

  return (
    <Backdrop ref={backdropRef} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <ModalContainer
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
        style={{ cursor: cursorStyle }}
      >
        <iframe
          ref={iframeRef}
          src="/models/world/mesopotamia/index.html"
          title="Mesopotamia Timeline"
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

// --- Styled Components ---
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1600;
  background: rgba(32,32,32,0.22);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
`;

const ModalContainer = styled.div`
  margin-top: ${MODAL_MARGIN}px;
  margin-bottom: ${MODAL_MARGIN}px;
  margin-left: ${MODAL_MARGIN}px;
  max-height: ${MODAL_HEIGHT}px;
  width: 95vw;
  max-width: ${MODAL_MAX_WIDTH}px;
  background: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;
