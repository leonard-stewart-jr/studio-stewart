import { useState } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import LogoHamburger from "./LogoHamburger";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tighter, more compact header
  const logoSize = 66; // slightly smaller
  const headerHeight = 76; // tighter
  const sidebarPaddingLeft = 22;

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
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      {/* Logo/Hamburger */}
      <LogoHamburger
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* Centered NavBar */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <NavBar headerHeight={headerHeight} />
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          logoSize={logoSize}
          sidebarPaddingLeft={sidebarPaddingLeft}
        />
      )}
    </header>
  );
}
