import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

// This modal always positions content 200px from the left edge of the viewport.
// The scroll area and scrollbar are the same width as the content (from data file).

export default function FloatingModal({
  open,
  onClose,
  src,
  width,   // REQUIRED: passed from data file (see globe-locations.js)
  height = 720, // content height
}) {
  const backdropRef = useRef(null);
  const scrollRef = useRef(null);

  // On open, scroll so left edge of content is at 200px from the left of the viewport
  useEffect(() => {
    if (open && scrollRef.current && width) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [open, width]);

  // Drag-to-scroll logic
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  function handleDragStart(e) {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setScrollStart(scrollRef.current.scrollLeft);
    document.body.style.cursor = "grabbing";
  }
  function handleDragMove(e) {
    if (!isDragging || !scrollRef.current) return;
    const deltaX = e.clientX - dragStartX;
    scrollRef.current.scrollLeft = scrollStart - deltaX;
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
  }, [isDragging]);

  // Touch drag for mobile
  useEffect(() => {
    let startX = 0, startScroll = 0, dragging = false;
    function onTouchStart(e) {
      if (!scrollRef.current || e.touches.length !== 1) return;
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
  }, [scrollRef.current, width]);

  // Wheel scroll: horizontal only
  function handleWheel(e) {
    if (!scrollRef.current) return;
    // Use deltaY for horizontal scroll; you can adjust multiplier for speed
    scrollRef.current.scrollBy({ left: e.deltaY, behavior: "auto" });
    e.preventDefault();
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!open || !scrollRef.current) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        scrollRef.current.scrollBy({ left: -220, behavior: "smooth" });
      } else if (e.key === "ArrowRight") {
        scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
      }
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, width, onClose]);

  // Backdrop click closes
  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  if (!open) return null;

  // Styles for modal content
  return (
    <Backdrop
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <ModalContentWrap>
        {/* The scroll area starts 200px from the left edge and matches content width */}
        <HorizontalScrollArea
          ref={scrollRef}
          className="mesopotamia-scrollbar"
          style={{
            width: width,
            maxWidth: width,
            height: height + 14, // content + scrollbar
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            boxSizing: "border-box",
            cursor: isDragging ? "grabbing" : "grab",
            background: "transparent",
            marginLeft: 200, // Start 200px from left edge of viewport
          }}
          tabIndex={0}
          onWheel={handleWheel}
        >
          <ContentBlock
            style={{
              width: width,
              minWidth: width,
              height: height,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              position: "relative",
              background: "white",
              boxShadow: "0 6px 42px 0 rgba(0,0,0,0.18)",
              borderRadius: 0,
              margin: "0 auto",
            }}
          >
            <iframe
              src={src}
              title="Modal Content"
              style={{
                width: width,
                minWidth: width,
                height: height,
                display: "block",
                border: "none",
                background: "transparent",
                pointerEvents: "auto",
              }}
              draggable={false}
            />
            <DragOverlay
              style={{
                pointerEvents: "auto",
                cursor: isDragging ? "grabbing" : "grab"
              }}
              onMouseDown={handleDragStart}
            />
            <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
          </ContentBlock>
        </HorizontalScrollArea>
      </ModalContentWrap>
    </Backdrop>
  );
}

// Styles
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1700;
  background: rgba(32,32,32,0.13);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding: 0;
  margin: 0;
`;

const ModalContentWrap = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  pointer-events: none;
  background: none;
`;

const HorizontalScrollArea = styled.div`
  /* width and marginLeft set in inline style */
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  pointer-events: auto;
  background: none;
`;

const ContentBlock = styled.div`
  position: relative;
  box-sizing: border-box;
  margin: 0 auto;
`;

const DragOverlay = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 10;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 22px;
  font-size: 32px;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  z-index: 20;
  line-height: 1;
  font-weight: 700;
  padding: 0 8px;
  transition: color 0.15s;
  &:hover, &:focus {
    color: #b32c2c;
    outline: none;
  }
`;
