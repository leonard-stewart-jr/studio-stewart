import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

// SVGs as React components
function ArrowLeftIcon(props) {
  return (
    <svg {...props} width="34" height="34" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"/>
      <line x1="216" y1="128" x2="40" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <polyline points="112 56 40 128 112 200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  );
}
function ArrowRightIcon(props) {
  return (
    <svg {...props} width="34" height="34" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"/>
      <line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  );
}
function DragIcon(props) {
  return (
    <svg {...props} width="34" height="34" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"/>
      <path d="M128,92a20,20,0,0,0-40,0v28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <path d="M168,108V92a20,20,0,0,0-40,0v28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <path d="M88,152V120H68a20,20,0,0,0-20,20v12a80,80,0,0,0,160,0V108a20,20,0,0,0-40,0v12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  );
}

export default function FloatingModal({
  open,
  onClose,
  src,
  width,
  height = 720,
}) {
  const backdropRef = useRef(null);
  const scrollRef = useRef(null);

  const bufferWidth = 200;
  const visibleWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const scrollAreaWidth = visibleWidth;

  const [scrollX, setScrollX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [hoverSide, setHoverSide] = useState(null); // "left", "right", or null

  // For overlay pointer-events toggling
  const [overlayPointerEvents, setOverlayPointerEvents] = useState("none");

  // Ensure scroll starts at 0 on open
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setScrollX(0);
    }
  }, [open, width]);

  function onScroll() {
    if (scrollRef.current) setScrollX(scrollRef.current.scrollLeft);
  }

  // Drag-to-scroll logic for content
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

  // Touch drag for mobile (unchanged)
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
    function onTouchEnd() { dragging = false; }
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

  // Wheel scroll (horizontal only)
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
        scrollRef.current.scrollBy({ left: -1000, behavior: "smooth" });
      } else if (e.key === "ArrowRight") {
        scrollRef.current.scrollBy({ left: 1000, behavior: "smooth" });
      }
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, width, onClose]);

  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  // Hide native scrollbar
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.style.scrollbarWidth = "none";
    scrollRef.current.style.msOverflowStyle = "none";
    scrollRef.current.classList.add("hide-native-scrollbar");
    return () => {
      if (scrollRef.current) scrollRef.current.classList.remove("hide-native-scrollbar");
    };
  }, []);

  // Arrow logic by vertical thirds
  function handleMouseMove(e) {
    // 1. Detect for overlay pointer-events (using elementFromPoint)
    const overlay = e.currentTarget;
    // Get the iframe's bounding rect to adjust coordinates if needed
    const iframe = overlay.parentNode.querySelector("iframe");
    let isText = false;
    if (iframe) {
      // Get mouse position relative to viewport
      const clientX = e.clientX;
      const clientY = e.clientY;
      // Get the element under the cursor inside the iframe
      try {
        const iframeRect = iframe.getBoundingClientRect();
        const x = clientX - iframeRect.left;
        const y = clientY - iframeRect.top;
        if (x >= 0 && y >= 0 && x <= iframeRect.width && y <= iframeRect.height) {
          const contentDoc = iframe.contentDocument || iframe.contentWindow.document;
          const el = contentDoc.elementFromPoint(x, y);
          if (el && (el.nodeName === "SPAN" || el.nodeName === "P" || el.nodeName === "DIV")) {
            // Heuristic: check if the text is not empty and not just an image wrapper
            if (el.textContent && el.textContent.trim().length > 0) isText = true;
          }
        }
      } catch (err) {
        // cross-origin: just ignore, fallback to always allow drag
      }
    }
    setOverlayPointerEvents(isText ? "none" : "auto");

    // 2. Arrow logic
    const vw = window.innerWidth;
    const x = e.clientX;
    if (x < vw / 3) setHoverSide("left");
    else if (x > (2 * vw) / 3) setHoverSide("right");
    else setHoverSide(null);
  }
  function handleMouseLeave() {
    setHoverSide(null);
    setOverlayPointerEvents("none");
  }

  // Double-click-to-shift logic (1kpx left/right)
  function handleOverlayDoubleClick(e) {
    if (isDragging) return;
    if (!scrollRef.current) return;
    const vw = window.innerWidth;
    const x = e.clientX;
    const amount = 1000;
    if (x < vw / 3) {
      scrollRef.current.scrollBy({ left: -amount, behavior: "smooth" });
    } else if (x > (2 * vw) / 3) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  }

  if (!open) return null;

  // Choose which icon to show
  let OverlayIcon = null;
  if (hoverSide === "left" && !isDragging) {
    OverlayIcon = <ArrowLeftIcon style={{
      position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
      color: "#e6dbb9", opacity: 0.92, filter: "drop-shadow(0 1px 7px #e6dbb9cc)", pointerEvents: "none"
    }}/>;
  } else if (hoverSide === "right" && !isDragging) {
    OverlayIcon = <ArrowRightIcon style={{
      position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
      color: "#e6dbb9", opacity: 0.92, filter: "drop-shadow(0 1px 7px #e6dbb9cc)", pointerEvents: "none"
    }}/>;
  } else if (!isDragging && hoverSide === null) {
    OverlayIcon = <DragIcon style={{
      position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
      color: "#e6dbb9", opacity: 0.85, filter: "drop-shadow(0 1px 7px #e6dbb9cc)", pointerEvents: "none"
    }}/>;
  }

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
          className="mesopotamia-scrollbar hide-native-scrollbar"
          style={{
            width: scrollAreaWidth,
            maxWidth: scrollAreaWidth,
            height: height + 14,
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            boxSizing: "border-box",
            cursor: isDragging
              ? "grabbing"
              : hoverSide === "left"
              ? "w-resize"
              : hoverSide === "right"
              ? "e-resize"
              : "grab",
            background: "transparent",
            pointerEvents: "auto",
            scrollbarWidth: "none"
          }}
          tabIndex={0}
          onWheel={handleWheel}
          onScroll={onScroll}
        >
          {/* LEFT buffer */}
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
            {/* Drag overlay */}
            <DragOverlay
              style={{
                pointerEvents: overlayPointerEvents,
                cursor: isDragging
                  ? "grabbing"
                  : hoverSide === "left"
                  ? "w-resize"
                  : hoverSide === "right"
                  ? "e-resize"
                  : "grab"
              }}
              onMouseDown={overlayPointerEvents === "auto" ? handleDragStart : undefined}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onDoubleClick={handleOverlayDoubleClick}
            >
              {OverlayIcon}
            </DragOverlay>
            <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
          </ContentBlock>
          {/* RIGHT buffer */}
          <BufferDiv style={{ width: bufferWidth, minWidth: bufferWidth }} />
        </HorizontalScrollArea>
        {/* Hide native scrollbar for all browsers */}
        <style>{`
          .hide-native-scrollbar::-webkit-scrollbar { display: none !important; }
          .hide-native-scrollbar { scrollbar-width: none !important; }
        `}</style>
      </ModalContentWrap>
    </Backdrop>
  );
}

// Styled components (unchanged)
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
  user-select: none;
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
