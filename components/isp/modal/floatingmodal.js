import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const DEFAULT_MARGIN = 32;
const EDGE_HOVER_WIDTH = 48;
const SCROLL_AMOUNT = 440;
const HEADER_TABS_HEIGHT = 74;
const MODAL_HEIGHT = 720;
const BOTTOM_SCROLL_PADDING = 16; // Push horizontal scrollbar below content
const LEFT_GAP = 100;

export default function FloatingModal({
  open,
  onClose,
  src,
  width = 2995,
}) {
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
          height: MODAL_HEIGHT,
          cursor: cursorStyle,
          marginTop: 0,
          marginBottom: DEFAULT_MARGIN,
          marginLeft: LEFT_GAP
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
            height: MODAL_HEIGHT - BOTTOM_SCROLL_PADDING, // reduce so scrollbar is pushed below modal
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
  top: 74px;
  z-index: 1600;
  background: rgba(32,32,32,0.13);
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const ModalContainer = styled.div`
  margin-top: 0;
  margin-bottom: ${DEFAULT_MARGIN}px;
  margin-left: ${LEFT_GAP}px;
  margin-right: 0;
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
  padding-bottom: ${BOTTOM_SCROLL_PADDING}px; /* pushes scrollbar below content */
`;
