import { useState } from "react";
import { motion } from "framer-motion";
import LogoHamburger from "./LogoHamburger";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

export default function HeaderBar({ fixedNav = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Consistent sizing
  const logoSize = 60;         // adjust logo area to match thinner header visually
  const headerHeight = 60;     // reduced from 76 to 60
  const sidebarPaddingLeft = 22;

  // Animation speed for hamburger fade
  const hamburgerTransition = { duration: 0.18, ease: "linear" };

  const navBarStyle = {
    position: fixedNav ? "fixed" : "sticky",
    top: 0,
    zIndex: 1200,
    width: "100vw",
    paddingLeft: 0,
    paddingRight: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: headerHeight,
    height: headerHeight,
    background: "#fff",
    left: 0,
  };

  return (
    <>
      {/* Card nav for header */}
      <div className="nav-card nav-card-top" style={navBarStyle}>
        {/* Left: Hamburger/Logo */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={hamburgerTransition}
          style={{ display: "flex", alignItems: "center", paddingLeft: sidebarPaddingLeft }}
        >
          <LogoHamburger
            logoSize={logoSize}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        </motion.div>

        {/* Center: NavBar */}
        <NavBar headerHeight={headerHeight} />

        {/* Right: Reserved for future use, maintains space for symmetry */}
        <div style={{ width: logoSize, paddingRight: sidebarPaddingLeft }} />
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