import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

// Always use the provided flexible width for content, but the modal itself is full viewport
const MODAL_TOTAL_HEIGHT = 720;
const SCROLLBAR_HEIGHT = 14;
const CENTER_OFFSET = 201; // px from left edge to center title block

export default function FloatingModal({
  open,
  onClose,
  src,
  width = 2436, // content width, flexible
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

  // Calculate the scroll bounds:
  // - minScroll: left edge CENTER_OFFSET px from left of content is at the center of the viewport
  // - maxScroll: right edge CENTER_OFFSET px from right of content is at the center of the viewport
  function getMinScroll(contentWidth, viewportWidth) {
    return Math.max(0, CENTER_OFFSET - viewportWidth / 2);
  }
  function getMaxScroll(contentWidth, viewportWidth) {
    // Clamp so we never scroll past right edge centered
    return Math.max(0, contentWidth - CENTER_OFFSET - viewportWidth / 2);
  }

  // On open, scroll so CENTER_OFFSET from left is centered
  useEffect(() => {
    if (open && scrollRef.current) {
      const viewportW = window.innerWidth;
      const minScroll = getMinScroll(width, viewportW);
      scrollRef.current.scrollLeft = minScroll;
    }
    // eslint-disable-next-line
  }, [open, width, isMobile]);

  // Clamp scroll position on user scroll
  function clampScroll() {
    if (!scrollRef.current) return;
    const viewportW = window.innerWidth;
    const minScroll = getMinScroll(width, viewportW);
    const maxScroll = getMaxScroll(width, viewportW);
    const scrollLeft = scrollRef.current.scrollLeft;
    if (scrollLeft < minScroll) {
      scrollRef.current.scrollLeft = minScroll;
    }
    if (scrollLeft > maxScroll) {
      scrollRef.current.scrollLeft = maxScroll;
    }
  }

  // Drag-to-scroll
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
    if (!scrollRef.current) return;
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
    // eslint-disable-next-line
  }, [isDragging]);

  // Touch drag for mobile
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
    // eslint-disable-next-line
  }, [scrollRef.current, width]);

  // Wheel scroll: horizontal only, clamp
  function handleWheel(e) {
    if (!scrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollRef.current.scrollBy({ left: e.deltaY, behavior: "auto" });
    }
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
    // eslint-disable-next-line
  }, [open, width, onClose]);

  // Backdrop click closes
  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

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
          width: "100vw",
          height: height,
          minWidth: "100vw",
          maxWidth: "100vw",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <ScrollableArea
          ref={scrollRef}
          className="mesopotamia-scrollbar"
          style={{
            width: "100vw",
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            boxSizing: "border-box",
            cursor: isDragging ? "grabbing" : "grab",
            paddingBottom: SCROLLBAR_HEIGHT,
          }}
          tabIndex={0}
          onWheel={handleWheel}
          onScroll={clampScroll}
        >
          <Content
            style={{
              width: width,
              minWidth: width,
              height: "100%",
              position: "relative",
            }}
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
          </Content>
        </ScrollableArea>
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
  overflow: visible;
  box-sizing: border-box;
  height: ${MODAL_TOTAL_HEIGHT}px;
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
`;

const ScrollableArea = styled.div`
  width: 100vw;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  box-sizing: border-box;
`;

const Content = styled.div`
  width: ${props => props.width || 2436}px;
  min-width: ${props => props.width || 2436}px;
  height: 100%;
  position: relative;
  box-sizing: border-box;
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
