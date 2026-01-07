import { useState } from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  // Keep sidebar state here so both HeaderBar and Sidebar can access it.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoSize = 60;
  const sidebarPaddingLeft = 22;

  // Header height
  const HEADER_HEIGHT = 60; // reduced from 76

  return (
    <>
      <HeaderBar fixedNav={false} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
        headerHeight={HEADER_HEIGHT}
      />
      {/* ISPSubNav REMOVED from here */}
      <main style={{ paddingTop: HEADER_HEIGHT }}>{children}</main>
    </>
  );
}