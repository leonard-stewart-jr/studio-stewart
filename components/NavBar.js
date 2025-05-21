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
    <nav>
      <ul
        style={{
          display: "flex",
          gap: 64,
          listStyle: "none",
          padding: 0,
          margin: 0,
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Futura', 'Open Sans', sans-serif", // Ensure font matches global
        }}
      >
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <a
                className="nav-link"
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: router.pathname === item.href ? "#111" : "#888",
                  borderBottom: router.pathname === item.href ? "2px solid #111" : "none",
                  transition: "color 0.18s, border-bottom 0.18s",
                }}
              >
                {item.label}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
