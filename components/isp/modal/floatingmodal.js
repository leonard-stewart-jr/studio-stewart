import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const DEFAULT_MARGIN = 32;
const EDGE_HOVER_WIDTH = 48;
const SCROLL_AMOUNT = 440;
const HEADER_TABS_HEIGHT = 74;

export default function FloatingModal({
  open,
  onClose,
  src,
  width = 2995,
  height // Remove default here, we'll calculate it
}) {
  const backdropRef = useRef(null);
  const iframeRef = useRef(null);
  const [mouseEdge, setMouseEdge] = useState(null);
  const [modalHeight, setModalHeight] = useState(720); // Initial fallback

  useEffect(() => {
    function updateHeight() {
      setModalHeight(window.innerHeight - HEADER_TABS_HEIGHT - DEFAULT_MARGIN);
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ... rest of your logic unchanged ...

  if (!open) return null;

  return (
    <Backdrop ref={backdropRef} onClick={handleBackdropClick} role="dialog" aria-modal="true">
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
  top: 76px;
  z-index: 1600;
  background: rgba(32,32,32,0.13);
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
