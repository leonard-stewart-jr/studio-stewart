import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "PROJECTS", href: "/" },
  // Removed "INDEPENDENT STUDIO" from main nav per request
  { label: "3D PRINTING", href: "/3d-printing" },
  { label: "MATTER MATTERS", href: "/matter-matters" },
  { label: "ABOUT ME", href: "/about" },
];

export default function NavBar({ headerHeight = 76 }) {
  const router = useRouter();

  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(href + "/");
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
