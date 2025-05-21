import { useState } from "react";

export default function LogoHamburger({
  logoSize = 66,
  sidebarPaddingLeft = 22,
  onOpenSidebar,
}) {
  const [hovered, setHovered] = useState(false);

  // For a triangle with points at (center,0), (0,height), (width,height)
  const width = logoSize;
  const height = logoSize;
  const lineCount = 4;

  // Triangle vertices (pointing up)
  const Ax = width / 2, Ay = 0;
  const Bx = 0, By = height;
  const Cx = width, Cy = height;

  // For each line, interpolate its Y position and compute X start/end to hug triangle sides
  const lines = [];
  for (let i = 0; i < lineCount; ++i) {
    // Evenly spaced Y positions from top (Ay) to bottom (By)
    const t = i / (lineCount - 1);
    const y = Ay + t * (By - Ay);

    // Left edge: interpolate from A (top) to B (bottom)
    // Right edge: interpolate from A (top) to C (bottom)
    const x1 = Ax + (Bx - Ax) * t;
    const x2 = Ax + (Cx - Ax) * t;

    lines.push({ x1, x2, y });
  }

  const lineThickness = Math.max(1, height * 0.09);

  return (
    <div
      style={{
        position: "absolute",
        left: sidebarPaddingLeft,
        top: "50%",
        transform: "translateY(-50%)",
        width: width,
        height: height,
        cursor: "pointer",
        zIndex: 1200,
        userSelect: "none",
      }}
      onClick={onOpenSidebar}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") onOpenSidebar();
      }}
      title="Open menu"
      aria-label="Open menu"
    >
      {/* Logo SVG (fades out on hover/focus) */}
      <img
        src="/assets/logo-mark-only.svg"
        alt="Logo"
        style={{
          width: width,
          height: height,
          objectFit: "contain",
          opacity: hovered ? 0 : 1,
          transition: "opacity 0.18s",
          pointerEvents: "none",
          position: "absolute",
          left: 0,
          top: 0,
        }}
        draggable={false}
      />
      {/* Hamburger icon (fills triangle shape, sharp lines) */}
      <div
        style={{
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.18s",
          width,
          height,
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
        }}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Optional: show triangle outline for debugging 
          <polygon
            points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`}
            fill="none"
            stroke="#eee"
            strokeWidth="1"
          /> */}
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
