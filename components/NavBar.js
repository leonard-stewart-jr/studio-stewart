import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const navItems = [
  { label: "Portfolio", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "3D Printing", href: "/3d-printing" },
];

const socialLinks = [
  { label: "Email", href: "mailto:your@email.com" },
  { label: "GitHub", href: "https://github.com/leonard-stewart-jr" },
  // Add more as needed
];

export default function NavBar() {
  const router = useRouter();
  const [logoHovered, setLogoHovered] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  // On mount, check for saved theme or system preference
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Change theme and save to localStorage
  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  }

  function handleLogoClick(e) {
    e.stopPropagation();
    setSidebarOpen(true);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  // Theme-dependent colors
  const isDark = theme === "dark";
  // const navBg = isDark ? "#111" : "#fff"; // not used anymore
  const navText = isDark ? "#f3f3f3" : "#151515";
  const barBg = isDark ? "#f3f3f3" : "#151515";
  const sidebarBg = isDark ? "#191a21" : "#fff";
  const sidebarText = isDark ? "#f3f3f3" : "#181818";
  const sidebarLink = isDark ? "#eaeaea" : "#151515";
  const overlayBg = isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.25)";

  return (
    <>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 5vw 24px 5vw",
          width: "100%",
          boxSizing: "border-box",
          background: "transparent", // <-- always transparent
          color: navText,
          transition: "background 0.25s, color 0.25s",
        }}
      >
        {/* Left: Logo + Title (entire area opens sidebar) */}
        <div
          style={{ display: "flex", alignItems: "center", minWidth: 0, cursor: "pointer" }}
          onClick={handleLogoClick}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") handleLogoClick(e);
          }}
          title="Open menu"
        >
          <span style={{ position: "relative", display: "inline-block", marginRight: 12, width: 44, height: 44 }}>
            {/* Logo image (color) */}
            <img
              src="/logo.png"
              alt="Studio Stewart Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                opacity: logoHovered ? 0 : 1,
                transition: "opacity 0.14s linear",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 2,
                pointerEvents: "none"
              }}
              className="logo"
            />
            {/* The bold animated bar */}
            <span
              style={{
                display: "block",
                width: logoHovered || sidebarOpen ? 44 : 0,
                height: logoHovered || sidebarOpen ? 8 : 0,
                background: barBg,
                borderRadius: 0,
                transition: "width 0.17s cubic-bezier(.85,.1,.2,1), height 0.16s cubic-bezier(.85,.1,.2,1), background 0.25s",
                position: "absolute",
                bottom: 18,
                left: 0,
                right: 0,
                margin: "auto",
                zIndex: 3,
                boxShadow: (logoHovered || sidebarOpen) ? "0 2px 10px rgba(0,0,0,0.10)" : "none"
              }}
              aria-hidden="true"
            />
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "0.03em",
              color: navText,
              textTransform: "uppercase",
              fontFamily: "'Futura', 'Open Sans', Helvetica, Arial, sans-serif",
              marginTop: 2,
              whiteSpace: "nowrap",
              transition: "color 0.25s",
            }}
          >
            Studio Stewart
          </span>
        </div>

        {/* Center: Navigation Tabs */}
        <div style={{
          display: "flex",
          gap: "36px",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginLeft: "-60px"
        }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref legacyBehavior>
              <a
                className="nav-link"
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  opacity: router.pathname === item.href ? 1 : 0.7,
                  borderBottom: router.pathname === item.href ? `2px solid ${navText}` : "none",
                  paddingBottom: 2,
                  transition: "opacity 0.2s, border-bottom 0.2s, color 0.25s",
                  color: navText,
                }}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </div>
        {/* Right: Spacer for symmetry */}
        <div style={{ width: 120 }} />
      </nav>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div>
          {/* Overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: overlayBg,
              zIndex: 2000,
              transition: "background 0.3s",
            }}
            onClick={closeSidebar}
            aria-label="Close menu"
          />
          {/* Sidebar itself */}
          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "25vw",
              minWidth: 260,
              maxWidth: 400,
              height: "100vh",
              background: sidebarBg,
              color: sidebarText,
              boxShadow: "2px 0 24px rgba(0,0,0,0.17)",
              zIndex: 2100,
              display: "flex",
              flexDirection: "column",
              padding: "44px 28px 28px 28px",
              transition: "background 0.25s, color 0.25s",
            }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={closeSidebar}
              style={{
                background: "none",
                border: "none",
                color: sidebarText,
                fontSize: 26,
                position: "absolute",
                top: 12,
                right: 24,
                cursor: "pointer",
                transition: "color 0.2s"
              }}
              aria-label="Close menu"
            >
              ×
            </button>
            <h2 style={{
              textTransform: "uppercase",
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "0.14em",
              margin: 0,
              marginBottom: 20,
              color: sidebarText
            }}>
              Portfolio Menu
            </h2>
            <nav style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref legacyBehavior>
                  <a
                    style={{
                      color: sidebarLink,
                      fontWeight: 700,
                      fontSize: 20,
                      textDecoration: "none",
                      padding: "6px 0",
                      borderBottom: isDark ? "1px solid #222" : "1px solid #eee",
                      transition: "color 0.2s"
                    }}
                    onClick={closeSidebar}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
            <div style={{ margin: "30px 0 10px 0", fontSize: 16, color: isDark ? "#b9b9b9" : "#555" }}>
              <p>
                <b>Studio Stewart</b> — Digital portfolio<br />
                Brief: Creative developer, designer, and maker. Explore my work and reach out to connect!
              </p>
            </div>
            <div style={{ marginTop: "auto" }}>
              <h3 style={{ fontSize: 16, margin: "12px 0 8px 0", color: sidebarText }}>Contact & Social</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {socialLinks.map(link => (
                  <li key={link.href} style={{ marginBottom: 4 }}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: sidebarLink, textDecoration: "underline", fontSize: 15 }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              {/* Dark mode toggle at bottom of sidebar */}
              <button
                onClick={toggleTheme}
                style={{
                  background: "none",
                  border: "1px solid",
                  borderColor: isDark ? "#555" : "#ccc",
                  color: sidebarText,
                  cursor: "pointer",
                  fontSize: 20,
                  padding: "8px 18px",
                  borderRadius: 8,
                  marginTop: 28,
                  width: "100%",
                  transition: "color 0.2s, background 0.2s, border-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
                aria-label="Toggle dark mode"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
