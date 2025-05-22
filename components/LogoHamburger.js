import { useState } from "react";

export default function LogoHamburger({
  logoSize = 66,
  sidebarPaddingLeft = 22,
  onOpenSidebar,
}) {
  const [hovered, setHovered] = useState(false);

  // Hamburger SVG logic (unchanged)
  const triangle = [
    { x: 30, y: 100 },
    { x: 60, y: 30 },
    { x: 90, y: 100 },
  ];
  const viewBoxWidth = 120;
  const viewBoxHeight = 120;
  const lineCount = 4;
  const lines = [];
  for (let i = 0; i < lineCount; ++i) {
    const t = i / (lineCount - 1);
    const y = triangle[1].y + t * (triangle[0].y - triangle[1].y);
    const leftX = triangle[1].x + t * (triangle[0].x - triangle[1].x);
    const rightX = triangle[1].x + t * (triangle[2].x - triangle[1].x);
    lines.push({ x1: leftX, x2: rightX, y });
  }
  const lineThickness = Math.max(1, (triangle[0].y - triangle[1].y) * 0.09);

  return (
    <div
      className="logo-hamburger-wrap"
      style={{
        position: "relative",
        left: sidebarPaddingLeft,
        width: logoSize,
        height: logoSize,
        cursor: "pointer",
        zIndex: 1200,
        userSelect: "none",
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
              fill="#111"
              rx={0}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
