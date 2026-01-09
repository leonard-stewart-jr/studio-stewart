import { useState } from "react";
import { motion } from "framer-motion";
import LogoHamburger from "./LogoHamburger";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

export default function HeaderBar({ fixedNav = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Consistent sizing
  const logoSize = 60;
  const headerHeight = 60; // reduced from 76
  const sidebarPaddingLeft = 22;

  // Animation speed for hamburger fade
  const hamburgerTransition = { duration: 0.18, ease: "linear" };

  const navBarStyle = {
    position: fixedNav ? "fixed" : "sticky",
    top: 0,
    zIndex: 1200,
    width: fixedNav ? "100vw" : "100%", // fixed needs 100vw, sticky can use 100%
    paddingLeft: 0,
    paddingRight: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: headerHeight,
    height: headerHeight,
    background: "#fff",
    left: 0, // only matters for fixed
  };

  return (
    <>
      {/* Card nav for header */}
      <div className="nav-card nav-card-top" style={navBarStyle}>
        {/* Left: Hamburger/Logo */}
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
          <motion.div
            transition={hamburgerTransition}
            style={{
              marginLeft: sidebarPaddingLeft,
              marginTop: -5, // shift logo up by 10px
              cursor: "pointer",
              opacity: sidebarOpen ? 0 : 1,
              pointerEvents: sidebarOpen ? "none" : "auto",
              transition: "opacity 0.18s",
            }}
          >
            <LogoHamburger
              logoSize={logoSize}
              sidebarPaddingLeft={sidebarPaddingLeft}
              onOpenSidebar={() => setSidebarOpen(true)}
            />
          </motion.div>
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
      </div>

      {/* Sidebar with separate close button */}
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
