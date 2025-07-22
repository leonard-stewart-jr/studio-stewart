import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const MODAL_TOTAL_HEIGHT = 720;
const LEFT_GAP = 100;
const EDGE_HOVER_WIDTH = 150; // Measured from window edge, not modal
const SCROLL_AMOUNT = 440;
const MODAL_CONTENT_WIDTH = 2436;
const SCROLLBAR_HEIGHT = 14;

export default function FloatingModal({
  open,
  onClose,
  src,
  width = MODAL_CONTENT_WIDTH,
  height = MODAL_TOTAL_HEIGHT,
}) {
  const backdropRef = useRef(null);
  const scrollRef = useRef(null);
  const [mouseEdge, setMouseEdge] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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
      if (!scrollRef.current) return;
      if (e.key === "ArrowLeft") {
        scrollRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
      } else if (e.key === "ArrowRight") {
        scrollRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
      }
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  // Edge hover/click measured from SCREEN edge, not modal
  function handleMouseMove(e) {
    const x = e.clientX;
    if (x <= EDGE_HOVER_WIDTH) setMouseEdge("left");
    else if (x >= window.innerWidth - EDGE_HOVER_WIDTH) setMouseEdge("right");
    else setMouseEdge(null);
  }
  function handleMouseLeave() {
    setMouseEdge(null);
  }
  function handleEdgeClick(e) {
    const x = e.clientX;
    if (!scrollRef.current) return;
    if (x <= EDGE_HOVER_WIDTH) {
      scrollRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
    } else if (x >= window.innerWidth - EDGE_HOVER_WIDTH) {
      scrollRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
    }
  }

  // Drag-to-scroll: Attach to scrollable content, not just gray area
  function handleDragStart(e) {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setScrollStart(scrollRef.current.scrollLeft);
    document.body.style.cursor = "grabbing";
  }
  function handleDragMove(e) {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollStart - deltaX;
    }
  }
  function handleDragEnd() {
    setIsDragging(false);
    document.body.style.cursor = "";
  }
  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  });

  // Wheel scroll (horizontal)
  function handleWheel(e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return;
    }
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: e.deltaY, behavior: "auto" });
      e.preventDefault();
    }
  }

  // Touch drag
  useEffect(() => {
    let startX = 0, startScroll = 0, dragging = false;
    function onTouchStart(e) {
      if (!scrollRef.current) return;
      if (e.touches.length !== 1) return;
      dragging = true;
      startX = e.touches[0].clientX;
      startScroll = scrollRef.current.scrollLeft;
    }
    function onTouchMove(e) {
      if (!dragging || !scrollRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - startX;
      scrollRef.current.scrollLeft = startScroll - deltaX;
      e.preventDefault();
    }
    function onTouchEnd() {
      dragging = false;
    }
    const node = scrollRef.current;
    if (node) {
      node.addEventListener("touchstart", onTouchStart, { passive: false });
      node.addEventListener("touchmove", onTouchMove, { passive: false });
      node.addEventListener("touchend", onTouchEnd, { passive: false });
    }
    return () => {
      if (node) {
        node.removeEventListener("touchstart", onTouchStart);
        node.removeEventListener("touchmove", onTouchMove);
        node.removeEventListener("touchend", onTouchEnd);
      }
    };
  }, [scrollRef.current]);

  // Cursor logic for edge arrows & grab
  let cursorStyle = "grab";
  if (mouseEdge === "left") cursorStyle = "url('/icons/arrow-left.svg'), w-resize";
  else if (mouseEdge === "right") cursorStyle = "url('/icons/arrow-right.svg'), e-resize";
  else if (isDragging) cursorStyle = "grabbing";

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
          height: height,
          paddingLeft: isMobile ? 12 : LEFT_GAP,
          paddingRight: 0,
          cursor: cursorStyle,
          boxSizing: "border-box",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
      >
        {/* This wrapper shifts the scrollbar down visually */}
        <ScrollBarSpacer>
          <ScrollableContent
            ref={scrollRef}
            style={{
              width: "100%",
              height: "100%",
              overflowX: "auto",
              overflowY: "hidden",
              boxSizing: "border-box",
              cursor: cursorStyle,
            }}
            className="mesopotamia-scrollbar"
            tabIndex={0}
            onWheel={handleWheel}
            onMouseDown={handleDragStart} // <-- Attach drag to modal content for full width
          >
            <iframe
              src={src}
              title="Modal Content"
              style={{
                width: MODAL_CONTENT_WIDTH,
                height: "100%",
                border: "none",
                background: "transparent",
                display: "block",
                pointerEvents: "auto",
              }}
              draggable={false}
            />
          </ScrollableContent>
        </ScrollBarSpacer>
      </ModalContainer>
    </Backdrop>
  );
}

// Vertically center modal in gray background space
const Backdrop = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 76px;
  bottom: 0;
  z-index: 1600;
  background: rgba(32,32,32,0.13);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0;
  margin: 0;
`;

const ModalContainer = styled.div`
  background: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  box-sizing: border-box;
  height: ${MODAL_TOTAL_HEIGHT}px;
  @media (max-width: 700px) {
    height: 420px !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
`;

const ScrollBarSpacer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  padding-bottom: ${SCROLLBAR_HEIGHT}px;
  box-sizing: border-box;
`;

const ScrollableContent = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: ${SCROLLBAR_HEIGHT}px;
  box-sizing: border-box;
`;
