import { useState } from "react";

export default function LogoHamburger({
  logoSize = 66,
  sidebarPaddingLeft = 22,
  onOpenSidebar,
}) {
  const [hovered, setHovered] = useState(false);

  // Hamburger is 35% the size of the logo by default
  const hamburgerScale = 0.35;
  const hamburgerSize = logoSize * hamburgerScale;
  const hamburgerOffset = (logoSize - hamburgerSize) / 2;

  // 4-line triangle hamburger (widths as fractions of full width)
  const lineWidths = [0.22, 0.44, 0.66, 0.88];
  const lineY = [0.13, 0.33, 0.53, 0.73];

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
      {/* Hamburger icon (fades in and expands to triangle bounds on hover/focus) */}
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
