import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "PORTFOLIO", href: "/" },
  { label: "INDEPENDENT STUDIO", href: "/independent-studio" },
  { label: "3D PRINTING", href: "/3d-printing" },
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
            style={{
              fontWeight: 700,
              fontSize: 11, // Reduced font size to half of previous (was 22)
              textDecoration: isActive(item.href) ? "underline" : "none",
              padding: "4px 0", // Adjusted for smaller text
              borderBottom: "1px solid #eee",
              transition: "color 0.2s",
            }}
          >
            {item.label}
          </a>
        </Link>
      ))}
    </nav>
  );
}
