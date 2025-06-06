import { useState } from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";
import ISPSubNav from "./isp/isp-subnav";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  // Keep sidebar state here so both HeaderBar and Sidebar can access it.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoSize = 66;
  const sidebarPaddingLeft = 22;

  // Use Next.js router to determine current route
  const router = useRouter();

  // Only show ISPSubNav on /independent-studio
  const isIndependentStudio = router.pathname === "/independent-studio";

  // Calculate total header + subnav height
  const HEADER_HEIGHT = 76;
  const SUBNAV_HEIGHT = 38;
  const totalHeaderHeight = isIndependentStudio ? HEADER_HEIGHT + SUBNAV_HEIGHT : HEADER_HEIGHT;

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
      {/* Subnav directly below header ONLY on independent-studio */}
      {isIndependentStudio && <ISPSubNav />}
      <main style={{ paddingTop: totalHeaderHeight }}>
        {children}
      </main>
    </>
  );
}
