import { useState } from "react";

export default function LogoHamburger({
  logoSize = 80,
  sidebarPaddingLeft = 28,
  onOpenSidebar,
}) {
  const [hovered, setHovered] = useState(false);
  const hamburgerScale = 0.35;
  const hamburgerSize = logoSize * hamburgerScale;
  const hamburgerOffset = (logoSize - hamburgerSize) / 2;

  // Proportional widths for 4 lines (smallest to largest, like a triangle)
  const lineWidths = [
    0.22, // top (shortest)
    0.44, // second
    0.66, // third
    0.88, // bottom (widest)
  ];

  // Vertical positions (evenly spaced)
  const lineY = [
    0.15,
    0.35,
    0.55,
    0.75,
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: sidebarPaddingLeft,
        top: "50%",
        transform: "translateY(-50%)",
        width: logoSize,
        height: logoSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        zIndex: 1200,
        cursor: "pointer",
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
      {/* Logo */}
      <img
        src="/logo.png"
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
      {/* 4-Line Triangle Hamburger icon */}
      <div
        style={{
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.18s",
          width: hamburgerSize,
          height: hamburgerSize,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          left: hamburgerOffset,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <svg
          width={hamburgerSize}
          height={hamburgerSize}
          viewBox={`0 0 ${hamburgerSize} ${hamburgerSize}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          {lineWidths.map((widthFactor, i) => (
            <rect
              key={i}
              x={(hamburgerSize * 0.5) - (hamburgerSize * widthFactor / 2)}
              y={hamburgerSize * lineY[i]}
              width={hamburgerSize * widthFactor}
              height={hamburgerSize * 0.08}
              rx={hamburgerSize * 0.04}
              fill="#111"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
