import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "PROJECTS", href: "/" },
  { label: "3D WORKS", href: "/3d-printing" },
  { label: "ABOUT", href: "/about" },
];

export default function NavBar({ headerHeight = 60 }) {
  const router = useRouter();

  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="main-nav"
      style={{
        height: headerHeight,
        width: 414,
        display: "grid",
        gridTemplateColumns: "repeat(3, 138px)",
        gap: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={isActive(item.href) ? "active" : ""}
          style={{
            margin: 0,
            width: "100%",
            textAlign: "center",
            justifySelf: "center",
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
