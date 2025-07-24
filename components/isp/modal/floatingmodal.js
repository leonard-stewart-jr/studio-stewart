import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

// The content is always fully visible, and scrollbar is directly beneath it.
// Modal covers the entire window, but content is centered horizontally at both ends.

const CENTER_LOCK = true; // for readability

export default function FloatingModal({
  open,
  onClose,
  src,
  width,   // REQUIRED: pass the content width as prop
  height = 720, // content height (matches your HTML content/iframe)
}) {
  const backdropRef = useRef(null);
  const scrollRef = useRef(null);

  // Calculate min/max scroll positions so content is centered at both ends
  function getMinScroll(contentWidth, viewportWidth) {
    // At left, left edge of content is centered in window
    return Math.max(0, (contentWidth / 2) - (viewportWidth / 2));
  }
  function getMaxScroll(contentWidth, viewportWidth) {
    // At right, right edge of content is centered in window
    return Math.max(0, (contentWidth / 2) + (contentWidth - viewportWidth) / 2);
  }

  // On open: scroll so left edge is centered
  useEffect(() => {
    if (open && scrollRef.current && width) {
      const viewportW = window.innerWidth;
      const minScroll = getMinScroll(width, viewportW);
      scrollRef.current.scrollLeft = minScroll;
    }
  }, [open, width]);

  // Clamp scroll position to valid range
  function clampScroll() {
    if (!scrollRef.current || !width) return;
    const viewportW = window.innerWidth;
    const minScroll = getMinScroll(width, viewportW);
    const maxScroll = getMaxScroll(width, viewportW);
    const scrollLeft = scrollRef.current.scrollLeft;
    if (scrollLeft < minScroll) scrollRef.current.scrollLeft = minScroll;
    if (scrollLeft > maxScroll) scrollRef.current.scrollLeft = maxScroll;
  }

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
    clampScroll();
  }
  function handleDragEnd() {
    setIsDragging(false);
    document.body.style.cursor = "";
    clampScroll();
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
      clampScroll();
      e.preventDefault();
    }
    function onTouchEnd() {
      dragging = false;
      clampScroll();
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

  // Wheel scroll: horizontal only, clamp
  function handleWheel(e) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: e.deltaY, behavior: "auto" });
    clampScroll();
    e.preventDefault();
  }

  // Keyboard navigation, clamp
  useEffect(() => {
    function handleKeyDown(e) {
      if (!open || !scrollRef.current) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        scrollRef.current.scrollBy({ left: -220, behavior: "smooth" });
        setTimeout(clampScroll, 0);
      } else if (e.key === "ArrowRight") {
        scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
        setTimeout(clampScroll, 0);
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

  // Center content vertically using flex, but keep the background transparent
  return (
    <Backdrop
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <ModalContentWrap>
        <HorizontalScrollArea
          ref={scrollRef}
          className="mesopotamia-scrollbar"
          style={{
            width: "100vw",
            maxWidth: "100vw",
            height: height + 14, // content + scrollbar
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            boxSizing: "border-box",
            cursor: isDragging ? "grabbing" : "grab",
            background: "transparent",
          }}
          tabIndex={0}
          onWheel={handleWheel}
          onScroll={clampScroll}
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
  width: 100vw;
  max-width: 100vw;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  pointer-events: auto;
  background: none;
  /* Custom scrollbar handled globally */
`;

const ContentBlock = styled.div`
  position: relative;
  box-sizing: border-box;
  margin: 0 auto;
  /* No overflow, keep content fully visible */
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
