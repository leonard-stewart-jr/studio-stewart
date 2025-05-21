import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

const navItems = [
  { label: "Portfolio", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "3D Printing", href: "/3d-printing" },
];

export default function NavBar() {
  const router = useRouter();
  const [logoHovered, setLogoHovered] = useState(false);

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 5vw 24px 5vw",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Left: Logo + Title */}
      <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        <Link href="/" passHref legacyBehavior>
          <a
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "#151515",
              cursor: "pointer",
              marginRight: 10,
              userSelect: "none",
            }}
          >
            <span style={{ position: "relative", display: "inline-block", marginRight: 12, width: 44, height: 44 }}>
              {/* The logo image (color here, not grayscale) */}
              <img
                src="/logo.png"
                alt="Studio Stewart Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  opacity: logoHovered ? 0 : 1,
                  transition: "opacity 0.14s linear",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 2,
                  pointerEvents: "none"
                }}
                className="logo"
              />
              {/* The bold animated bar */}
              <span
                style={{
                  display: "block",
                  width: logoHovered ? 44 : 0,
                  height: logoHovered ? 8 : 0,
                  background: "#151515",
                  borderRadius: 0,
                  transition: "width 0.17s cubic-bezier(.85,.1,.2,1), height 0.16s cubic-bezier(.85,.1,.2,1)",
                  position: "absolute",
                  bottom: 18,
                  left: 0,
                  right: 0,
                  margin: "auto",
                  zIndex: 3,
                  boxShadow: logoHovered ? "0 2px 10px rgba(0,0,0,0.10)" : "none"
                }}
                aria-hidden="true"
              />
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "0.03em",
                color: "#151515",
                textTransform: "uppercase",
                fontFamily: "'Futura', 'Open Sans', Helvetica, Arial, sans-serif",
                marginTop: 2,
                whiteSpace: "nowrap",
              }}
            >
              Studio Stewart
            </span>
          </a>
        </Link>
      </div>

      {/* Center: Navigation Tabs */}
      <div style={{
        display: "flex",
        gap: "36px",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: "-60px"
      }}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref legacyBehavior>
            <a
              className="nav-link"
              style={{
                fontWeight: 700,
                fontSize: 18,
                opacity: router.pathname === item.href ? 1 : 0.7,
                borderBottom: router.pathname === item.href ? "2px solid #181818" : "none",
                paddingBottom: 2,
                transition: "opacity 0.2s, border-bottom 0.2s"
              }}
            >
              {item.label}
            </a>
          </Link>
        ))}
      </div>
      {/* Right: Spacer for symmetry */}
      <div style={{ width: 120 }} />
    </nav>
  );
}
