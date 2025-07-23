import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const MODAL_TOTAL_HEIGHT = 720;
const LEFT_TITLE_CENTER = 201; // px from left edge of content to center title
const SCROLLBAR_HEIGHT = 14;

export default function FloatingModal({
  open,
  onClose,
  src,
  width = 2436, // content width (iframe), flexible
  height = MODAL_TOTAL_HEIGHT,
}) {
  const backdropRef = useRef(null);
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive: update isMobile
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 800);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Center 201px into content on open
  useEffect(() => {
    if (open && scrollRef.current) {
      // Modal container width
      const modalW = Math.min(
        isMobile ? window.innerWidth * 0.98 : 1200,
        window.innerWidth * 0.98
      );
      // We want 201px into content to be centered in modal
      // scrollLeft = 201 - (modalW / 2)
      const scrollTo =
        Math.max(0, LEFT_TITLE_CENTER - modalW / 2);
      scrollRef.current.scrollLeft = scrollTo;
    }
  }, [open, width, isMobile]);

  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  // Drag-to-scroll logic (for horizontal scroll)
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
  }, [isDragging]);

  // Touch drag
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
  }, [scrollRef.current]);

  // Wheel scroll (horizontal, also keep vertical locked)
  function handleWheel(e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: e.deltaY, behavior: "auto" });
        e.preventDefault();
      }
    }
  }

  if (!open) return null;

  // Modal window width (responsive)
  const modalW = Math.min(
    isMobile ? window.innerWidth * 0.98 : 1200,
    window.innerWidth * 0.98
  );

  return (
    <Backdrop
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <ModalContainer
        style={{
          width: modalW,
          height: height,
          maxWidth: "98vw",
          minWidth: isMobile ? "95vw" : 400,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <ScrollableContent
          ref={scrollRef}
          style={{
            width: "100%",
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            boxSizing: "border-box",
            position: "relative",
            cursor: isDragging ? "grabbing" : "grab",
            paddingBottom: SCROLLBAR_HEIGHT,
          }}
          className="mesopotamia-scrollbar"
          tabIndex={0}
          onWheel={handleWheel}
        >
          <iframe
            src={src}
            title="Modal Content"
            style={{
              width: width,
              minWidth: width,
              height: "100%",
              border: "none",
              background: "transparent",
              display: "block",
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
        </ScrollableContent>
        <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
      </ModalContainer>
    </Backdrop>
  );
}

// Styles
const Backdrop = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 76px;
  bottom: 0;
  z-index: 1600;
  background: rgba(32,32,32,0.13);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
`;

const ModalContainer = styled.div`
  background: #fff;
  border-radius: 0;
  box-shadow: 0 6px 42px 0 rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;
  box-sizing: border-box;
  height: ${MODAL_TOTAL_HEIGHT}px;
`;

const ScrollableContent = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  box-sizing: border-box;
  /* Custom scrollbar is handled globally via .mesopotamia-scrollbar */
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
