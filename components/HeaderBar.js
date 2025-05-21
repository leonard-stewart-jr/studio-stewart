import { useState } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const logoSize = 40;
  const headerHeight = 72;
  const logoLeftPad = 24;

  return (
    <header
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: 0,
        margin: 0,
        background: "transparent",
        minHeight: headerHeight,
        height: headerHeight,
        zIndex: 100,
      }}
    >
      {/* Far left: Logo/Hamburger */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: headerHeight,
          display: "flex",
          alignItems: "center",
          paddingLeft: logoLeftPad,
          zIndex: 101,
          cursor: "pointer",
          width: logoSize + logoLeftPad * 2,
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
        {/* Logo fades out on hover, hamburger fades in */}
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            height: logoSize,
            width: logoSize,
            objectFit: "contain",
            opacity: hovered ? 0 : 1,
            transition: "opacity 0.18s",
            pointerEvents: "none",
            position: "absolute",
            left: logoLeftPad,
            top: "50%",
            transform: "translateY(-50%)",
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
            alignItems: "flex-start",
            position: "absolute",
            left: logoLeftPad,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 28,
                height: 4,
                background: "#111",
                margin: "3px 0",
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Centered NavBar */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <NavBar />
      </div>

      {/* Sidebar - only rendered when open */}
      {sidebarOpen && (
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          sidebarTopPad={headerHeight}
          logoSize={logoSize}
        />
      )}
    </header>
  );
}
