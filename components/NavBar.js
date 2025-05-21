import Link from "next/link";

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
        gap: 46,
        alignItems: "flex-end",
        height: headerHeight - 16, // tuck closer to top
        marginTop: 0,
      }}
    >
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} passHref legacyBehavior>
          <a
            style={{
              color: "#222C46",
              fontWeight: 700,
              fontSize: 22,
              textDecoration: "none",
              borderBottom: "2.5px solid transparent",
              paddingBottom: 2,
              letterSpacing: "1.7px",
              transition: "border 0.16s, color 0.16s",
            }}
            onMouseOver={e => (e.currentTarget.style.borderBottom = "2.5px solid #222C46")}
            onMouseOut={e => (e.currentTarget.style.borderBottom = "2.5px solid transparent")}
          >
            {item.label}
          </a>
        </Link>
      ))}
    </nav>
  );
}
