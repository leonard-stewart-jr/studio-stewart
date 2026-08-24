import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";

export default function Layout({ children, disableStickyHeader = false, hasFixedSubnav = false }) {
  // Keep sidebar state here so both HeaderBar and Sidebar can access it.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const logoSize = 60;
  const sidebarPaddingLeft = 22;

  // Header height (must match HeaderBar height)
  const HEADER_HEIGHT = 60;

  // Close the sidebar as soon as an internal navigation begins. Keeping this at
  // the layout level means current and future sidebar links all get the same
  // behavior without needing individual click handlers.
  useEffect(() => {
    const closeSidebarOnNavigation = () => setSidebarOpen(false);

    router.events.on("routeChangeStart", closeSidebarOnNavigation);

    return () => {
      router.events.off("routeChangeStart", closeSidebarOnNavigation);
    };
  }, [router.events]);

  // Keep the prop for compatibility, but header is now fixed site-wide.
  const sticky = !disableStickyHeader;

  // Fixed subnavs position themselves below the header, so main only needs
  // the header offset. Adding the subnav height here creates a duplicate gap.
  const mainPaddingTop = HEADER_HEIGHT;

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
        headerHeight={HEADER_HEIGHT}
      />
      <main style={{ paddingTop: mainPaddingTop }}>
        {children}
      </main>
    </>
  );
}
