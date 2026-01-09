'use client';

import { useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import LogoHamburger from "./LogoHamburger";
import styles from "../styles/sidebar.module.css";

const navItems = [
    { label: "PROJECTS", href: "/" },
    { label: "3D PRINTING", href: "/3d-printing" },
    { label: "MATTER MATTERS", href: "/matter-matters" },
    { label: "ABOUT ME", href: "/about" },
];

const socialLinks = [
    { label: "Email", href: "mailto:leonard.stewart@studio-stewart.com" },
    { label: "My Code Here", href: "https://github.com/leonard-stewart-jr" },
    { label: "UNDERGRADUATE PORTFOLIO", href: "https://issuu.com/leonard.stewart/docs/architecture_portfolio" },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    logoSize?: number;
    sidebarPaddingLeft?: number;
    headerHeight?: number;
}

export default function Sidebar({
    open,
    onClose,
    logoSize = 60,
    sidebarPaddingLeft = 22,
    headerHeight = 60,
}: SidebarProps) {
    const pathname = usePathname();
    const verticalOffset = (headerHeight - logoSize) / 2 - 2;

    function isActive(href: string) {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname?.startsWith(href + "/");
    }

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const sidebarVariants: Variants = {
        closed: { x: "-100%", transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } },
        open: { x: 0, transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } }
    };
    const hamburgerTransition = { duration: 0.18, ease: "linear" };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        onClick={onClose}
                        aria-label="Close menu"
                        className={styles.sidebarOverlay}
                    />
                )}
            </AnimatePresence>
            <motion.aside
                className={`${styles.sidebar} ${open ? styles.open : ""}`}
                initial={false}
                animate={open ? "open" : "closed"}
                variants={sidebarVariants}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
            >
                {open && (
                    <motion.div
                        transition={hamburgerTransition}
                        style={{
                            position: "absolute",
                            top: verticalOffset,
                            right: 28,
                            zIndex: 2200,
                            cursor: "pointer",
                            opacity: open ? 1 : 0,
                            pointerEvents: open ? "auto" : "none",
                            transition: "opacity 0.18s",
                        }}
                    >
                        <LogoHamburger
                            logoSize={logoSize}
                            sidebarPaddingLeft={sidebarPaddingLeft}
                            onOpenSidebar={onClose}
                        />
                    </motion.div>
                )}
                <nav
                    className={styles.sidebarNav}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 22,
                        marginTop: logoSize,
                        paddingLeft: sidebarPaddingLeft,
                        paddingRight: sidebarPaddingLeft,
                    }}
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.sidebarNavLink} ${isActive(item.href) ? styles.active : ""}`}
                            onClick={onClose}
                        >
                            {item.label}
                        </Link>
                    ))}

                    <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 1: Extra Links</div>
                    {[...Array(15)].map((_, i) => (
                        <a href="#" key={`extra-${i}`} style={{ color: "#888", fontSize: 13 }}>
                            Example Link {i + 1}
                        </a>
                    ))}

                    <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 2: Even more content</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {[...Array(10)].map((_, i) => (
                            <li key={`more-${i}`}>
                                <a href="#" style={{ color: "#b1b1ae", fontSize: 13 }}>
                                    Item {i + 1}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 3: Placeholder Section</div>
                    <p style={{ fontSize: 13, color: "#888" }}>
                        This section exists to make the sidebar content long enough to require scrolling on mobile and desktop. You can add or remove items as needed.
                    </p>

                    <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 4: Final Section</div>
                    <p style={{ fontSize: 13, color: "#888" }}>
                        If you can scroll this sidebar, the overflow-y: auto is working as intended.
                    </p>
                </nav>
                <div className={styles.sidebarInfo} style={{ padding: "24px" }}>
                    <p>
                        <b>Leonard Stewart</b> — Digital portfolio<br />
                        Architecture Student, designer, and maker.<br />
                        Explore my work and reach out to connect!
                    </p>
                </div>
                <div
                    className={styles.sidebarFooter}
                    style={{
                        padding: "0 24px 24px",
                        marginBottom: "100px",
                    }}
                >
                    <h3>Other Links</h3>
                    <ul>
                        {socialLinks.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.aside>
        </>
    );
}
