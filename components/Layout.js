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

  // Header and subnav heights
  const HEADER_HEIGHT = 76;
  // Note: only account for header height in main padding
  // Subnav offset will be handled in page content if needed

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
      <main style={{ paddingTop: HEADER_HEIGHT }}>
        {children}
      </main>
    </>
  );
}
