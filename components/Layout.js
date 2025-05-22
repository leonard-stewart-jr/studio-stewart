import { useState } from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";

// Optionally, add your own layout styles here

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <HeaderBar
        onOpenSidebar={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
        logoSize={66}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSize={66}
      />
      <main>{children}</main>
    </>
  );
}
