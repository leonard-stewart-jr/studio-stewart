import Link from "next/link";
import { useRouter } from "next/router";
import LogoHamburger from "./LogoHamburger"; // Hamburger icon component

const navItems = [
  { label: "PORTFOLIO", href: "/" },
  { label: "ABOUT ME", href: "/about" },
  { label: "3D PRINTING", href: "/3d-printing" },
];

export default function NavBar({ headerHeight = 76 }) {
  const router = useRouter();

  // Helper to determine if a nav item is active
  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(href + "/");
  }

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: headerHeight - 16,
        marginTop: 0,
        paddingLeft: 24,
        paddingRight: 24,
        fontFamily: "'Futura', 'Open Sans'",
      }}
    >
      {/* Navigation Links */}
      <div style={{ display: "flex", gap: 46 }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} passHref>
              <span
                style={{
                  color: active ? "#e6dbb9" : "#222C46", // tan highlight for active
                  fontWeight: 700,
                  fontSize: 22,
                  textDecoration: "none",
                  borderBottom: active
                    ? "2.5px solid #e6dbb9"
                    : "2.5px solid transparent",
                  paddingBottom: 2,
                  letterSpacing: "1.7px",
                  cursor: "pointer",
                  transition: "border 0.16s, color 0.16s",
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.borderBottom =
                    "2.5px solid #222C46")
                }
                onMouseOut={e =>
                  (e.currentTarget.style.borderBottom = active
                    ? "2.5px solid #e6dbb9"
                    : "2.5px solid transparent")
                }
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Hamburger Icon */}
      <LogoHamburger />
    </nav>
  );
}
