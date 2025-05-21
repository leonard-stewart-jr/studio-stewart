import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "Portfolio", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "3D PRINTING", href: "/3d-printing" },
];

export default function NavBar() {
  const router = useRouter();

  return (
    <nav style={{
      display: "flex",
      gap: "16px",
      justifyContent: "center",
      alignItems: "center",
      margin: "32px 0",
    }}>
      {navItems.map(item => (
        <Link key={item.href} href={item.href} passHref legacyBehavior>
          <a
            style={{
              padding: "8px 20px",
              border: "2px solid #181818",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#181818",
              background: router.pathname === item.href ? "#ececec" : "transparent",
              fontWeight: 600,
              fontSize: "0.9rem",
              fontFamily: "'Futura', 'Open Sans', Helvetica, Arial, sans-serif",
              transition: "background 0.2s",
            }}
          >
            {item.label}
          </a>
        </Link>
      ))}
    </nav>
  );
}
