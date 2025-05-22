import { useState } from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  // Keep sidebar state here so both HeaderBar and Sidebar can access it.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // You can customize these as you did before
  const logoSize = 66;
  const sidebarPaddingLeft = 22;

  return (
    <>
      <HeaderBar
        onOpenSidebar={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSize={logoSize}
        sidebarPaddingLeft={sidebarPaddingLeft}
      />
      <main>{children}</main>
    </>
  );
}
