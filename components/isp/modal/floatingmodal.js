import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const LEFT_GAP = 100;
const EDGE_HOVER_WIDTH = 48;
const SCROLL_AMOUNT = 440;
const SCROLLBAR_GAP = 24; // Space between content and the scrollbar

export default function FloatingModal({
  open,
  onClose,
  src,
  width = 2436,
}) {
  const backdropRef = useRef(null);
  const iframeRef = useRef(null);
  const [mouseEdge, setMouseEdge] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showLandscapeBanner, setShowLandscapeBanner] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 800);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

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

  // Try to hint landscape on mobile
  function handleIframeClick() {
    if (isMobile) {
      setShowLandscapeBanner(true);
      setTimeout(() => setShowLandscapeBanner(false), 2800);
    }
  }

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
          width: isMobile ? "98vw" : width,
          maxWidth: "98vw",
          paddingLeft: isMobile ? 12 : LEFT_GAP,
          paddingRight: isMobile ? 12 : 0,
          cursor: cursorStyle,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
      >
        <ScrollableContent
          style={{
            width: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: SCROLLBAR_GAP, // scrollbar sits inside the modal height
            boxSizing: "border-box"
          }}
          className="mesopotamia-scrollbar"
        >
          <iframe
            ref={iframeRef}
            src={src}
            title="Modal Content"
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              display: "block"
            }}
            onClick={handleIframeClick}
          />
        </ScrollableContent>
        {isMobile && showLandscapeBanner && (
          <LandscapeHint>
            For best experience, rotate your phone to landscape
          </LandscapeHint>
        )}
      </ModalContainer>
    </Backdrop>
  );
}

// Backdrop is fixed, anchored 32px above the bottom, no top, horizontally centered
const Backdrop = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 32px;
  z-index: 1600;
  background: rgba(32,32,32,0.13);
  display: flex;
  justify-content: center;
  padding: 0;
  margin: 0;
`;

// ModalContainer: no fixed height, left gap as before, horizontal sizing as before
const ModalContainer = styled.div`
  background: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 98vw;
  box-sizing: border-box;
  padding-top: 0;
  padding-bottom: 0;
  margin: 0;
  @media (max-width: 700px) {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
`;

const ScrollableContent = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  box-sizing: border-box;
  padding-bottom: ${SCROLLBAR_GAP}px;
`;

const LandscapeHint = styled.div`
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: #e6dbb9;
  color: #181818;
  border-radius: 8px;
  padding: 9px 22px;
  font-size: 16px;
  font-weight: 600;
  z-index: 2001;
  box-shadow: 0 2px 12px rgba(32,32,32,0.13);
  pointer-events: none;
`;
