import { useState } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // These should match Sidebar.js
  const sidebarPaddingLeft = 28; // Matches Sidebar's left padding
  const logoSize = 80;
  const headerHeight = 110;
  const hamburgerScale = 0.35;
  const hamburgerSize = logoSize * hamburgerScale;

  // To align hamburger exactly over the logo, center hamburger in logo container
  const hamburgerOffset = (logoSize - hamburgerSize) / 2;

  return (
    <header
      style={{
        width: "100%",
        height: headerHeight,
        minHeight: headerHeight,
        position: "relative",
        background: "transparent",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Logo/Hamburger - aligned with sidebar text/links */}
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
        onClick={() => setSidebarOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") setSidebarOpen(true);
        }}
        title="Open menu"
        aria-label="Open menu"
      >
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
        {/* Triangle Hamburger menu icon */}
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
            {/* Top line (shortest) */}
            <rect
              x={(hamburgerSize * 0.5) - (hamburgerSize * 0.18)}
              y={hamburgerSize * 0.19}
              width={hamburgerSize * 0.36}
              height={hamburgerSize * 0.08}
              rx={hamburgerSize * 0.04}
              fill="#111"
            />
            {/* Middle line (medium) */}
            <rect
              x={(hamburgerSize * 0.5) - (hamburgerSize * 0.32)}
              y={hamburgerSize * 0.45}
              width={hamburgerSize * 0.64}
              height={hamburgerSize * 0.08}
              rx={hamburgerSize * 0.04}
              fill="#111"
            />
            {/* Bottom line (widest) */}
            <rect
              x={(hamburgerSize * 0.5) - (hamburgerSize * 0.49)}
              y={hamburgerSize * 0.71}
              width={hamburgerSize * 0.98}
              height={hamburgerSize * 0.08}
              rx={hamburgerSize * 0.04}
              fill="#111"
            />
          </svg>
        </div>
      </div>

      {/* Centered NavBar */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <NavBar />
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          logoSize={logoSize}
        />
      )}
    </header>
  );
}
