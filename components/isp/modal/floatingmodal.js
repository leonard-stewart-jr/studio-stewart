import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

export default function FloatingModal({
  open,
  onClose,
  src,
  width,   // From data file (e.g., 2934)
  height = 720,
}) {
  const scrollRef = useRef(null);
  const backdropRef = useRef(null);

  // Sync scroll position with custom handle
  const [scrollX, setScrollX] = useState(0);
  const [isDraggingContent, setIsDraggingContent] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  // Custom drag bar
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
  const dragBarHeight = 22;
  const dragHandleRadius = 12;
  const dragBarColor = "#e6dbb9"; // matches your scrollbar
  const dragBarTrackColor = "#f0f0ed";

  // Modal opens: scroll to left edge
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setScrollX(0);
    }
  }, [open, width]);

  // Update scrollX when content scrolls (e.g., by wheel/drag/keyboard)
  function onScroll() {
    if (scrollRef.current) {
      setScrollX(scrollRef.current.scrollLeft);
    }
  }

  // Drag-to-scroll for content
  function handleContentDragStart(e) {
    if (e.button !== 0) return;
    setIsDraggingContent(true);
    setDragStartX(e.clientX);
    setScrollStart(scrollRef.current.scrollLeft);
    document.body.style.cursor = "grabbing";
  }
  function handleContentDragMove(e) {
    if (!isDraggingContent) return;
    const delta = e.clientX - dragStartX;
    scrollRef.current.scrollLeft = scrollStart - delta;
  }
  function handleContentDragEnd() {
    setIsDraggingContent(false);
    document.body.style.cursor = "";
  }
  useEffect(() => {
    if (isDraggingContent) {
      window.addEventListener("mousemove", handleContentDragMove);
      window.addEventListener("mouseup", handleContentDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleContentDragMove);
        window.removeEventListener("mouseup", handleContentDragEnd);
      };
    }
  }, [isDraggingContent]);

  // Touch drag for content
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

  // --- Custom Drag Bar Logic ---
  // Calculate handle position
  const visibleWidth = typeof window !== "undefined"
    ? Math.min(window.innerWidth - 200, width)
    : width;
  const scrollable = width > visibleWidth + 1;
  const dragBarWidth = width;
  const maxScroll = width - visibleWidth;
  const handleX = scrollable && maxScroll > 0
    ? (scrollX / maxScroll) * (dragBarWidth - 2 * dragHandleRadius) + dragHandleRadius
    : dragHandleRadius;

  // Dragging the handle
  function handleBarDragStart(e) {
    e.preventDefault();
    setIsDraggingHandle(true);
    document.body.style.cursor = "grabbing";
  }
  function handleBarDragMove(e) {
    if (!isDraggingHandle) return;
    const svgRect = document.getElementById("custom-drag-bar-svg").getBoundingClientRect();
    let x = e.clientX - svgRect.left;
    x = Math.max(dragHandleRadius, Math.min(dragBarWidth - dragHandleRadius, x));
    // Convert handle position to scrollLeft
    const percent = (x - dragHandleRadius) / (dragBarWidth - 2 * dragHandleRadius);
    const newScroll = percent * maxScroll;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = newScroll;
      setScrollX(newScroll);
    }
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
  });

  // Hide native scrollbar with CSS
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.style.scrollbarWidth = "none";
    scrollRef.current.style.msOverflowStyle = "none";
    // For webkit
    scrollRef.current.style.overflow = "scroll";
    const style = document.createElement("style");
    style.innerHTML = `
      .mesopotamia-scrollbar::-webkit-scrollbar { display: none !important; }
    `;
    scrollRef.current.appendChild(style);
    return () => { if (scrollRef.current) scrollRef.current.removeChild(style); };
  }, []);

  if (!open) return null;

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
            width: width,
            maxWidth: width,
            height: height,
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            boxSizing: "border-box",
            cursor: isDraggingContent ? "grabbing" : "grab",
            background: "transparent",
            marginLeft: 200,
            pointerEvents: "auto",
            scrollbarWidth: "none"
          }}
          tabIndex={0}
          onWheel={handleWheel}
          onScroll={onScroll}
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
            {/* Overlay to enable drag-to-scroll */}
            <DragOverlay
              style={{
                pointerEvents: "auto",
                cursor: isDraggingContent ? "grabbing" : "grab"
              }}
              onMouseDown={handleContentDragStart}
            />
            <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
          </ContentBlock>
        </HorizontalScrollArea>
        {/* Custom SVG drag bar below the content */}
        <div
          style={{
            width: width,
            marginLeft: 200,
            height: dragBarHeight,
            overflow: "visible",
            pointerEvents: "none",
            userSelect: "none",
            position: "relative"
          }}
        >
          <svg
            id="custom-drag-bar-svg"
            width={dragBarWidth}
            height={dragBarHeight}
            style={{
              display: "block",
              width: dragBarWidth,
              height: dragBarHeight,
              pointerEvents: "auto",
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 30,
            }}
            onMouseDown={e => {
              // Allow drag handle only
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
              width={dragBarWidth - 2 * dragHandleRadius}
              height={6}
              rx={3}
              fill={dragBarTrackColor}
            />
            {/* Bar */}
            <rect
              x={dragHandleRadius}
              y={dragBarHeight / 2 - 3}
              width={dragBarWidth - 2 * dragHandleRadius}
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
                opacity: scrollable ? 1 : 0.4,
                filter: isDraggingHandle ? "drop-shadow(0 2px 8px #e6dbb9cc)" : "none"
              }}
              onMouseDown={handleBarDragStart}
            />
          </svg>
        </div>
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
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  pointer-events: auto;
  background: none;
  /* Hide native scrollbar for webkit */
  &::-webkit-scrollbar { display: none; }
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
