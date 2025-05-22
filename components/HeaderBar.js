import { useState } from "react";
import { motion } from "framer-motion";
import LogoHamburger from "./LogoHamburger";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Consistent sizing
  const logoSize = 66;
  const headerHeight = 76;
  const sidebarPaddingLeft = 22;

  // Add this line for consistent hamburger animation speed:
  const hamburgerTransition = { duration: 0.12, ease: "linear" };

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
          justifyContent: "space-between",
          paddingLeft: 0,
          paddingRight: 0,
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s",
        }}
      >
        {/* Left: Hamburger/Logo (always reserve the space to prevent header shift) */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            width: logoSize + sidebarPaddingLeft,
            minWidth: logoSize + sidebarPaddingLeft,
            justifyContent: "flex-start",
          }}
        >
          {!sidebarOpen ? (
            <motion.div
              layoutId="logo-hamburger"
              transition={hamburgerTransition} // <-- ADD THIS LINE
              style={{
                marginLeft: sidebarPaddingLeft,
                cursor: "pointer",
              }}
            >
              <LogoHamburger
                logoSize={logoSize}
                sidebarPaddingLeft={sidebarPaddingLeft}
                onOpenSidebar={() => setSidebarOpen(true)}
              />
            </motion.div>
          ) : (
            // Reserve empty space (prevents header/nav shifting)
            <div
              style={{
                width: logoSize,
                height: logoSize,
                marginLeft: sidebarPaddingLeft,
              }}
            />
          )}
        </div>
        {/* Center: NavBar */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NavBar headerHeight={headerHeight} />
        </div>
        {/* Right: Reserved for future use, maintains space for symmetry */}
        <div style={{ flex: "0 0 auto", width: logoSize, minWidth: logoSize }} />
      </header>
      {/* Sidebar with animated Hamburger as close button */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
        headerHeight={headerHeight}
      />
    </>
  );
}
