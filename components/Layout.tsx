'use client';

import { useState } from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <main style={{ paddingTop: 0 }}>
                {children}
            </main>
        </>
    );
}
