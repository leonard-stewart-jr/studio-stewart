'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { label: "PROJECTS", href: "/" },
    { label: "3D PRINTING", href: "/3d-printing" },
    { label: "MATTER MATTERS", href: "/matter-matters" },
    { label: "ABOUT ME", href: "/about" },
];

interface NavBarProps {
    headerHeight?: number;
}

export default function NavBar({ headerHeight = 76 }: NavBarProps) {
    const pathname = usePathname();

    function isActive(href: string) {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname?.startsWith(href + "/");
    }

    return (
        <nav className="main-nav" style={{ height: headerHeight }}>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={isActive(item.href) ? "active" : undefined}
                    aria-current={isActive(item.href) ? "page" : undefined}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
