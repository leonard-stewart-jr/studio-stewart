import { useState } from "react";

export default function LogoHamburger({
  logoSize = 66,
  sidebarPaddingLeft = 22,
  onOpenSidebar,
}) {
  const [hovered, setHovered] = useState(false);

  // Hamburger fills all available space
  const hamburgerSize = logoSize;
  const lineCount = 4;

  // Each line increases in width to form a triangle
  const minWidth = 0.3; // as a fraction of total width (change as you like)
  const maxWidth = 1.0; // full width
  // Calculate widths for each line from minWidth to maxWidth
  const widths = Array.from({ length: lineCount }, (_, i) =>
    minWidth + ((maxWidth - minWidth) * i) / (lineCount - 1)
  );

  // Space lines evenly from top to bottom
  const lineSpacing = hamburgerSize / (lineCount + 1);
  const lineHeight = hamburgerSize * 0.09; // thickness of lines

  return (
    <div
      style={{
        position: "absolute",
        left: sidebarPaddingLeft,
        top: "50%",
        transform: "translateY(-50%)",
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
          width: logoSize,
          height: logoSize,
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
      {/* Hamburger icon (fades in and fills triangle area) */}
      <div
        style={{
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.18s",
          width: hamburgerSize,
          height: hamburgerSize,
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none", // let pointer events go to parent for hover/click
        }}
      >
        <svg
          width={hamburgerSize}
          height={hamburgerSize}
          viewBox={`0 0 ${hamburgerSize} ${hamburgerSize}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {widths.map((widthFactor, i) => {
            const y = lineSpacing * (i + 1) - lineHeight / 2;
            const lineWidth = hamburgerSize * widthFactor;
            const x = (hamburgerSize - lineWidth) / 2;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={lineWidth}
                height={lineHeight}
                rx={lineHeight / 2}
                fill="#111"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
