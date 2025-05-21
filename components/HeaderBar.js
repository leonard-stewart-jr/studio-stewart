import { useState } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <header
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "24px 0",
        background: "transparent",
        zIndex: 100,
      }}
    >
      {/* Far left: Logo / Hamburger */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          display: "flex",
          alignItems: "center",
          paddingLeft: 20, // shifted right!
          zIndex: 100,
          cursor: "pointer",
          width: 60, // increased for buffer
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
            height: 40,
            width: 40,
            minWidth: 40,
            minHeight: 40,
            maxWidth: 44,
            maxHeight: 44,
            objectFit: "contain",
            opacity: hovered ? 0 : 1,
            transition: "opacity 0.18s",
            position: "absolute",
            left: 8, // so not flush left
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        {/* Hamburger menu icon */}
        <div
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.18s",
            width: 40,
            height: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
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
        <Sidebar onClose={() => setSidebarOpen(false)} />
      )}
    </header>
  );
}
