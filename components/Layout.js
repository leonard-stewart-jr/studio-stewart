import { useState } from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";

export default function Layout({ children, disableStickyHeader = false }) {
  // Keep sidebar state here so both HeaderBar and Sidebar can access it.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoSize = 60;
  const sidebarPaddingLeft = 22;

  // Header height
  const HEADER_HEIGHT = 60;

  const sticky = !disableStickyHeader;
  
  return (
    <>
      <HeaderBar
        onOpenSidebar={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
        // sticky controls whether the header uses CSS sticky vs relative positioning.
        sticky={sticky}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
        headerHeight={HEADER_HEIGHT}
      />
      {/* ISPSubNav REMOVED from here */}
      <main style={{ paddingTop: 0 }}>
        {children}
      </main>
    </>
  );
}
