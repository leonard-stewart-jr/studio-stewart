import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "PROJECTS", href: "/" },
  { label: "INDEPENDENT STUDIO", href: "/independent-studio" },
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
    <nav
      className="main-nav"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: headerHeight,
        gap: 32,
      }}
    >
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} passHref legacyBehavior>
          <a
            className={isActive(item.href) ? "active" : ""}
          >
            {item.label}
          </a>
        </Link>
      ))}
    </nav>
  );
}
