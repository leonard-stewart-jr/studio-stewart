import Link from "next/link";

const navItems = [
  { label: "Portfolio", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "3D Printing", href: "/3d-printing" },
];

const socialLinks = [
  { label: "Email", href: "mailto:your@email.com" },
  { label: "GitHub", href: "https://github.com/leonard-stewart-jr" },
];

export default function Sidebar({ onClose, logoSize = 66, sidebarPaddingLeft = 22 }) {
  return (
    <div>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.22)",
          zIndex: 2000,
        }}
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 300,
          maxWidth: "80vw",
          height: "100vh",
          background: "#fff",
          color: "#181818",
          boxShadow: "2px 0 24px rgba(0,0,0,0.13)",
          zIndex: 2100,
          display: "flex",
          flexDirection: "column",
          padding: `0 ${sidebarPaddingLeft}px 22px ${sidebarPaddingLeft}px`,
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Logo aligned with nav links */}
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
          <img
            src="/assets/logo-mark-only.svg"
            alt="Logo"
            style={{
              width: logoSize,
              height: logoSize,
              objectFit: "contain",
              userSelect: "none",
              pointerEvents: "none",
              marginLeft: 0, // aligns to sidebar text
            }}
            draggable={false}
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
          }}
          aria-label="Close menu"
        >
          ×
        </button>
        {/* Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref legacyBehavior>
              <a
                style={{
                  color: "#181818",
                  fontWeight: 700,
                  fontSize: 22,
                  textDecoration: "none",
                  padding: "7px 0",
                  borderBottom: "1px solid #eee",
                  transition: "color 0.2s"
                }}
                onClick={onClose}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
        <div style={{ margin: "18px 0 8px 0", fontSize: 17, color: "#555" }}>
          <p>
            <b>Studio Stewart</b> — Digital portfolio<br />
            Creative developer, designer, and maker.<br />
            Explore my work and reach out to connect!
          </p>
        </div>
        <div style={{ marginTop: "auto" }}>
          <h3 style={{ fontSize: 17, margin: "10px 0 6px 0", color: "#181818" }}>Contact & Social</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {socialLinks.map(link => (
              <li key={link.href} style={{ marginBottom: 5 }}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#181818", textDecoration: "underline", fontSize: 15.5 }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
