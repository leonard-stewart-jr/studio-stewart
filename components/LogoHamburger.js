import { useState } from "react";

/**
 * Original behavior:
 * - Shows logo by default.
 * - On hover (in the header), swaps to the triangle-with-bars "hamburger".
 * - Click triggers onOpenSidebar.
 * - No close/X state and no border around the logo when not hovered.
 */
export default function LogoHamburger({
  logoSize = 60,
  onOpenSidebar,
  color = "#181818",
  title = "Open menu",
}) {
  const [hovered, setHovered] = useState(false);

  // Triangle geometry in a 120x120 viewBox
  const triangle = [
    { x: 30, y: 96 },
    { x: 60, y: 34 },
    { x: 90, y: 96 },
  ];
  const viewBoxWidth = 120;
  const viewBoxHeight = 120;

  // Build 4 horizontal bars within the triangle
  const lineCount = 4;
  const minT = 0.10; // keep bars inside triangle edges
  const maxT = 0.90;
  const lines = [];
  for (let i = 0; i < lineCount; ++i) {
    const t = minT + (i / (lineCount - 1)) * (maxT - minT);
    const y = triangle[1].y + t * (triangle[0].y - triangle[1].y);
    const leftX = triangle[1].x + t * (triangle[0].x - triangle[1].x);
    const rightX = triangle[1].x + t * (triangle[2].x - triangle[1].x);
    lines.push({ x1: leftX, x2: rightX, y });
  }
  const stroke = 6;

  const wrapStyle = {
    width: `${logoSize}px`,
    height: `${logoSize}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
    userSelect: "none",
    touchAction: "manipulation",
  };

  const imgStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    opacity: hovered ? 0 : 1, // hide logo only while hovering
    transition: "opacity 0.18s",
    pointerEvents: "none",
  };

  const svgStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: hovered ? 1 : 0, // show hamburger only while hovering
    transition: "opacity 0.18s",
    pointerEvents: "none",
  };

  return (
    <div
      style={wrapStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenSidebar && onOpenSidebar()}
      tabIndex={0}
      onKeyDown={(e) => {
        if (onOpenSidebar && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpenSidebar();
        }
      }}
      title={title}
      aria-label={title}
      role="button"
    >
      {/* Logo mark (visible when not hovered) */}
      <img
        src="/assets/logo-mark-only.svg"
        alt="Studio Stewart Logo"
        style={imgStyle}
      />

      {/* Triangle + hamburger (visible only on hover) */}
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={svgStyle}
      >
        <polygon
          points={`${triangle[0].x},${triangle[0].y} ${triangle[1].x},${triangle[1].y} ${triangle[2].x},${triangle[2].y}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y}
            x2={line.x2}
            y2={line.y}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}