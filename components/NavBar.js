import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "Portfolio", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "3D Printing", href: "/3d-printing" },
];

export default function NavBar({ headerHeight = 76 }) {
  const router = useRouter();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: headerHeight,
        gap: 32,
      }}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? router.pathname === "/"
            : router.pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} passHref legacyBehavior>
            <a
              className={isActive ? "active" : ""}
              style={{
                color: isActive ? "#e6dbb9" : "#181818",
                fontWeight: 700,
                fontSize: 22,
                textDecoration: isActive ? "underline" : "none",
                padding: "7px 0",
                borderBottom: "1px solid #eee",
                transition: "color 0.2s",
              }}
            >
              {item.label}
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
