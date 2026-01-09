'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import LogoHamburger from "./LogoHamburger";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

interface HeaderBarProps {
    fixedNav?: boolean;
    onOpenSidebar?: () => void;
    sidebarOpen?: boolean;
    logoSize?: number;
    sidebarPaddingLeft?: number;
}

export default function HeaderBar({
    fixedNav = false,
    onOpenSidebar: propsOnOpenSidebar,
    sidebarOpen: propsSidebarOpen,
    logoSize: propsLogoSize,
    sidebarPaddingLeft: propsSidebarPaddingLeft
}: HeaderBarProps) {
    const [localSidebarOpen, setLocalSidebarOpen] = useState(false);

    const sidebarOpen = propsSidebarOpen !== undefined ? propsSidebarOpen : localSidebarOpen;
    const setSidebarOpen = propsOnOpenSidebar ? (val: boolean) => propsOnOpenSidebar() : setLocalSidebarOpen;

    const logoSize = propsLogoSize || 60;
    const headerHeight = 60;
    const sidebarPaddingLeft = propsSidebarPaddingLeft || 22;

    const hamburgerTransition = { duration: 0.18, ease: "linear" };

    const navBarStyle: React.CSSProperties = {
        position: fixedNav ? "fixed" : "sticky",
        top: 0,
        zIndex: 1200,
        width: fixedNav ? "100vw" : "100%",
        paddingLeft: 0,
        paddingRight: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: headerHeight,
        height: headerHeight,
        background: "#fff",
        left: 0,
    };

    return (
        <>
            <div className="nav-card nav-card-top" style={navBarStyle}>
                <div
                    style={{
                        flex: "0 0 auto",
                        display: "flex",
                        alignItems: "center",
                        width: logoSize + sidebarPaddingLeft,
                        minWidth: logoSize + sidebarPaddingLeft,
                        justifyContent: "flex-start",
                    }}
                >
                    <motion.div
                        transition={hamburgerTransition}
                        style={{
                            marginLeft: sidebarPaddingLeft,
                            marginTop: -5,
                            cursor: "pointer",
                            opacity: sidebarOpen ? 0 : 1,
                            pointerEvents: sidebarOpen ? "none" : "auto",
                            transition: "opacity 0.18s",
                        }}
                    >
                        <LogoHamburger
                            logoSize={logoSize}
                            sidebarPaddingLeft={sidebarPaddingLeft}
                            onOpenSidebar={() => setSidebarOpen(true)}
                        />
                    </motion.div>
                </div>

                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <NavBar headerHeight={headerHeight} />
                </div>

                <div style={{ flex: "0 0 auto", width: logoSize, minWidth: logoSize }} />
            </div>

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                logoSize={logoSize}
                sidebarPaddingLeft={sidebarPaddingLeft}
                headerHeight={headerHeight}
            />
        </>
    );
}
