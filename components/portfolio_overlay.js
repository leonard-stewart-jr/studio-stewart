import React, { useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const TORN_MASK_SVG = (tabX = 690, tabWidth = 46, frameW = 736, frameH = 414) => (
  // The SVG mask is a rectangle with torn edges and a "tab" on the right.
  <svg
    width={frameW}
    height={frameH}
    viewBox={`0 0 ${frameW} ${frameH}`}
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      userSelect: "none",
      zIndex: 1,
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="tornMask">
        {/* Top torn edge */}
        <path d={`
          M0,18 Q18,2 60,12 Q120,2 200,18 Q320,6 420,20 Q540,0 660,18 Q${tabX},12 ${tabX},24
          Q${tabX},32 ${tabX},36
          Q${tabX},40 ${tabX + tabWidth},36
          Q${tabX + tabWidth},80 ${tabX},90
          Q${tabX + tabWidth},130 ${tabX},140
          Q${tabX + tabWidth},190 ${tabX},200
          Q${tabX + tabWidth},300 ${tabX},314
          Q${tabX + tabWidth},${frameH-45} ${tabX},${frameH-24}
          Q${tabX},${frameH-16} ${tabX},${frameH-12}
          Q660,${frameH-8} 540,${frameH-18} Q420,${frameH-4} 320,${frameH-18} Q200,${frameH-6} 120,${frameH-18} Q60,${frameH-2} 18,${frameH-16} Q0,${frameH-8} 0,${frameH-18}
          Z
        `}
        />
      </clipPath>
      <filter id="paperShadow" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#d6c08e" floodOpacity="0.17"/>
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#222" floodOpacity="0.13"/>
      </filter>
    </defs>
    {/* Optional: white torn paper frame */}
    <path
      d={`
        M0,18 Q18,2 60,12 Q120,2 200,18 Q320,6 420,20 Q540,0 660,18 Q${tabX},12 ${tabX},24
        Q${tabX},32 ${tabX},36
        Q${tabX},40 ${tabX + tabWidth},36
        Q${tabX + tabWidth},80 ${tabX},90
        Q${tabX + tabWidth},130 ${tabX},140
        Q${tabX + tabWidth},190 ${tabX},200
        Q${tabX + tabWidth},300 ${tabX},314
        Q${tabX + tabWidth},${frameH-45} ${tabX},${frameH-24}
        Q${tabX},${frameH-16} ${tabX},${frameH-12}
        Q660,${frameH-8} 540,${frameH-18} Q420,${frameH-4} 320,${frameH-18} Q200,${frameH-6} 120,${frameH-18} Q60,${frameH-2} 18,${frameH-16} Q0,${frameH-8} 0,${frameH-18}
        Z
      `}
      fill="#fff"
      filter="url(#paperShadow)"
    />
    {/* The interactive tab (right side) */}
    <rect
      x={tabX + tabWidth - 4}
      y={36}
      width={tabWidth}
      height={frameH - 72}
      rx={13}
      fill="#b32c2c"
      filter="url(#paperShadow)"
      style={{
        stroke: "#fff",
        strokeWidth: 4,
      }}
    />
  </svg>
);

export default function PortfolioOverlay({
  project,
  showCaptionOnce,
  onReveal,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [tabHover, setTabHover] = useState(false);
  const controls = useAnimation();

  const frameW = 736; // Max width for hero frame
  const frameH = 414; // 16:9 ratio
  const tabX = 690;
  const tabWidth = 46;

  // Drag logic
  const dragRef = useRef();

  function handleTabMouseDown(e) {
    setIsDragging(true);
    setDragX(0);
    dragRef.current = { startX: e.clientX };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }
  function handleMouseMove(e) {
    if (!isDragging || !dragRef.current) return;
    const delta = Math.max(0, e.clientX - dragRef.current.startX);
    setDragX(delta);
    controls.set({ x: delta });
    if (delta >= 100) {
      // Auto-complete animation
      controls.start({
        x: frameW,
        transition: { type: "spring", stiffness: 140, damping: 16, duration: 0.5 },
      });
      setTimeout(() => {
        setIsDragging(false);
        setDragX(0);
        controls.set({ x: 0 });
        onReveal?.();
      }, 420);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  }
  function handleMouseUp(e) {
    if (!isDragging) return;
    if (dragX < 100) {
      // Snap back
      controls.start({ x: 0, transition: { type: "spring", stiffness: 160, damping: 20, duration: 0.38 } });
    }
    setIsDragging(false);
    setDragX(0);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }

  // Double-click to open modal (anywhere inside frame)
  function handleDoubleClick(e) {
    controls.start({
      x: frameW,
      transition: { type: "spring", stiffness: 140, damping: 16, duration: 0.5 },
    });
    setTimeout(() => {
      controls.set({ x: 0 });
      onReveal?.();
    }, 420);
  }

  // Tab hover animation
  function handleTabMouseEnter() {
    setTabHover(true);
    controls.start({
      scale: 1.13,
      x: tabWidth * 0.6,
      boxShadow: "0 0 32px #b32c2c33",
      transition: { type: "spring", stiffness: 240, damping: 18, duration: 0.36 },
    });
  }
  function handleTabMouseLeave() {
    setTabHover(false);
    controls.start({
      scale: 1,
      x: 0,
      boxShadow: "0 0 0px #b32c2c00",
      transition: { type: "spring", stiffness: 240, damping: 18, duration: 0.32 },
    });
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        maxWidth: frameW,
        minHeight: 220,
        margin: "0 auto",
        userSelect: isDragging ? "none" : "auto",
        cursor: isDragging ? "grabbing" : "default",
        zIndex: 10,
        background: "transparent",
        overflow: "visible",
      }}
      tabIndex={0}
      aria-label={`Portfolio image for ${project.title}`}
      onDoubleClick={handleDoubleClick}
    >
      {/* Torn mask and frame */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {TORN_MASK_SVG(tabX, tabWidth, frameW, frameH)}
      </div>
      {/* Clipped image */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          overflow: "hidden",
          clipPath: "url(#tornMask)",
          WebkitClipPath: "url(#tornMask)",
        }}
      >
        <img
          src={project.bannerSrc}
          alt={project.title + " banner"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            filter: "none",
            border: "none",
            pointerEvents: "auto",
            userSelect: "none",
            transition: "filter 0.13s",
          }}
          draggable={false}
        />
      </div>
      {/* Interactive tab (right edge) */}
      <motion.div
        style={{
          position: "absolute",
          top: 36,
          left: tabX + tabWidth - 4,
          width: tabWidth,
          height: frameH - 72,
          background: "#b32c2c",
          borderRadius: 13,
          boxShadow: tabHover ? "0 0 32px #b32c2c33" : "0 2px 8px #b32c2c22",
          border: "4px solid #fff",
          cursor: isDragging ? "grabbing" : "pointer",
          zIndex: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "box-shadow 0.13s",
          willChange: "transform",
        }}
        initial={{ scale: 1, x: 0, boxShadow: "0 0 0px #b32c2c00" }}
        animate={controls}
        whileHover={{ scale: 1.13, x: tabWidth * 0.6, boxShadow: "0 0 32px #b32c2c33" }}
        onMouseDown={handleTabMouseDown}
        onMouseEnter={handleTabMouseEnter}
        onMouseLeave={handleTabMouseLeave}
        tabIndex={0}
        aria-label="Reveal project modal"
        role="button"
      >
        {/* Optional: add icon or text */}
        <span
          style={{
            fontWeight: 700,
            fontSize: 22,
            color: "#fff",
            letterSpacing: ".09em",
            writingMode: "vertical-rl",
            textTransform: "uppercase",
            transform: "translateY(-6px)",
            opacity: 0.92,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {/* You can add a chevron or "View" label here */}
        </span>
      </motion.div>
    </div>
  );
}
