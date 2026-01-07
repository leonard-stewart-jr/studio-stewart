import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import LogoHamburger from "./LogoHamburger";

const navItems = [
  { label: "PORTFOLIO", href: "/" },
  { label: "INDEPENDENT STUDIO", href: "/independent-studio" },
  { label: "3D PRINTING", href: "/3d-printing" },
  { label: "ABOUT ME", href: "/about" },
];

const socialLinks = [
  { label: "Email", href: "mailto:your@email.com" },
  { label: "GitHub", href: "https://github.com/leonard-stewart-jr" },
];

export default function Sidebar({
  open,
  onClose,
  logoSize = 66,
  sidebarPaddingLeft = 22,
  headerHeight = 76,
}) {
  const router = useRouter();
  const verticalOffset = (headerHeight - logoSize) / 2 - 2;

  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(href + "/");
  }

  const sidebarVariants = {
    closed: { x: "-100%", transition: { duration: 0.48, ease: [0.7, 0.2, 0.3, 1] } },
    open:   { x: 0,      transition: { duration: 0.48, ease: [0.7, 0.2, 0.3, 1] } }
  };
  const hamburgerTransition = { duration: 0.18, ease: "linear" };

  return (
    <>
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
      <motion.aside
        className={`sidebar${open ? " open" : ""}`}
        initial="closed"
        animate={open ? "open" : "closed"}
        variants={sidebarVariants}
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
          display: "flex",
          flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {open && (
          <motion.div
            transition={hamburgerTransition}
            style={{
              position: "absolute",
              top: verticalOffset,
              right: 28, // Place close button where you want it on the sidebar
              zIndex: 2200,
              cursor: "pointer",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: "opacity 0.18s",
            }}
          >
            <LogoHamburger
              logoSize={logoSize}
              sidebarPaddingLeft={sidebarPaddingLeft}
              onOpenSidebar={onClose}
            />
          </motion.div>
        )}
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
      </motion.aside>
    </>
  );
}