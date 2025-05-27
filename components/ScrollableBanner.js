import React, { useRef, useState, useEffect } from "react";

export default function ScrollableBanner({ src, alt = "", height = 600 }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  // Zoom in/out with Ctrl/Cmd + scroll or pinch
  useEffect(() => {
    const onWheel = e => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(prev =>
          Math.max(1, Math.min(5, prev + (e.deltaY < 0 ? 0.1 : -0.1)))
        );
      }
    };
    const node = containerRef.current;
    if (node) node.addEventListener("wheel", onWheel, { passive: false });
    return () => node && node.removeEventListener("wheel", onWheel);
  }, []);

  // Double-click to toggle zoom
  const handleDoubleClick = () => {
    setZoom(zoom === 1 ? 2 : 1);
  };

  // Keyboard left/right arrow scroll
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

  // Allow horizontal scroll by drag (mouse)
  let isDragging = false, startX = 0, scrollLeft = 0;
  const onMouseDown = e => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.pageX - containerRef.current.offsetLeft;
    scrollLeft = containerRef.current.scrollLeft;
    document.body.style.cursor = "grabbing";
  };
  const onMouseMove = e => {
    if (!isDragging) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    containerRef.current.scrollLeft = scrollLeft - (x - startX);
  };
  const onMouseUp = () => {
    isDragging = false;
    document.body.style.cursor = "";
  };
  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line
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
        cursor: "grab"
      }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={onMouseDown}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          height: height * zoom,
          width: "auto",
          transition: "height 0.2s, transform 0.15s",
          userSelect: "none",
          pointerEvents: "none",
          display: "block"
        }}
        draggable={false}
      />
      {/* Optional: show zoom level */}
      <div style={{
        position: "absolute", right: 12, top: 12, color: "#fff",
        background: "rgba(0,0,0,0.5)", borderRadius: 4, fontSize: 14, padding: "2px 8px"
      }}>
        {zoom.toFixed(1)}x
      </div>
    </div>
  );
}
