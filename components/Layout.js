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

  // Use Next.js router to determine current route
  const router = useRouter();

  // Only show ISPSubNav on /independent-studio
  const isIndependentStudio = router.pathname === "/independent-studio";

  // Keep activeSection/state here so nav works!
  // We'll pass this down as context or prop if needed for subnav control
  // For now, just render the subnav in the right place
  // To keep active tab state, you may want to lift it to here in the future.

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
      {isIndependentStudio && (
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#f7f7f7",
          zIndex: 1201
        }}>
          <ISPSubNav />
        </div>
      )}
      <main>{children}</main>
    </>
  );
}
