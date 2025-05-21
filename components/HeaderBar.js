import { useState } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import LogoHamburger from "./LogoHamburger";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Consistent sizing for header/side bar
  const logoSize = 80;
  const headerHeight = 110;
  const sidebarPaddingLeft = 28;

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
      {/* Logo/Hamburger */}
      <LogoHamburger
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

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
