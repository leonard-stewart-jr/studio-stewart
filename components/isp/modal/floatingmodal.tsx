'use client';

import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const leftArrowSVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
  <polyline points="16,4 4,12 16,20" fill="none" stroke="#e6dbb9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`);
const rightArrowSVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
  <polyline points="8,4 20,12 8,20" fill="none" stroke="#e6dbb9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`);
const handSVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="none"/>
  <path d="M64,216,34.68,166a20,20,0,0,1,34.64-20L88,176V68a20,20,0,0,1,40,0v56a20,20,0,0,1,40,0v16a20,20,0,0,1,40,0v36c0,24-8,40-8,40"
    fill="none"
    stroke="#e6dbb9"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="16"
  />
  <line x1="176" y1="56" x2="248" y2="56"
    fill="none"
    stroke="#e6dbb9"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="16"
  />
  <polyline points="208 24 176 56 208 88"
    fill="none"
    stroke="#e6dbb9"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="16"
  />
</svg>
`);

const leftArrowCursor = `url("data:image/svg+xml,${leftArrowSVG}") 2 9, pointer`;
const rightArrowCursor = `url("data:image/svg+xml,${rightArrowSVG}") 16 9, pointer`;
const handCursor = `url("data:image/svg+xml,${handSVG}") 9 9, pointer`;

interface FloatingModalProps {
    open: boolean;
    onClose: () => void;
    src: string;
    width: number;
    height?: number;
    children?: React.ReactNode;
}

export default function FloatingModal({
    open,
    onClose,
    src,
    width,
    height = 720,
    children,
}: FloatingModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const bufferWidth = 200;
    const visibleWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const scrollAreaWidth = visibleWidth;

    const [scrollX, setScrollX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [scrollStart, setScrollStart] = useState(0);
    const [cursorType, setCursorType] = useState<"hand" | "left" | "right">("hand");

    useEffect(() => {
        if (open && scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
            setScrollX(0);
        }
    }, [open, width]);

    function onScroll() {
        if (scrollRef.current) {
            setScrollX(scrollRef.current.scrollLeft);
        }
    }

    function handleDragStart(e: React.MouseEvent) {
        if (e.button !== 0 || !scrollRef.current) return;
        setIsDragging(true);
        setDragStartX(e.clientX);
        setScrollStart(scrollRef.current.scrollLeft);
        document.body.style.cursor = "grabbing";
    }

    function handleDragMove(e: MouseEvent) {
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
    }, [isDragging, dragStartX, scrollStart]);

    useEffect(() => {
        let startX = 0, startScroll = 0, dragging = false;
        function onTouchStart(e: TouchEvent) {
            if (!scrollRef.current || e.touches.length !== 1) return;
            dragging = true;
            startX = e.touches[0].clientX;
            startScroll = scrollRef.current.scrollLeft;
        }
        function onTouchMove(e: TouchEvent) {
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
    }, [width]);

    function handleWheel(e: React.WheelEvent) {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: e.deltaY, behavior: "auto" });
        e.preventDefault();
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
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

    function handleBackdropClick(e: React.MouseEvent) {
        if (e.target === backdropRef.current) onClose();
    }

    function handleMouseMove(e: React.MouseEvent) {
        if (isDragging) return;
        const vw = window.innerWidth;
        const x = e.clientX;
        if (x < vw / 3) setCursorType("left");
        else if (x > (2 * vw) / 3) setCursorType("right");
        else setCursorType("hand");
    }

    function handleMouseLeave() {
        if (isDragging) return;
        setCursorType("hand");
    }

    function handleOverlayDoubleClick(e: React.MouseEvent) {
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

    let overlayCursor = "grab";
    if (isDragging) {
        overlayCursor = "grabbing";
    } else if (cursorType === "left") {
        overlayCursor = leftArrowCursor;
    } else if (cursorType === "right") {
        overlayCursor = rightArrowCursor;
    } else {
        overlayCursor = handCursor;
    }

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
                    className="mesopotamia-scrollbar hide-native-scrollbar"
                    style={{
                        width: scrollAreaWidth,
                        maxWidth: scrollAreaWidth,
                        height: height + 14,
                        overflowX: "auto",
                        overflowY: "hidden",
                        position: "relative",
                        boxSizing: "border-box",
                        background: "transparent",
                        pointerEvents: "auto",
                        scrollbarWidth: "none"
                    } as React.CSSProperties}
                    tabIndex={0}
                    onWheel={handleWheel}
                    onScroll={onScroll}
                >
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
                            overflow: "visible",
                        } as React.CSSProperties}
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
                            // @ts-ignore
                            draggable={false}
                        />
                        {children}
                        <DragOverlay
                            style={{
                                pointerEvents: "auto",
                                cursor: overlayCursor
                            } as React.CSSProperties}
                            onMouseDown={handleDragStart}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onDoubleClick={handleOverlayDoubleClick}
                        />
                        <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
                    </ContentBlock>
                    <BufferDiv style={{ width: bufferWidth, minWidth: bufferWidth }} />
                </HorizontalScrollArea>
                <style>{`
          .hide-native-scrollbar::-webkit-scrollbar { display: none !important; }
          .hide-native-scrollbar { scrollbar-width: none !important; }
        `}</style>
            </ModalContentWrap>
        </Backdrop>
    );
}

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
  overflow: visible;
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
  pointer-events: auto;
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
