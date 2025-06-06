import { useState } from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";
import ISPSubNav from "./isp/isp-subnav";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  // Keep sidebar state here so both HeaderBar and Sidebar can access it.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // You can customize these as you did before
  const logoSize = 66;
  const sidebarPaddingLeft = 22;

  // Determine current route
  const router = useRouter();
  const isIndependentStudio = router.pathname === "/independent-studio";

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
      {isIndependentStudio && <ISPSubNav />}
      <main>{children}</main>
    </>
  );
}
