import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "PORTFOLIO", href: "/" },
  { label: "ABOUT ME", href: "/about" },
  { label: "3D PRINTING", href: "/3d-printing" },
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
              color: isActive(item.href) ? "#e6dbb9" : "#181818",
              fontWeight: 700,
              fontSize: 22,
              textDecoration: isActive(item.href) ? "underline" : "none",
              padding: "7px 0",
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
