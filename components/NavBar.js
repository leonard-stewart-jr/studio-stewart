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
      gap: "1rem",
      justifyContent: "center",
      margin: "2rem 0"
    }}>
      {navItems.map(item => {
        const isActive = router.pathname === item.href;
        return (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a style={{
              border: "2px solid #333",
              borderRadius: 8,
              padding: "0.5rem 1.5rem",
              fontWeight: "bold",
              background: isActive ? "#eee" : "#fff",
              color: isActive ? "#111" : "#333",
              textDecoration: "none",
              boxShadow: isActive ? "0 2px 8px #ccc" : "none",
              transition: "background 0.2s"
            }}>
              {item.label}
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
