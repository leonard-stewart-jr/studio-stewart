import { useState } from "react";
import LogoHamburger from "./LogoHamburger";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoSize = 66;
  const headerHeight = 76;
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
      {/* Hamburger/Logo top-left */}
      <LogoHamburger
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* Centered NavBar */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <NavBar headerHeight={headerHeight} />
      </div>

      {/* Sidebar & Overlay */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
      />
    </header>
  );
}
