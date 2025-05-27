import React, { useRef, useState, useEffect } from "react";

export default function ScrollableBanner({ src, alt = "", height = 600 }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  // Handle zoom with ctrl/cmd+scroll or pinch
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onWheel = e => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(prev =>
          Math.max(1, Math.min(5, prev + (e.deltaY < 0 ? 0.1 : -0.1)))
        );
      }
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  // Allow double-click to toggle 2x/1x zoom
  const handleDoubleClick = () => setZoom(zoom === 1 ? 2 : 1);

  // Keyboard left/right scroll (when banner in focus)
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onKeyDown = e => {
      if (e.key === "ArrowLeft") {
        node.scrollBy({ left: -100, behavior: "smooth" });
      } else if (e.key === "ArrowRight") {
        node.scrollBy({ left: 100, behavior: "smooth" });
      }
    };
    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, []);

  // Click-and-drag to scroll horizontally
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let isDown = false;
    let startX, scrollLeft;
    const onMouseDown = e => {
      if (e.button !== 0) return;
      isDown = true;
      startX = e.pageX - node.offsetLeft;
      scrollLeft = node.scrollLeft;
      document.body.style.cursor = "grabbing";
    };
    const onMouseMove = e => {
      if (!isDown) return;
      const x = e.pageX - node.offsetLeft;
      node.scrollLeft = scrollLeft - (x - startX);
    };
    const onMouseUp = () => {
      isDown = false;
      document.body.style.cursor = "";
    };
    node.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      node.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{
        height,
        width: "100%",
        maxWidth: "calc(100vw - 120px)",
        overflowX: "auto",
        overflowY: "hidden",
        outline: "none",
        background: "#222",
        borderRadius: 6,
        position: "relative",
        cursor: "grab",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={src}
        alt={alt}
        style={{
          height: height * zoom,
          width: "auto",
          transition: "height 0.25s, transform 0.15s",
          userSelect: "none",
          pointerEvents: "none",
          display: "block"
        }}
        draggable={false}
      />
      <div style={{
        position: "absolute",
        right: 12,
        top: 12,
        color: "#fff",
        background: "rgba(0,0,0,0.5)",
        borderRadius: 4,
        fontSize: 14,
        padding: "2px 8px",
        zIndex: 2,
        pointerEvents: "none"
      }}>
        {zoom.toFixed(1)}x
      </div>
    </div>
  );
}
