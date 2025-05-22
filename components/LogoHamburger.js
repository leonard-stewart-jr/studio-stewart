import { useState } from "react";

export default function LogoHamburger({
  logoSize = 66,
  onOpenSidebar,
  color = "#181818", // Default matches sidebar/nav text color
}) {
  const [hovered, setHovered] = useState(false);

  // Triangle points from SVG: (30,100), (60,30), (90,100)
  // Account for stroke width on the triangle (6px): avoid extremes.
  const triangle = [
    { x: 30, y: 96 }, // 100 - 4, nudged up for stroke
    { x: 60, y: 34 }, // 30 + 4, nudged down for stroke
    { x: 90, y: 96 }, // 100 - 4, nudged up for stroke
  ];
  const viewBoxWidth = 120;
  const viewBoxHeight = 120;
  const lineCount = 4;
  // Use a range that keeps the lines visually inside the triangle
  const minT = 0.04;
  const maxT = 0.96;
  const lines = [];
  for (let i = 0; i < lineCount; ++i) {
    const t = minT + (i / (lineCount - 1)) * (maxT - minT);
    const y = triangle[1].y + t * (triangle[0].y - triangle[1].y);
    const leftX = triangle[1].x + t * (triangle[0].x - triangle[1].x);
    const rightX = triangle[1].x + t * (triangle[2].x - triangle[1].x);
    lines.push({ x1: leftX, x2: rightX, y });
  }
  const lineThickness = 6; // matches triangle stroke

  return (
    <div
      className="logo-hamburger-wrap"
      style={{
        position: "relative",
        width: logoSize,
        height: logoSize,
        cursor: "pointer",
        zIndex: 1200,
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onOpenSidebar}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      onKeyDown={e => {
        if (onOpenSidebar && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpenSidebar();
        }
      }}
      title="Open menu"
      aria-label="Open menu"
      role="button"
    >
      {/* Logo mark (visible when not hovered or not active) */}
      <img
        src="/assets/logo-mark-only.svg"
        alt="Studio Stewart Logo"
        draggable={false}
        style={{
          width: logoSize,
          height: logoSize,
          position: "absolute",
          left: 0,
          top: 0,
          opacity: hovered ? 0 : 1,
          transition: "opacity 0.18s",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Hamburger SVG (visible only when hovered/active) */}
      <div
        className="hamburger-svg"
        style={{
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.18s",
          width: logoSize,
          height: logoSize,
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
        }}
      >
        <svg
          width={logoSize}
          height={logoSize}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {lines.map((line, i) => (
            <rect
              key={i}
              x={line.x1}
              y={line.y - lineThickness / 2}
              width={line.x2 - line.x1}
              height={lineThickness}
              fill={color}
              rx={2}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
