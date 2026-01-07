import { useState } from "react";

/**
 * LogoHamburger
 * - Always shows the logo by default.
 * - hoverMode="hamburger" (header): on hover, shows triangle-with-bars.
 * - hoverMode="x" (sidebar): on hover, shows an "X".
 * - Click triggers onClick/onOpenSidebar (either prop is supported).
 */
export default function LogoHamburger({
  size = 60,
  hoverMode = "hamburger", // "hamburger" (header) | "x" (sidebar)
  color = "#181818",
  title = "Open menu",
  onClick,
  onOpenSidebar, // kept for compatibility with existing calls
}) {
  const [hovered, setHovered] = useState(false);

  // Single activation helper (accept legacy onOpenSidebar too)
  function activate() {
    if (typeof onClick === "function") return onClick();
    if (typeof onOpenSidebar === "function") return onOpenSidebar();
  }

  // Triangle frame in a 120x120 viewBox (keeps brand shape)
  const triangle = [
    { x: 30, y: 96 },
    { x: 60, y: 34 },
    { x: 90, y: 96 },
  ];
  const vbW = 120;
  const vbH = 120;
  const stroke = 6;

  // Hamburger bars inside the triangle
  const lineCount = 4;
  const minT = 0.08;
  const maxT = 0.92;
  const lines = [];
  for (let i = 0; i < lineCount; ++i) {
    const t = minT + (i / (lineCount - 1)) * (maxT - minT);
    const y = triangle[1].y + t * (triangle[0].y - triangle[1].y);
    const leftX = triangle[1].x + t * (triangle[0].x - triangle[1].x);
    const rightX = triangle[1].x + t * (triangle[2].x - triangle[1].x);
    lines.push({ x1: leftX, x2: rightX, y });
  }

  // "X" drawn inside the same triangle bounds
  // Use a simple inset box to ensure the X sits well within the triangle
  const inset = 36;
  const x1 = { x1: inset, y1: 92, x2: 120 - inset, y2: 36 };
  const x2 = { x1: 120 - inset, y1: 92, x2: inset, y2: 36 };

  // Layer visibility
  const showLogo = !hovered;
  const showHamburger = hovered && hoverMode === "hamburger";
  const showX = hovered && hoverMode === "x";

  const wrapStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
    userSelect: "none",
    touchAction: "manipulation",
  };

  const layerBase = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    transition: "opacity 0.18s",
    pointerEvents: "none",
  };

  return (
    <div
      className="logo-hamburger-wrap"
      style={wrapStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={activate}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      role="button"
      title={title}
      aria-label={title}
    >
      {/* Logo (default) */}
      <img
        src="/assets/logo-mark-only.svg"
        alt="Studio Stewart Logo"
        style={{ ...layerBase, opacity: showLogo ? 1 : 0, objectFit: "contain" }}
      />

      {/* Triangle + hamburger (header hover) */}
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={{ ...layerBase, opacity: showHamburger ? 1 : 0 }}
      >
        <polygon
          points={`${triangle[0].x},${triangle[0].y} ${triangle[1].x},${triangle[1].y} ${triangle[2].x},${triangle[2].y}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
        {lines.map((ln, i) => (
          <line
            key={i}
            x1={ln.x1}
            y1={ln.y}
            x2={ln.x2}
            y2={ln.y}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Triangle + X (sidebar hover) */}
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={{ ...layerBase, opacity: showX ? 1 : 0 }}
      >
        <polygon
          points={`${triangle[0].x},${triangle[0].y} ${triangle[1].x},${triangle[1].y} ${triangle[2].x},${triangle[2].y}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
        <line
          x1={x1.x1}
          y1={x1.y1}
          x2={x1.x2}
          y2={x1.y2}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <line
          x1={x2.x1}
          y1={x2.y1}
          x2={x2.x2}
          y2={x2.y2}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}