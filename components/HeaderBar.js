import { useState } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Match these with Sidebar.js
  const sidebarWidth = 320;
  const logoSize = 80; // Double original size
  const headerHeight = 110;

  // Center logo horizontally to match sidebar logo (centered at 160px if sidebarWidth is 320)
  const logoLeft = sidebarWidth / 2 - logoSize / 2;

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
        justifyContent: "center",
      }}
    >
      {/* Logo/Hamburger */}
      <div
        style={{
          position: "absolute",
          left: logoLeft,
          top: "50%",
          transform: "translateY(-50%)",
          width: logoSize,
          height: logoSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
        {/* Hamburger menu icon */}
        <div
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.18s",
            width: logoSize,
            height: logoSize,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: 0,
            top: 0,
            pointerEvents: "none",
          }}
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 56,
                height: 8,
                background: "#111",
                margin: "8px 0",
                borderRadius: 3,
              }}
            />
          ))}
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
          sidebarTopPad={headerHeight}
          sidebarWidth={sidebarWidth}
          logoSize={logoSize}
        />
      )}
    </header>
  );
}
