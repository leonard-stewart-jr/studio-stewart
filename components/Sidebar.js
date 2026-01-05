import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import LogoHamburger from "./LogoHamburger";
import styles from "../styles/sidebar.module.css";

const navItems = [
  { label: "PROJECTS", href: "/" },
  // Removed "INDEPENDENT STUDIO" from sidebar nav per request
  { label: "3D PRINTING", href: "/3d-printing" },
  { label: "MATTER MATTERS", href: "/matter-matters" },
  { label: "ABOUT ME", href: "/about" },
];

const socialLinks = [
  { label: "Email", href: "mailto:leonard.stewart@studio-stewart.com" },
  { label: "My Code Here", href: "https://github.com/leonard-stewart-jr" },
  // Replaced Issuu with on-site portfolio page
  { label: "UNDERGRADUATE PORTFOLIO", href: "/undergraduate-portfolio" },
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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebarVariants = {
    closed: { x: "-100%", transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } },
    open: { x: 0, transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="sidebar-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.aside
          className={`${styles.sidebar} ${open ? styles.open : ""}`}
          initial="closed"
          animate={open ? "open" : "closed"}
          exit="closed"
          variants={sidebarVariants}
          style={{ paddingLeft: sidebarPaddingLeft }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {open && (
            <button aria-label="Close menu" onClick={onClose}>
              ×
            </button>
          )}

          <div
            className={styles["logo-hamburger-wrap"]}
            style={{ marginTop: verticalOffset, marginBottom: 12 }}
          >
            <LogoHamburger logoSize={logoSize} onOpenSidebar={onClose} />
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sidebarNavLink} ${isActive(item.href) ? styles.active : ""}`}
              >
                {item.label}
              </Link>
            ))}

            {/* Existing placeholder/scrolling demo content retained */}
            <div style={{ marginTop: 18, color: "#666", fontSize: 13, textTransform: "uppercase" }}>
              Step 1: Extra Links
            </div>
            {[...Array(15)].map((_, i) => (
              <a key={`extralink-${i}`} className={styles.sidebarNavLink} href="#">
                Example Link {i + 1}
              </a>
            ))}

            <div style={{ marginTop: 18, color: "#666", fontSize: 13, textTransform: "uppercase" }}>
              Step 2: Even more content
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {[...Array(10)].map((_, i) => (
                <li key={`item-${i}`} style={{ marginBottom: 4 }}>
                  <a className={styles.sidebarNavLink} href="#">
                    Item {i + 1}
                  </a>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 18, color: "#666", fontSize: 13, textTransform: "uppercase" }}>
              Step 3: Placeholder Section
            </div>
            <p style={{ marginTop: 6 }}>
              This section exists to make the sidebar content long enough to require scrolling on mobile and desktop. You can add or remove items as needed.
            </p>

            <div style={{ marginTop: 18, color: "#666", fontSize: 13, textTransform: "uppercase" }}>
              Step 4: Final Section
            </div>
            <p style={{ marginTop: 6 }}>
              If you can scroll this sidebar, the overflow-y: auto is working as intended.
            </p>
          </nav>

          <div className="sidebar-info" style={{ marginTop: "auto" }}>
            <p>
              <b>Leonard Stewart</b> — Digital portfolio<br />
              Architecture Student, designer, and maker.<br />
              Explore my work and reach out to connect!
            </p>
          </div>

          <div className="sidebar-footer" style={{ marginTop: 8 }}>
            <h3>Other Links</h3>
            <ul>
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
}
