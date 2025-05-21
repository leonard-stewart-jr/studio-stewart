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
        {/* Hamburger menu icon */}
        <div
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.18s",
            width: hamburgerSize,
            height: hamburgerSize,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: 0,
            top: "50%",
            transform: `translateY(-50%)`,
            pointerEvents: "none",
          }}
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: hamburgerSize * 0.7,
                height: hamburgerSize * 0.12,
                background: "#111",
                margin: `${hamburgerSize * 0.08}px 0`,
                borderRadius: hamburgerSize * 0.06,
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
          logoSize={logoSize}
        />
      )}
    </header>
  );
}
