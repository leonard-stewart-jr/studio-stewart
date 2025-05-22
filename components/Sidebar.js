import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import LogoHamburger from "./LogoHamburger";
import styles from "../styles/sidebar.module.css";

const navItems = [
  { label: "PORTFOLIO", href: "/" },
  { label: "INDEPENDENT STUDIO", href: "/independent-studio" },
  { label: "3D PRINTING", href: "/3d-printing" },
  { label: "ABOUT ME", href: "/about" },
];

const socialLinks = [
  { label: "Email", href: "mailto:leonardwaynejr@icloud.com" },
  { label: "My Code Here", href: "https://github.com/leonard-stewart-jr" },
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

  // Prevent background scroll when sidebar is open
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

  // Sidebar animation variants for framer-motion
  const sidebarVariants = {
    closed: { x: "-100%", transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } },
    open:   { x: 0,      transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } }
  };
  const hamburgerTransition = { duration: 0.18, ease: "linear" };

  return (
    <>
      {/* Overlay uses AnimatePresence for smooth fade in/out */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
            onClick={onClose}
            aria-label="Close menu"
            className={styles.sidebarOverlay}
          />
        )}
      </AnimatePresence>
      <motion.aside
        className={`${styles.sidebar} ${open ? styles.open : ""}`}
        initial={false}
        animate={open ? "open" : "closed"}
        variants={sidebarVariants}
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
              right: 28,
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
          className={styles.sidebarNav}
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
                className={`${styles.sidebarNavLink} ${isActive(item.href) ? styles.active : ""}`}
                onClick={onClose}
              >
                {item.label}
              </a>
            </Link>
          ))}

          {/* Extra content for scrolling demonstration */}
          <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 1: Extra Links</div>
          {[...Array(15)].map((_, i) => (
            <a href="#" key={`extra-${i}`} style={{ color: "#888", fontSize: 13 }}>
              Example Link {i + 1}
            </a>
          ))}

          <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 2: Even more content</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {[...Array(10)].map((_, i) => (
              <li key={`more-${i}`}>
                <a href="#" style={{ color: "#b1b1ae", fontSize: 13 }}>
                  Item {i + 1}
                </a>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 3: Placeholder Section</div>
          <p style={{ fontSize: 13, color: "#888" }}>
            This section exists to make the sidebar content long enough to require scrolling on mobile and desktop. You can add or remove items as needed.
          </p>

          <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 4: Final Section</div>
          <p style={{ fontSize: 13, color: "#888" }}>
            If you can scroll this sidebar, the overflow-y: auto is working as intended.
          </p>
        </nav>
        <div className={styles.sidebarInfo} style={{ padding: "24px" }}>
          <p>
            <b>Studio Stewart</b> — Digital portfolio<br />
            Student, designer, and maker.<br />
            Explore my work and reach out to connect!
          </p>
        </div>
        <div className={styles.sidebarFooter} style={{ padding: "0 24px 24px" }}>
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
