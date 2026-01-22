import { useState } from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";

export default function Layout({ children, disableStickyHeader = false }) {
  // Keep sidebar state here so both HeaderBar and Sidebar can access it.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoSize = 60;
  const sidebarPaddingLeft = 22;

  // Header height (must match HeaderBar height)
  const HEADER_HEIGHT = 60;

  // Keep the prop for compatibility, but header is now fixed site-wide.
  const sticky = !disableStickyHeader;

  return (
    <>
      <HeaderBar
        onOpenSidebar={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
        // sticky prop is still provided for compatibility but HeaderBar currently enforces fixed positioning site-wide
        sticky={sticky}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
        headerHeight={HEADER_HEIGHT}
      />
      {/* Ensure main content is pushed below the fixed header so it is not covered */}
      <main style={{ paddingTop: HEADER_HEIGHT }}>
        {children}
      </main>
    </>
  );
}
