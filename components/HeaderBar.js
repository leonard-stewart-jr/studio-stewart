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
    <>
      <header
        style={{
          width: "100%",
          height: headerHeight,
          minHeight: headerHeight,
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          paddingLeft: 0,
          paddingRight: 0,
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s",
        }}
      >
        {/* Hamburger/Logo top-left */}
        <div style={{ flex: "0 0 auto" }}>
          <LogoHamburger
            logoSize={logoSize}
            sidebarPaddingLeft={sidebarPaddingLeft}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        </div>
        {/* Centered NavBar */}
        <div style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <NavBar headerHeight={headerHeight} />
        </div>
        {/* (Optional) Right section for future use */}
        <div style={{ width: logoSize, flex: "0 0 auto" }} />
      </header>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
      />
    </>
  );
}
