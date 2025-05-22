import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import LogoHamburger from "./LogoHamburger";

const navItems = [
  { label: "PORTFOLIO", href: "/" },
  { label: "ABOUT ME", href: "/about" },
  { label: "3D PRINTING", href: "/3d-printing" },
];

const socialLinks = [
  { label: "Email", href: "mailto:your@email.com" },
  { label: "GitHub", href: "https://github.com/leonard-stewart-jr" },
];

export default function Sidebar({
  open,
  onClose,
  logoSize = 66,
  sidebarPaddingLeft = 22, // default preserved
}) {
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
        style={{
          display: open ? "block" : "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.32)",
          zIndex: 1300,
          transition: "background 0.2s",
        }}
      />
      <aside
        className={`sidebar${open ? " open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 300,
          maxWidth: "80vw",
          background: "#fff",
          boxShadow: "2px 0 16px 0 rgba(0,0,0,0.15)",
          zIndex: 1400,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.32s cubic-bezier(.7,.2,.3,1)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Hamburger logo as close button, animated */}
        {open && (
          <motion.div
            layoutId="logo-hamburger"
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              zIndex: 2200,
              cursor: "pointer",
            }}
          >
            <LogoHamburger
              logoSize={logoSize}
              sidebarPaddingLeft={sidebarPaddingLeft}
              onOpenSidebar={onClose}
            />
          </motion.div>
        )}
        {/* Navigation */}
        <nav
          className="sidebar-nav"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            marginTop: logoSize,
            paddingLeft: sidebarPaddingLeft,
            paddingRight: sidebarPaddingLeft,
          }}
        >
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
        <div className="sidebar-info" style={{ padding: "24px" }}>
          <p>
            <b>Studio Stewart</b> — Digital portfolio<br />
            Student, designer, and maker.<br />
            Explore my work and reach out to connect!
          </p>
        </div>
        <div className="sidebar-footer" style={{ padding: "0 24px 24px" }}>
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
