import React from "react";

export default function PortfolioOverlay({ project, onReveal }) {
  // Frame size
  const frameW = 736;
  const frameH = 414;

  return (
    <div style={{
      position: "relative",
      width: frameW,
      height: frameH,
      maxWidth: "100%",
      margin: "0 auto",
      userSelect: "none",
      zIndex: 1,
      overflow: "visible"
    }}>
      {/* Hero image below the frame */}
      <img
        src={project.bannerSrc}
        alt={project.title + " banner"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          border: "none",
          display: "block",
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 0,
        }}
        draggable={false}
      />
      {/* Torn paper SVG overlay */}
      <img
        src="/images/portfolio/torn-paper-frame.svg"
        alt="Torn paper overlay"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
        draggable={false}
      />
      {/* Interactive tab (right) */}
      <button
        style={{
          position: "absolute",
          left: frameW - 36,
          top: frameH / 2 - 42,
          width: 46,
          height: 84,
          background: "none",
          border: "none",
          cursor: "pointer",
          zIndex: 10,
        }}
        title="Open Modal"
        aria-label="Open project modal"
        onClick={onReveal}
        tabIndex={0}
      />
    </div>
  );
}
