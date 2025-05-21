import { useState } from "react";

export default function LogoHamburger({
  logoSize = 66,
  sidebarPaddingLeft = 22,
  onOpenSidebar,
}) {
  const [hovered, setHovered] = useState(false);

  // Hamburger fills the entire SVG area (logoSize x logoSize)
  const lineCount = 4;
  const minWidth = 0.3;
  const maxWidth = 1.0;
  const widths = Array.from({ length: lineCount }, (_, i) =>
    minWidth + ((maxWidth - minWidth) * i) / (lineCount - 1)
  );
  const lineHeight = logoSize * 0.09;
  const lineSpacing = (logoSize - lineHeight) / (lineCount - 1);

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
      {/* Hamburger icon (fades in and fills triangle area, sharp lines) */}
      <div
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
          viewBox={`0 0 ${logoSize} ${logoSize}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {widths.map((widthFactor, i) => {
            const y = i * lineSpacing;
            const lineWidth = logoSize * widthFactor;
            const x = (logoSize - lineWidth) / 2;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={lineWidth}
                height={lineHeight}
                fill="#111"
                rx={0}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
