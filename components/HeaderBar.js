import { useState } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // logo size and position constants (should match Sidebar.js)
  const logoSize = 40;
  const logoTopPadding = 24; // matches header's paddingTop

  return (
    <header
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: `${logoTopPadding}px 0`,
        background: "transparent",
        zIndex: 100,
      }}
    >
      {/* Far left: Logo/Hamburger */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: logoSize,
          display: "flex",
          alignItems: "center",
          paddingLeft: 20,
          zIndex: 100,
          cursor: "pointer",
          width: logoSize + 16, // more hit area
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
          }}
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
            left: 0,
            top: 0,
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

      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          logoSize={logoSize}
          logoTopPadding={logoTopPadding}
        />
      )}
    </header>
  );
}
