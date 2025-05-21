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

export default function Sidebar({ onClose, logoSize = 80 }) {
  const sidebarPaddingLeft = 28;

  return (
    <div>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
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
          width: 320,
          maxWidth: "80vw",
          height: "100vh",
          background: "#fff",
          color: "#181818",
          boxShadow: "2px 0 24px rgba(0,0,0,0.17)",
          zIndex: 2100,
          display: "flex",
          flexDirection: "column",
          padding: `0 28px 28px 28px`,
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
            marginTop: "15px",
            marginBottom: "10px",
            minHeight: logoSize,
          }}
        >
          <img
            src="/logo.png"
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
            top: 24,
            right: 24,
            cursor: "pointer",
          }}
          aria-label="Close menu"
        >
          ×
        </button>
        {/* Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref legacyBehavior>
              <a
                style={{
                  color: "#181818",
                  fontWeight: 700,
                  fontSize: 24,
                  textDecoration: "none",
                  padding: "8px 0",
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
        <div style={{ margin: "30px 0 10px 0", fontSize: 18, color: "#555" }}>
          <p>
            <b>Studio Stewart</b> — Digital portfolio<br />
            Creative developer, designer, and maker. Explore my work and reach out to connect!
          </p>
        </div>
        <div style={{ marginTop: "auto" }}>
          <h3 style={{ fontSize: 18, margin: "12px 0 8px 0", color: "#181818" }}>Contact & Social</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {socialLinks.map(link => (
              <li key={link.href} style={{ marginBottom: 6 }}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#181818", textDecoration: "underline", fontSize: 16 }}
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
