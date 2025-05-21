import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "Portfolio", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "3D Printing", href: "/3d-printing" },
];

export default function NavBar() {
  const router = useRouter();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 0",
        gap: 48,
      }}
    >
      {/* Logo */}
      <Link href="/" passHref legacyBehavior>
        <a style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none" }}>
          <img
            src="/logo.png"
            alt="Studio Stewart Logo"
            style={{ width: 200, height: 200, objectFit: "contain", marginRight: 8 }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: "0.03em",
              color: "#151515",
              textTransform: "uppercase",
              fontFamily: "'Futura', 'Open Sans', Helvetica, Arial, sans-serif",
              marginTop: 8,
            }}
          >
            Studio Stewart
          </span>
        </a>
      </Link>
      {/* Navigation Items */}
      <div style={{ display: "flex", gap: "32px", marginLeft: 36 }}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref legacyBehavior>
            <a
              style={{
                padding: "8px 0",
                textDecoration: "none",
                color: "#181818",
                fontWeight: 700,
                fontSize: "1.05rem",
                fontFamily: "'Futura', 'Open Sans', Helvetica, Arial, sans-serif",
                border: "none",
                background: "none",
                transition: "color 0.2s",
                opacity: router.pathname === item.href ? 1 : 0.7,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {item.label}
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
