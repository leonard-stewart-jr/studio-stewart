import Link from "next/link";
// import LogoHamburger from "./LogoHamburger"; // Remove or comment out

const navItems = [
  { label: "PORTFOLIO", href: "/" },
  { label: "ABOUT ME", href: "/about" },
  { label: "3D PRINTING", href: "/3d-printing" },
];

export default function NavBar({ headerHeight = 76 }) {
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
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
            <span
              style={{
                color: "#222C46",
                fontWeight: 700,
                fontSize: 22,
                textDecoration: "none",
                borderBottom: "2.5px solid transparent",
                paddingBottom: 2,
                letterSpacing: "1.7px",
                cursor: "pointer",
                transition: "border 0.16s, color 0.16s",
              }}
              onMouseOver={e => (e.currentTarget.style.borderBottom = "2.5px solid #222C46")}
              onMouseOut={e => (e.currentTarget.style.borderBottom = "2.5px solid transparent")}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
      {/* Hamburger Icon - removed */}
    </nav>
  );
}
