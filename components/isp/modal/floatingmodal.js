import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

export default function FloatingModal({
  open,
  onClose,
  src,
  width,   // e.g., 2934 from data file
  height = 720,
}) {
  const backdropRef = useRef(null);
  const scrollRef = useRef(null);

  // --- BUFFER LOGIC ---
  const bufferWidth = 200;
  const totalScrollableWidth = bufferWidth + width + bufferWidth;
  const visibleWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const scrollAreaWidth = visibleWidth;

  // Track scroll position
  const [scrollX, setScrollX] = useState(0);

  // Drag-to-scroll logic
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  // SVG scrollbar logic
  const dragBarHeight = 22;
  const dragHandleRadius = 12;
  const dragBarColor = "#e6dbb9";
  const dragBarTrackColor = "#f0f0ed";
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

  // Ensure scroll starts at 0 on open
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setScrollX(0);
    }
  }, [open, width]);

  // Update scrollX on scroll
  function onScroll() {
    if (scrollRef.current) {
      setScrollX(scrollRef.current.scrollLeft);
    }
  }

  // Drag-to-scroll for content
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

  // HIDE NATIVE SCROLLBAR
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.style.scrollbarWidth = "none";
    scrollRef.current.style.msOverflowStyle = "none";
    // For Webkit browsers:
    scrollRef.current.classList.add("hide-native-scrollbar");
    // Clean up:
    return () => {
      if (scrollRef.current) scrollRef.current.classList.remove("hide-native-scrollbar");
    };
  }, []);

  // --- SVG SCROLLBAR LOGIC ---
  // The bar's width is the total scrollable width (content + both buffers)
  // The handle's position maps to scrollLeft (0 = left, max = right)
  const maxScroll = totalScrollableWidth - scrollAreaWidth;
  const svgBarWidth = totalScrollableWidth;
  // Scroll percent (avoid divide by zero)
  const percent = maxScroll > 0 ? scrollX / maxScroll : 0;
  // Handle position: inside the bar, respect handle radius at each end
  const handleX = dragHandleRadius + percent * (svgBarWidth - 2 * dragHandleRadius);

  // Dragging the handle
  function handleBarDragStart(e) {
    e.preventDefault();
    setIsDraggingHandle(true);
    document.body.style.cursor = "grabbing";
  }
  function handleBarDragMove(e) {
    if (!isDraggingHandle || !scrollRef.current) return;
    const svgRect = document.getElementById("custom-drag-bar-svg")?.getBoundingClientRect();
    if (!svgRect) return;
    let x = e.clientX - svgRect.left;
    x = Math.max(dragHandleRadius, Math.min(svgBarWidth - dragHandleRadius, x));
    // Convert x back to scrollLeft
    const newPercent = (x - dragHandleRadius) / (svgBarWidth - 2 * dragHandleRadius);
    const newScroll = newPercent * maxScroll;
    scrollRef.current.scrollLeft = newScroll;
    setScrollX(newScroll);
  }
  function handleBarDragEnd() {
    setIsDraggingHandle(false);
    document.body.style.cursor = "";
  }
  useEffect(() => {
    if (!isDraggingHandle) return;
    window.addEventListener("mousemove", handleBarDragMove);
    window.addEventListener("mouseup", handleBarDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleBarDragMove);
      window.removeEventListener("mouseup", handleBarDragEnd);
    };
  }, [isDraggingHandle, svgBarWidth, maxScroll]);

  if (!open) return null;

  return (
    <Backdrop
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <ModalContentWrap>
        {/* Scroll area: full viewport width, no margin */}
        <HorizontalScrollArea
          ref={scrollRef}
          className="mesopotamia-scrollbar hide-native-scrollbar"
          style={{
            width: scrollAreaWidth,
            maxWidth: scrollAreaWidth,
            height: height + 14,
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            boxSizing: "border-box",
            cursor: isDragging ? "grabbing" : "grab",
            background: "transparent",
            pointerEvents: "auto",
            scrollbarWidth: "none"
          }}
          tabIndex={0}
          onWheel={handleWheel}
          onScroll={onScroll}
        >
          {/* LEFT transparent buffer */}
          <BufferDiv style={{ width: bufferWidth, minWidth: bufferWidth }} />
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
              margin: 0,
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
            {/* Transparent overlay for drag-to-scroll */}
            <DragOverlay
              style={{
                pointerEvents: "auto",
                cursor: isDragging ? "grabbing" : "grab"
              }}
              onMouseDown={handleDragStart}
            />
            <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
          </ContentBlock>
          {/* RIGHT transparent buffer */}
          <BufferDiv style={{ width: bufferWidth, minWidth: bufferWidth }} />
        </HorizontalScrollArea>
        {/* Custom SVG drag bar below the content */}
        <div
          style={{
            width: svgBarWidth,
            margin: "0 auto",
            height: dragBarHeight,
            overflow: "visible",
            pointerEvents: "none",
            userSelect: "none",
            position: "relative"
          }}
        >
          <svg
            id="custom-drag-bar-svg"
            width={svgBarWidth}
            height={dragBarHeight}
            style={{
              display: "block",
              width: svgBarWidth,
              height: dragBarHeight,
              pointerEvents: "auto",
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 30,
            }}
            onMouseDown={e => {
              // Only drag if clicking on the handle
              const svgRect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - svgRect.left;
              if (
                x >= handleX - dragHandleRadius &&
                x <= handleX + dragHandleRadius
              ) {
                handleBarDragStart(e);
              }
            }}
          >
            {/* Track */}
            <rect
              x={dragHandleRadius}
              y={dragBarHeight / 2 - 3}
              width={svgBarWidth - 2 * dragHandleRadius}
              height={6}
              rx={3}
              fill={dragBarTrackColor}
            />
            {/* Bar */}
            <rect
              x={dragHandleRadius}
              y={dragBarHeight / 2 - 3}
              width={svgBarWidth - 2 * dragHandleRadius}
              height={6}
              rx={3}
              fill={dragBarColor}
              opacity={0.6}
            />
            {/* Handle */}
            <circle
              cx={handleX}
              cy={dragBarHeight / 2}
              r={dragHandleRadius}
              fill={dragBarColor}
              stroke="#d6c08e"
              strokeWidth={2}
              style={{
                cursor: "grab",
                pointerEvents: "auto",
                opacity: 1,
                filter: isDraggingHandle ? "drop-shadow(0 2px 8px #e6dbb9cc)" : "none"
              }}
              onMouseDown={handleBarDragStart}
            />
          </svg>
        </div>
      </ModalContentWrap>
      <style>{`
        .hide-native-scrollbar::-webkit-scrollbar { display: none !important; }
        .hide-native-scrollbar { scrollbar-width: none !important; }
      `}</style>
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
  margin: 0;
`;

const BufferDiv = styled.div`
  flex-shrink: 0;
  background: transparent;
  height: 100%;
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
