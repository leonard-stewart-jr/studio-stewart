import { useState } from "react";

export default function LogoHamburger({
  logoSize = 60,
  onOpenSidebar,
  color = "#181818",
  title = "Open menu"
}) {
  const [hovered, setHovered] = useState(false);

  const triangle = [
    { x: 30, y: 96 },
    { x: 60, y: 34 },
    { x: 90, y: 96 }
  ];
  const viewBoxWidth = 120;
  const viewBoxHeight = 120;

  const lineCount = 4;
  const minT = 0.10;
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
    touchAction: "manipulation"
  };

  const imgStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    opacity: hovered ? 0 : 1,
    transition: "opacity 0.18s",
    pointerEvents: "none"
  };

  const svgStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: hovered ? 1 : 0,
    transition: "opacity 0.18s",
    pointerEvents: "none"
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
      <img
        src="/assets/logo-mark-only.svg"
        alt="Studio Stewart Logo"
        style={imgStyle}
      />

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
