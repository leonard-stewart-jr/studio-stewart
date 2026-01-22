import { useState } from "react";
import { motion } from "framer-motion";
import LogoHamburger from "./LogoHamburger";
import NavBar from "./NavBar";

export default function HeaderBar({
  fixedNav = false,
  // NOTE: `sticky` prop is intentionally accepted for compatibility but ignored
  // so the header is sticky site-wide unless fixedNav === true.
  sticky = true,
  onOpenSidebar,
  sidebarOpen: sidebarOpenProp,
  logoSize = 60,
  sidebarPaddingLeft = 22,
}) {
  // Internal sidebar state only used when parent doesn't control it.
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);

  // Determine the actual sidebar state and open handler.
  const sidebarOpen = typeof sidebarOpenProp === "boolean" ? sidebarOpenProp : internalSidebarOpen;
  const openSidebar = () => {
    if (typeof onOpenSidebar === "function") onOpenSidebar();
    else setInternalSidebarOpen(true);
  };

  // Animation speed for hamburger fade
  const hamburgerTransition = { duration: 0.18, ease: "linear" };

  // Position selection:
  // - fixedNav true => fixed (top-level fixed)
  // - otherwise => always sticky (site-wide)
  // We intentionally ignore the incoming `sticky` prop so pages cannot opt out.
  const computedPosition = fixedNav ? "fixed" : "sticky";

  const navBarStyle = {
    position: computedPosition,
    top: 0,
    zIndex: 1200,
    width: fixedNav ? "100vw" : "100%", // fixed needs 100vw, sticky can use 100%
    paddingLeft: 0,
    paddingRight: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
    height: 60,
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
              marginTop: -5, // shift logo up by 10px visually
              cursor: "pointer",
              opacity: sidebarOpen ? 0 : 1,
              pointerEvents: sidebarOpen ? "none" : "auto",
              transition: "opacity 0.18s",
            }}
          >
            <LogoHamburger
              logoSize={logoSize}
              sidebarPaddingLeft={sidebarPaddingLeft}
              onOpenSidebar={openSidebar}
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
          <NavBar headerHeight={60} />
        </div>

        {/* Right: Reserved for future use, maintains space for symmetry */}
        <div style={{ flex: "0 0 auto", width: logoSize, minWidth: logoSize }} />
      </div>
    </>
  );
}
