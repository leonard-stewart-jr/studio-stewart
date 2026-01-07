import { useState } from "react";
import { motion } from "framer-motion";
import LogoHamburger from "./LogoHamburger";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

/**
 * Original pattern:
 * - Header shows the logo; on hover the triangle/hamburger appears; click opens sidebar.
 * - Sidebar has its own X close button (separate from the logo).
 * - Header text stays centered.
 */
export default function HeaderBar({ fixedNav = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sizing to match your 60px header
  const logoSize = 60;
  const headerHeight = 60;
  const sidePad = 22;

  const navBarStyle = {
    position: fixedNav ? "fixed" : "sticky",
    top: 0,
    zIndex: 1200,
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: headerHeight,
    height: headerHeight,
    background: "#fff",
    left: 0
  };

  return (
    <>
      <div className="nav-card nav-card-top" style={navBarStyle}>
        {/* Left: Logo/Hamburger (opens sidebar) */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: "linear" }}
          style={{ display: "flex", alignItems: "center", paddingLeft: sidePad }}
        >
          <LogoHamburger
            logoSize={logoSize}
            onOpenSidebar={() => setSidebarOpen(true)}
            title="Open menu"
          />
        </motion.div>

        {/* Center: Main nav */}
        <NavBar headerHeight={headerHeight} />

        {/* Right spacer for symmetry */}
        <div style={{ width: logoSize, paddingRight: sidePad }} />
      </div>

      {/* Sidebar (with separate X button) */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSize={logoSize}
        sidebarPaddingLeft={sidePad}
        headerHeight={headerHeight}
      />
    </>
  );
}