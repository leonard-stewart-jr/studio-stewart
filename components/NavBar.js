import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "PROJECTS", href: "/" },
  // Removed "INDEPENDENT STUDIO" from main nav per request
  { label: "3D PRINTING", href: "/3d-printing" },
  { label: "MATTER MATTERS", href: "/matter-matters" },
  { label: "ABOUT", href: "/about" },
];

export default function NavBar({ headerHeight = 60 }) {
  const router = useRouter();

  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(href + "/");
  }

  return (
    <nav className="main-nav" style={{ height: headerHeight, alignItems: "center" }}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <a className={isActive(item.href) ? "active" : ""}>{item.label}</a>
        </Link>
      ))}
    </nav>
  );
}
