import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const MODAL_TOTAL_HEIGHT = 720;
const LEFT_GAP = 100; // Initial gap, disappears as you drag/scroll
const EDGE_HOVER_WIDTH = 150; // 150px from each edge triggers arrow cursor/scroll
const SCROLL_AMOUNT = 440;

export default function FloatingModal({
  open,
  onClose,
  src,
  width = 2436,
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

  // Mouse edge logic for arrow cursor and click-to-scroll
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
    if (!scrollRef.current) return;
    if (x <= EDGE_HOVER_WIDTH) {
      scrollRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
    } else if (x >= bounds.width - EDGE_HOVER_WIDTH) {
      scrollRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
    }
  }

  // Drag-to-scroll logic
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
      // Already horizontal
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
          paddingRight: 0, // Remove right gap
          cursor: cursorStyle,
          boxSizing: "border-box",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
        onMouseDown={handleDragStart}
      >
        <ScrollableContent
          ref={scrollRef}
          style={{
            width: "100%",
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            boxSizing: "border-box",
          }}
          className="mesopotamia-scrollbar"
          tabIndex={0}
          onWheel={handleWheel}
        >
          <iframe
            src={src}
            title="Modal Content"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "transparent",
              display: "block",
              pointerEvents: "auto",
            }}
            draggable={false}
          />
        </ScrollableContent>
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
  align-items: center; /* Center vertically */
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

const ScrollableContent = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  box-sizing: border-box;
`;
