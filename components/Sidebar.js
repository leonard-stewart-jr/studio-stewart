import { useRouter } from "next/router";
import Link from "next/link";
import LogoHamburger from "./LogoHamburger";

const navItems = [
  { label: "Portfolio", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "3D Printing", href: "/3d-printing" },
];

const socialLinks = [
  { label: "Email", href: "mailto:your@email.com" },
  { label: "GitHub", href: "https://github.com/leonard-stewart-jr" },
];

export default function Sidebar({ open, onClose, logoSize = 66, sidebarPaddingLeft = 22 }) {
  const router = useRouter();

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay${open ? " open" : ""}`}
        onClick={onClose}
        aria-label="Close menu"
        style={{
          display: open ? "block" : "none",
        }}
      />
      <aside
        className={`sidebar${open ? " open" : ""}`}
        style={{
          left: 0,
          top: 0,
          width: 300,
          maxWidth: "80vw",
          height: "100vh",
          background: "#fff",
          color: "#181818",
          boxShadow: "2px 0 24px rgba(0,0,0,0.13)",
          zIndex: 2100,
          display: "flex",
          flexDirection: "column",
          padding: `0 ${sidebarPaddingLeft}px 22px`,
          position: "fixed",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.22s cubic-bezier(.71,.3,.48,.92)",
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Logo/Hamburger at the top, clicking it closes sidebar */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            marginTop: "12px",
            marginBottom: "8px",
            minHeight: logoSize,
          }}
        >
          <LogoHamburger
            logoSize={logoSize}
            sidebarPaddingLeft={0}
            onOpenSidebar={onClose} // clicking closes sidebar
          />
        </div>
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
        <nav style={{ display: "flex", flexDirection: "column", gap: 22 }}>
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
                  onClick={onClose}
                >
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
        <div style={{ margin: "18px 0 8px 0", fontSize: 17, color: "#555" }}>
          <p>
            <b>Studio Stewart</b> — Digital portfolio<br />
            Creative developer, designer, and maker.<br />
            Explore my work and reach out to connect!
          </p>
        </div>
        <div style={{ marginTop: "auto" }}>
          <h3 style={{ fontSize: 17, margin: "10px 0 6px 0", color: "#181818" }}>
            Contact & Social
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {socialLinks.map((link) => (
              <li key={link.href} style={{ marginBottom: 5 }}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#181818",
                    textDecoration: "underline",
                    fontSize: 15.5,
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <style jsx global>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 300px;
          height: 100vh;
          max-width: 80vw;
          background: #fff;
          box-shadow: 2px 0 24px rgba(0,0,0,0.13);
          z-index: 2100;
          display: flex;
          flex-direction: column;
          padding: 0 22px 22px 22px;
          transform: translateX(-100%);
          transition: transform 0.22s cubic-bezier(.71,.3,.48,.92);
        }
        .sidebar.open {
          transform: translateX(0);
          pointer-events: auto;
        }
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.22);
          z-index: 2000;
          display: none;
        }
        .sidebar-overlay.open {
          display: block;
        }
        @media (max-width: 700px) {
          .sidebar {
            left: 0 !important;
            width: 260px !important;
            min-width: 160px !important;
            max-width: 320px !important;
            padding: 0 22px 22px 22px !important;
            position: fixed !important;
            top: 0 !important;
            z-index: 1200 !important;
            height: 100vh !important;
            transition: transform 0.22s cubic-bezier(.71,.3,.48,.92);
          }
        }
        nav a.active {
          color: #e6dbb9;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
