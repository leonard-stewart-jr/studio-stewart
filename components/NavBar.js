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
      gap: "24px",
      justifyContent: "center",
      alignItems: "center",
      margin: "32px 0",
    }}>
      {navItems.map(item => (
        <Link key={item.href} href={item.href} passHref legacyBehavior>
          <a
            style={{
              padding: "8px 0",
              textDecoration: "none",
              color: "#181818",
              fontWeight: 600,
              fontSize: "0.9rem",
              fontFamily: "'Futura', 'Open Sans', Helvetica, Arial, sans-serif",
              border: "none",
              background: "none",
              transition: "color 0.2s",
              opacity: router.pathname === item.href ? 1 : 0.7,
            }}
          >
            {item.label}
          </a>
        </Link>
      ))}
    </nav>
  );
}
