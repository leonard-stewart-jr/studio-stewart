import { useRouter } from "next/router";
import Link from "next/link";

const navItems = [
  { label: "PORTFOLIO", href: "/" },
  { label: "ABOUT ME", href: "/about" },
  { label: "3D PRINTING", href: "/3d-printing" },
];

const socialLinks = [
  { label: "Email", href: "mailto:your@email.com" },
  { label: "GitHub", href: "https://github.com/leonard-stewart-jr" },
];

export default function Sidebar({ open, onClose, logoSize = 66 }) {
  const router = useRouter();

  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay${open ? " open" : ""}`}
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside
        className={`sidebar${open ? " open" : ""}`}
        style={{
          left: 0,
          top: 0,
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#181818",
            fontSize: 32,
            position: "absolute",
            top: 16,
            right: 18,
            cursor: "pointer",
            zIndex: 2200,
          }}
          aria-label="Close menu"
        >
          ×
        </button>
        {/* Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: logoSize }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref legacyBehavior>
              <a
                className={isActive(item.href) ? "active" : ""}
                style={{
                  color: isActive(item.href) ? "#e6dbb9" : "#181818",
                  fontWeight: 700,
                  fontSize: 22,
                  textDecoration: isActive(item.href) ? "underline" : "none",
                  padding: "7px 0",
                  borderBottom: "1px solid #eee",
                  transition: "color 0.2s",
                }}
                onClick={onClose}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
        <div className="sidebar-info">
          <p>
            <b>Studio Stewart</b> — Digital portfolio<br />
            Creative developer, designer, and maker.<br />
            Explore my work and reach out to connect!
          </p>
        </div>
        <div className="sidebar-footer">
          <h3>Contact & Social</h3>
          <ul>
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
